-- Completely clean slate approach to fix RLS recursion
-- The key insight: whitelist table cannot use functions that query whitelist table

-- Step 1: Disable RLS temporarily to clean up
ALTER TABLE whitelist DISABLE ROW LEVEL SECURITY;
ALTER TABLE events DISABLE ROW LEVEL SECURITY;
ALTER TABLE event_categories DISABLE ROW LEVEL SECURITY;

-- Step 2: Drop ALL existing policies
DROP POLICY IF EXISTS "Authenticated users can view whitelist" ON whitelist;
DROP POLICY IF EXISTS "Admins can insert whitelist" ON whitelist;
DROP POLICY IF EXISTS "Admins can update whitelist" ON whitelist;
DROP POLICY IF EXISTS "Admins can delete whitelist" ON whitelist;
DROP POLICY IF EXISTS "whitelist_select" ON whitelist;
DROP POLICY IF EXISTS "whitelist_insert" ON whitelist;
DROP POLICY IF EXISTS "whitelist_update" ON whitelist;
DROP POLICY IF EXISTS "whitelist_delete" ON whitelist;

DROP POLICY IF EXISTS "Anyone can view events" ON events;
DROP POLICY IF EXISTS "Whitelisted users can insert events" ON events;
DROP POLICY IF EXISTS "Whitelisted users can update events" ON events;
DROP POLICY IF EXISTS "Whitelisted users can delete events" ON events;
DROP POLICY IF EXISTS "events_select" ON events;
DROP POLICY IF EXISTS "events_insert" ON events;
DROP POLICY IF EXISTS "events_update" ON events;
DROP POLICY IF EXISTS "events_delete" ON events;

DROP POLICY IF EXISTS "Anyone can view categories" ON event_categories;
DROP POLICY IF EXISTS "Whitelisted users can insert categories" ON event_categories;
DROP POLICY IF EXISTS "Whitelisted users can update categories" ON event_categories;
DROP POLICY IF EXISTS "Whitelisted users can delete categories" ON event_categories;
DROP POLICY IF EXISTS "categories_select" ON event_categories;
DROP POLICY IF EXISTS "categories_insert" ON event_categories;
DROP POLICY IF EXISTS "categories_update" ON event_categories;
DROP POLICY IF EXISTS "categories_delete" ON event_categories;

-- Step 3: Drop all helper functions
DROP FUNCTION IF EXISTS is_user_whitelisted() CASCADE;
DROP FUNCTION IF EXISTS is_user_admin() CASCADE;
DROP FUNCTION IF EXISTS get_user_role() CASCADE;
DROP FUNCTION IF EXISTS is_user_whitelisted(uuid) CASCADE;
DROP FUNCTION IF EXISTS is_user_admin(uuid) CASCADE;
DROP FUNCTION IF EXISTS get_user_role(uuid) CASCADE;
DROP FUNCTION IF EXISTS check_whitelist_status(uuid) CASCADE;
DROP FUNCTION IF EXISTS check_admin_status(uuid) CASCADE;

-- Step 4: Create helper functions with SECURITY DEFINER
-- These run as the function owner, bypassing RLS completely

CREATE OR REPLACE FUNCTION public.check_whitelist_status(user_uuid uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM whitelist WHERE user_id = user_uuid
  );
$$;

CREATE OR REPLACE FUNCTION public.check_admin_status(user_uuid uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM whitelist WHERE user_id = user_uuid AND role = 'admin'
  );
$$;

CREATE OR REPLACE FUNCTION public.get_whitelist_role(user_uuid uuid)
RETURNS text
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT role FROM whitelist WHERE user_id = user_uuid LIMIT 1;
$$;

-- Step 5: Re-enable RLS
ALTER TABLE whitelist ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_categories ENABLE ROW LEVEL SECURITY;

-- Step 6: Create simple, non-recursive policies

-- WHITELIST TABLE POLICIES
-- For the whitelist table, we CANNOT use check_whitelist_status or check_admin_status
-- because those query the whitelist table itself, causing recursion
-- Instead: allow all authenticated to read, and use a subquery for writes

CREATE POLICY "whitelist_select_policy" ON whitelist
  FOR SELECT TO authenticated
  USING (true);

-- For insert/update/delete on whitelist, we need a different approach
-- We'll check admin status by doing a direct subquery that won't recurse
-- because the SELECT policy allows reading
CREATE POLICY "whitelist_insert_policy" ON whitelist
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM whitelist w 
      WHERE w.user_id = auth.uid() AND w.role = 'admin'
    )
  );

CREATE POLICY "whitelist_update_policy" ON whitelist
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM whitelist w 
      WHERE w.user_id = auth.uid() AND w.role = 'admin'
    )
  );

CREATE POLICY "whitelist_delete_policy" ON whitelist
  FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM whitelist w 
      WHERE w.user_id = auth.uid() AND w.role = 'admin'
    )
  );

-- EVENTS TABLE POLICIES
-- These CAN use the helper functions since they don't query the events table
CREATE POLICY "events_select_policy" ON events
  FOR SELECT
  USING (true);

CREATE POLICY "events_insert_policy" ON events
  FOR INSERT TO authenticated
  WITH CHECK (check_whitelist_status(auth.uid()));

CREATE POLICY "events_update_policy" ON events
  FOR UPDATE TO authenticated
  USING (check_whitelist_status(auth.uid()));

CREATE POLICY "events_delete_policy" ON events
  FOR DELETE TO authenticated
  USING (check_whitelist_status(auth.uid()));

-- EVENT_CATEGORIES TABLE POLICIES
CREATE POLICY "categories_select_policy" ON event_categories
  FOR SELECT
  USING (true);

CREATE POLICY "categories_insert_policy" ON event_categories
  FOR INSERT TO authenticated
  WITH CHECK (check_whitelist_status(auth.uid()));

CREATE POLICY "categories_update_policy" ON event_categories
  FOR UPDATE TO authenticated
  USING (check_whitelist_status(auth.uid()));

CREATE POLICY "categories_delete_policy" ON event_categories
  FOR DELETE TO authenticated
  USING (check_whitelist_status(auth.uid()));

-- Grant execute on functions to authenticated users
GRANT EXECUTE ON FUNCTION public.check_whitelist_status(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.check_admin_status(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_whitelist_role(uuid) TO authenticated;

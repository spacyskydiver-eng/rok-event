-- Fix infinite recursion in whitelist RLS policies
-- The issue is that checking whitelist status itself triggers RLS on whitelist table

-- Drop existing policies
DROP POLICY IF EXISTS "Anyone can view whitelist" ON whitelist;
DROP POLICY IF EXISTS "Admins can insert whitelist" ON whitelist;
DROP POLICY IF EXISTS "Admins can delete whitelist" ON whitelist;

-- Drop and recreate the helper functions with SECURITY DEFINER to bypass RLS
DROP FUNCTION IF EXISTS is_user_whitelisted() CASCADE;
DROP FUNCTION IF EXISTS is_user_admin() CASCADE;
DROP FUNCTION IF EXISTS get_user_role() CASCADE;
DROP FUNCTION IF EXISTS is_user_whitelisted(uuid) CASCADE;
DROP FUNCTION IF EXISTS is_user_admin(uuid) CASCADE;
DROP FUNCTION IF EXISTS get_user_role(uuid) CASCADE;

-- Create a function that checks whitelist WITHOUT triggering RLS (SECURITY DEFINER)
CREATE OR REPLACE FUNCTION is_user_whitelisted()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM whitelist WHERE user_id = auth.uid()
  );
$$;

-- Create a function to check if user is admin WITHOUT triggering RLS
CREATE OR REPLACE FUNCTION is_user_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM whitelist WHERE user_id = auth.uid() AND role = 'admin'
  );
$$;

-- Create function to get user role WITHOUT triggering RLS
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS text
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT role FROM whitelist WHERE user_id = auth.uid() LIMIT 1;
$$;

-- Drop additional policies that may exist
DROP POLICY IF EXISTS "Authenticated users can view whitelist" ON whitelist;

-- Recreate whitelist policies using the SECURITY DEFINER functions
-- Anyone authenticated can view whitelist (but only admins see the UI)
CREATE POLICY "Authenticated users can view whitelist"
  ON whitelist FOR SELECT
  TO authenticated
  USING (true);

-- Only admins can insert into whitelist
CREATE POLICY "Admins can insert whitelist"
  ON whitelist FOR INSERT
  TO authenticated
  WITH CHECK (is_user_admin());

-- Only admins can delete from whitelist
CREATE POLICY "Admins can delete whitelist"
  ON whitelist FOR DELETE
  TO authenticated
  USING (is_user_admin());

-- Also fix event and category policies to use the new functions
DROP POLICY IF EXISTS "Anyone can view events" ON events;
DROP POLICY IF EXISTS "Whitelisted users can insert events" ON events;
DROP POLICY IF EXISTS "Whitelisted users can update events" ON events;
DROP POLICY IF EXISTS "Whitelisted users can delete events" ON events;

CREATE POLICY "Anyone can view events"
  ON events FOR SELECT
  USING (true);

CREATE POLICY "Whitelisted users can insert events"
  ON events FOR INSERT
  TO authenticated
  WITH CHECK (is_user_whitelisted());

CREATE POLICY "Whitelisted users can update events"
  ON events FOR UPDATE
  TO authenticated
  USING (is_user_whitelisted());

CREATE POLICY "Whitelisted users can delete events"
  ON events FOR DELETE
  TO authenticated
  USING (is_user_whitelisted());

-- Fix category policies
DROP POLICY IF EXISTS "Anyone can view categories" ON event_categories;
DROP POLICY IF EXISTS "Whitelisted users can insert categories" ON event_categories;
DROP POLICY IF EXISTS "Whitelisted users can delete categories" ON event_categories;

CREATE POLICY "Anyone can view categories"
  ON event_categories FOR SELECT
  USING (true);

CREATE POLICY "Whitelisted users can insert categories"
  ON event_categories FOR INSERT
  TO authenticated
  WITH CHECK (is_user_whitelisted());

CREATE POLICY "Whitelisted users can delete categories"
  ON event_categories FOR DELETE
  TO authenticated
  USING (is_user_whitelisted());

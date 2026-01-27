-- FULL RESET: Drop everything and start fresh with simple non-recursive RLS

-- Drop all existing tables (CASCADE will drop policies and dependencies)
DROP TABLE IF EXISTS events CASCADE;
DROP TABLE IF EXISTS event_categories CASCADE;
DROP TABLE IF EXISTS whitelist CASCADE;

-- Drop all existing functions
DROP FUNCTION IF EXISTS is_user_whitelisted() CASCADE;
DROP FUNCTION IF EXISTS is_user_admin() CASCADE;
DROP FUNCTION IF EXISTS get_user_role() CASCADE;
DROP FUNCTION IF EXISTS is_user_whitelisted(uuid) CASCADE;
DROP FUNCTION IF EXISTS is_user_admin(uuid) CASCADE;
DROP FUNCTION IF EXISTS get_user_role(uuid) CASCADE;
DROP FUNCTION IF EXISTS check_whitelist(uuid) CASCADE;
DROP FUNCTION IF EXISTS check_admin(uuid) CASCADE;

-- ============================================
-- CREATE TABLES
-- ============================================

-- Whitelist table - stores users who can edit
CREATE TABLE whitelist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'editor' CHECK (role IN ('editor', 'admin')),
  added_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Event categories table
CREATE TABLE event_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  color TEXT NOT NULL DEFAULT '#3B82F6',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Events table
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  start_day INTEGER NOT NULL CHECK (start_day >= 1 AND start_day <= 130),
  end_day INTEGER NOT NULL CHECK (end_day >= 1 AND end_day <= 130),
  category_id UUID REFERENCES event_categories(id) ON DELETE SET NULL,
  description TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CHECK (end_day >= start_day)
);

-- ============================================
-- HELPER FUNCTIONS (SECURITY DEFINER - bypasses RLS)
-- ============================================

-- Check if a user is whitelisted (does NOT use RLS)
CREATE OR REPLACE FUNCTION check_whitelist(check_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM whitelist WHERE user_id = check_user_id
  );
$$;

-- Check if a user is admin (does NOT use RLS)
CREATE OR REPLACE FUNCTION check_admin(check_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM whitelist WHERE user_id = check_user_id AND role = 'admin'
  );
$$;

-- ============================================
-- ENABLE RLS
-- ============================================

ALTER TABLE whitelist ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- ============================================
-- WHITELIST POLICIES
-- Simple: everyone can read, only admins can write
-- ============================================

-- Anyone can view (no recursion - just allows all authenticated)
CREATE POLICY "whitelist_select" ON whitelist
  FOR SELECT TO authenticated
  USING (true);

-- Only admins can insert (uses SECURITY DEFINER function)
CREATE POLICY "whitelist_insert" ON whitelist
  FOR INSERT TO authenticated
  WITH CHECK (check_admin(auth.uid()));

-- Only admins can delete
CREATE POLICY "whitelist_delete" ON whitelist
  FOR DELETE TO authenticated
  USING (check_admin(auth.uid()));

-- ============================================
-- EVENT CATEGORIES POLICIES
-- Anyone can read, whitelisted can write
-- ============================================

CREATE POLICY "categories_select" ON event_categories
  FOR SELECT TO authenticated
  USING (true);

-- Allow anonymous/public read too
CREATE POLICY "categories_select_anon" ON event_categories
  FOR SELECT TO anon
  USING (true);

CREATE POLICY "categories_insert" ON event_categories
  FOR INSERT TO authenticated
  WITH CHECK (check_whitelist(auth.uid()));

CREATE POLICY "categories_update" ON event_categories
  FOR UPDATE TO authenticated
  USING (check_whitelist(auth.uid()));

CREATE POLICY "categories_delete" ON event_categories
  FOR DELETE TO authenticated
  USING (check_whitelist(auth.uid()));

-- ============================================
-- EVENTS POLICIES
-- Anyone can read, whitelisted can write
-- ============================================

CREATE POLICY "events_select" ON events
  FOR SELECT TO authenticated
  USING (true);

-- Allow anonymous/public read too
CREATE POLICY "events_select_anon" ON events
  FOR SELECT TO anon
  USING (true);

CREATE POLICY "events_insert" ON events
  FOR INSERT TO authenticated
  WITH CHECK (check_whitelist(auth.uid()));

CREATE POLICY "events_update" ON events
  FOR UPDATE TO authenticated
  USING (check_whitelist(auth.uid()));

CREATE POLICY "events_delete" ON events
  FOR DELETE TO authenticated
  USING (check_whitelist(auth.uid()));

-- ============================================
-- CREATE INDEXES
-- ============================================

CREATE INDEX idx_events_days ON events(start_day, end_day);
CREATE INDEX idx_events_category ON events(category_id);
CREATE INDEX idx_whitelist_user ON whitelist(user_id);

-- Complete setup script - creates all tables, functions, and policies from scratch

-- Drop existing tables if they exist (in correct order for foreign keys)
DROP TABLE IF EXISTS bundle_tier_cells CASCADE;
DROP TABLE IF EXISTS bundle_tier_columns CASCADE;
DROP TABLE IF EXISTS bundle_tiers CASCADE;
DROP TABLE IF EXISTS bundles CASCADE;
DROP TABLE IF EXISTS events CASCADE;
DROP TABLE IF EXISTS event_categories CASCADE;
DROP TABLE IF EXISTS whitelist CASCADE;

-- Drop existing functions
DROP FUNCTION IF EXISTS check_is_admin() CASCADE;
DROP FUNCTION IF EXISTS check_is_whitelisted() CASCADE;

-- ============================================
-- HELPER FUNCTIONS (SECURITY DEFINER)
-- ============================================

-- Function to check if current user is an admin
CREATE OR REPLACE FUNCTION check_is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM whitelist 
    WHERE user_id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if current user is whitelisted (admin or editor)
CREATE OR REPLACE FUNCTION check_is_whitelisted()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM whitelist 
    WHERE user_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- WHITELIST TABLE
-- ============================================

CREATE TABLE whitelist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'editor' CHECK (role IN ('admin', 'editor')),
  added_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

ALTER TABLE whitelist ENABLE ROW LEVEL SECURITY;

-- Everyone can read whitelist (app needs this to check permissions)
CREATE POLICY "whitelist_select_all" ON whitelist
  FOR SELECT TO authenticated
  USING (true);

-- Only admins can insert to whitelist
CREATE POLICY "whitelist_insert_admin" ON whitelist
  FOR INSERT TO authenticated
  WITH CHECK (check_is_admin());

-- Only admins can delete from whitelist
CREATE POLICY "whitelist_delete_admin" ON whitelist
  FOR DELETE TO authenticated
  USING (check_is_admin());

-- ============================================
-- EVENT CATEGORIES TABLE
-- ============================================

CREATE TABLE event_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  color TEXT NOT NULL DEFAULT '#3b82f6',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE event_categories ENABLE ROW LEVEL SECURITY;

-- Everyone can read categories
CREATE POLICY "categories_select_public" ON event_categories
  FOR SELECT TO anon, authenticated
  USING (true);

-- Whitelisted users can manage categories
CREATE POLICY "categories_insert_whitelisted" ON event_categories
  FOR INSERT TO authenticated
  WITH CHECK (check_is_whitelisted());

CREATE POLICY "categories_update_whitelisted" ON event_categories
  FOR UPDATE TO authenticated
  USING (check_is_whitelisted());

CREATE POLICY "categories_delete_whitelisted" ON event_categories
  FOR DELETE TO authenticated
  USING (check_is_whitelisted());

-- ============================================
-- EVENTS TABLE
-- ============================================

CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  start_day INTEGER NOT NULL CHECK (start_day >= 1 AND start_day <= 130),
  end_day INTEGER NOT NULL CHECK (end_day >= 1 AND end_day <= 130),
  category_id UUID REFERENCES event_categories(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  CONSTRAINT events_day_range CHECK (end_day >= start_day)
);

ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- Everyone can read events
CREATE POLICY "events_select_public" ON events
  FOR SELECT TO anon, authenticated
  USING (true);

-- Whitelisted users can manage events
CREATE POLICY "events_insert_whitelisted" ON events
  FOR INSERT TO authenticated
  WITH CHECK (check_is_whitelisted());

CREATE POLICY "events_update_whitelisted" ON events
  FOR UPDATE TO authenticated
  USING (check_is_whitelisted());

CREATE POLICY "events_delete_whitelisted" ON events
  FOR DELETE TO authenticated
  USING (check_is_whitelisted());

-- ============================================
-- BUNDLES TABLE (for shop bundles)
-- ============================================

CREATE TABLE bundles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  start_day INTEGER NOT NULL CHECK (start_day >= 1 AND start_day <= 130),
  end_day INTEGER NOT NULL CHECK (end_day >= 1 AND end_day <= 130),
  show_on_calendar BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  CONSTRAINT bundles_day_range CHECK (end_day >= start_day)
);

ALTER TABLE bundles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "bundles_select_public" ON bundles
  FOR SELECT TO anon, authenticated
  USING (true);

CREATE POLICY "bundles_insert_whitelisted" ON bundles
  FOR INSERT TO authenticated
  WITH CHECK (check_is_whitelisted());

CREATE POLICY "bundles_update_whitelisted" ON bundles
  FOR UPDATE TO authenticated
  USING (check_is_whitelisted());

CREATE POLICY "bundles_delete_whitelisted" ON bundles
  FOR DELETE TO authenticated
  USING (check_is_whitelisted());

-- ============================================
-- BUNDLE TIER COLUMNS (column definitions)
-- ============================================

CREATE TABLE bundle_tier_columns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bundle_id UUID NOT NULL REFERENCES bundles(id) ON DELETE CASCADE,
  column_name TEXT NOT NULL,
  column_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE bundle_tier_columns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "bundle_tier_columns_select_public" ON bundle_tier_columns
  FOR SELECT TO anon, authenticated
  USING (true);

CREATE POLICY "bundle_tier_columns_insert_whitelisted" ON bundle_tier_columns
  FOR INSERT TO authenticated
  WITH CHECK (check_is_whitelisted());

CREATE POLICY "bundle_tier_columns_update_whitelisted" ON bundle_tier_columns
  FOR UPDATE TO authenticated
  USING (check_is_whitelisted());

CREATE POLICY "bundle_tier_columns_delete_whitelisted" ON bundle_tier_columns
  FOR DELETE TO authenticated
  USING (check_is_whitelisted());

-- ============================================
-- BUNDLE TIERS (rows in the tier table)
-- ============================================

CREATE TABLE bundle_tiers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bundle_id UUID NOT NULL REFERENCES bundles(id) ON DELETE CASCADE,
  tier_name TEXT NOT NULL DEFAULT 'Tier',
  tier_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE bundle_tiers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "bundle_tiers_select_public" ON bundle_tiers
  FOR SELECT TO anon, authenticated
  USING (true);

CREATE POLICY "bundle_tiers_insert_whitelisted" ON bundle_tiers
  FOR INSERT TO authenticated
  WITH CHECK (check_is_whitelisted());

CREATE POLICY "bundle_tiers_update_whitelisted" ON bundle_tiers
  FOR UPDATE TO authenticated
  USING (check_is_whitelisted());

CREATE POLICY "bundle_tiers_delete_whitelisted" ON bundle_tiers
  FOR DELETE TO authenticated
  USING (check_is_whitelisted());

-- ============================================
-- BUNDLE TIER CELLS (cell values)
-- ============================================

CREATE TABLE bundle_tier_cells (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tier_id UUID NOT NULL REFERENCES bundle_tiers(id) ON DELETE CASCADE,
  column_id UUID NOT NULL REFERENCES bundle_tier_columns(id) ON DELETE CASCADE,
  value TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(tier_id, column_id)
);

ALTER TABLE bundle_tier_cells ENABLE ROW LEVEL SECURITY;

CREATE POLICY "bundle_tier_cells_select_public" ON bundle_tier_cells
  FOR SELECT TO anon, authenticated
  USING (true);

CREATE POLICY "bundle_tier_cells_insert_whitelisted" ON bundle_tier_cells
  FOR INSERT TO authenticated
  WITH CHECK (check_is_whitelisted());

CREATE POLICY "bundle_tier_cells_update_whitelisted" ON bundle_tier_cells
  FOR UPDATE TO authenticated
  USING (check_is_whitelisted());

CREATE POLICY "bundle_tier_cells_delete_whitelisted" ON bundle_tier_cells
  FOR DELETE TO authenticated
  USING (check_is_whitelisted());

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX idx_events_days ON events(start_day, end_day);
CREATE INDEX idx_events_category ON events(category_id);
CREATE INDEX idx_bundles_days ON bundles(start_day, end_day);
CREATE INDEX idx_bundle_tiers_bundle ON bundle_tiers(bundle_id);
CREATE INDEX idx_bundle_tier_columns_bundle ON bundle_tier_columns(bundle_id);
CREATE INDEX idx_bundle_tier_cells_tier ON bundle_tier_cells(tier_id);
CREATE INDEX idx_bundle_tier_cells_column ON bundle_tier_cells(column_id);
CREATE INDEX idx_whitelist_user ON whitelist(user_id);

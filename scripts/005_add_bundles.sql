-- Add bundles table for in-game shop bundles
CREATE TABLE IF NOT EXISTS bundles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  start_day INTEGER NOT NULL CHECK (start_day >= 1 AND start_day <= 130),
  end_day INTEGER NOT NULL CHECK (end_day >= 1 AND end_day <= 130),
  category_id UUID REFERENCES event_categories(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  CONSTRAINT bundles_day_range CHECK (end_day >= start_day)
);

-- Add bundle_tiers table for customizable reward tables
CREATE TABLE IF NOT EXISTS bundle_tiers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bundle_id UUID NOT NULL REFERENCES bundles(id) ON DELETE CASCADE,
  tier_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add bundle_tier_columns table for dynamic columns
CREATE TABLE IF NOT EXISTS bundle_tier_columns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bundle_id UUID NOT NULL REFERENCES bundles(id) ON DELETE CASCADE,
  column_name TEXT NOT NULL,
  column_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add bundle_tier_cells table for cell values
CREATE TABLE IF NOT EXISTS bundle_tier_cells (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tier_id UUID NOT NULL REFERENCES bundle_tiers(id) ON DELETE CASCADE,
  column_id UUID NOT NULL REFERENCES bundle_tier_columns(id) ON DELETE CASCADE,
  value TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(tier_id, column_id)
);

-- Enable RLS on all bundle tables
ALTER TABLE bundles ENABLE ROW LEVEL SECURITY;
ALTER TABLE bundle_tiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE bundle_tier_columns ENABLE ROW LEVEL SECURITY;
ALTER TABLE bundle_tier_cells ENABLE ROW LEVEL SECURITY;

-- Bundles policies (same pattern as events)
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

-- Bundle tiers policies
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

-- Bundle tier columns policies
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

-- Bundle tier cells policies
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

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_bundles_days ON bundles(start_day, end_day);
CREATE INDEX IF NOT EXISTS idx_bundle_tiers_bundle ON bundle_tiers(bundle_id);
CREATE INDEX IF NOT EXISTS idx_bundle_tier_columns_bundle ON bundle_tier_columns(bundle_id);
CREATE INDEX IF NOT EXISTS idx_bundle_tier_cells_tier ON bundle_tier_cells(tier_id);
CREATE INDEX IF NOT EXISTS idx_bundle_tier_cells_column ON bundle_tier_cells(column_id);

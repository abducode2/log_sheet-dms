
-- Add revision tracking to material_submittals
ALTER TABLE material_submittals ADD COLUMN IF NOT EXISTS parent_id UUID REFERENCES material_submittals(id);
ALTER TABLE material_submittals ADD COLUMN IF NOT EXISTS is_archived BOOLEAN DEFAULT false;
ALTER TABLE material_submittals ADD COLUMN IF NOT EXISTS revision_count INTEGER DEFAULT 0;
ALTER TABLE material_submittals ADD COLUMN IF NOT EXISTS no INTEGER;
ALTER TABLE material_submittals ADD COLUMN IF NOT EXISTS approval_date DATE;
ALTER TABLE material_submittals ADD COLUMN IF NOT EXISTS v_time INTEGER;
CREATE INDEX IF NOT EXISTS idx_material_submittals_parent ON material_submittals(parent_id);

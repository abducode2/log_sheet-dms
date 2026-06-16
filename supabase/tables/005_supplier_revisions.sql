
ALTER TABLE supplier_prequalifications ADD COLUMN IF NOT EXISTS parent_id UUID REFERENCES supplier_prequalifications(id);
ALTER TABLE supplier_prequalifications ADD COLUMN IF NOT EXISTS is_archived BOOLEAN DEFAULT false;
ALTER TABLE supplier_prequalifications ADD COLUMN IF NOT EXISTS revision_count INTEGER DEFAULT 0;
ALTER TABLE supplier_prequalifications ADD COLUMN IF NOT EXISTS no INTEGER;
ALTER TABLE supplier_prequalifications ADD COLUMN IF NOT EXISTS rev INTEGER DEFAULT 0;
ALTER TABLE supplier_prequalifications ADD COLUMN IF NOT EXISTS approval_date DATE;
ALTER TABLE supplier_prequalifications ADD COLUMN IF NOT EXISTS v_time INTEGER;
ALTER TABLE supplier_prequalifications ADD COLUMN IF NOT EXISTS element TEXT DEFAULT 'GEN';
CREATE INDEX IF NOT EXISTS idx_supplier_parent ON supplier_prequalifications(parent_id);

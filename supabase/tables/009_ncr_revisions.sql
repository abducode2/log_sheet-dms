
ALTER TABLE non_conformance_reports ADD COLUMN IF NOT EXISTS parent_id UUID REFERENCES non_conformance_reports(id);
ALTER TABLE non_conformance_reports ADD COLUMN IF NOT EXISTS is_archived BOOLEAN DEFAULT false;
ALTER TABLE non_conformance_reports ADD COLUMN IF NOT EXISTS revision_count INTEGER DEFAULT 0;
ALTER TABLE non_conformance_reports ADD COLUMN IF NOT EXISTS no INTEGER;
ALTER TABLE non_conformance_reports ADD COLUMN IF NOT EXISTS rev INTEGER DEFAULT 0;
ALTER TABLE non_conformance_reports ADD COLUMN IF NOT EXISTS element TEXT DEFAULT 'GEN';
ALTER TABLE non_conformance_reports ADD COLUMN IF NOT EXISTS ac_co TEXT DEFAULT 'P';
ALTER TABLE non_conformance_reports ADD COLUMN IF NOT EXISTS approval_date DATE;
ALTER TABLE non_conformance_reports ADD COLUMN IF NOT EXISTS v_time INTEGER;
ALTER TABLE non_conformance_reports ADD COLUMN IF NOT EXISTS ncr_no TEXT;
CREATE INDEX IF NOT EXISTS idx_ncr_parent ON non_conformance_reports(parent_id);

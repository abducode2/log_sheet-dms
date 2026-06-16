
ALTER TABLE requests_for_information ADD COLUMN IF NOT EXISTS parent_id UUID REFERENCES requests_for_information(id);
ALTER TABLE requests_for_information ADD COLUMN IF NOT EXISTS is_archived BOOLEAN DEFAULT false;
ALTER TABLE requests_for_information ADD COLUMN IF NOT EXISTS revision_count INTEGER DEFAULT 0;
ALTER TABLE requests_for_information ADD COLUMN IF NOT EXISTS no INTEGER;
ALTER TABLE requests_for_information ADD COLUMN IF NOT EXISTS rev INTEGER DEFAULT 0;
ALTER TABLE requests_for_information ADD COLUMN IF NOT EXISTS element TEXT DEFAULT 'GEN';
ALTER TABLE requests_for_information ADD COLUMN IF NOT EXISTS ac_co TEXT DEFAULT 'P';
ALTER TABLE requests_for_information ADD COLUMN IF NOT EXISTS approval_date DATE;
ALTER TABLE requests_for_information ADD COLUMN IF NOT EXISTS v_time INTEGER;
ALTER TABLE requests_for_information ADD COLUMN IF NOT EXISTS rfi_no TEXT;
ALTER TABLE requests_for_information ADD COLUMN IF NOT EXISTS subject TEXT;
CREATE INDEX IF NOT EXISTS idx_rfi_parent ON requests_for_information(parent_id);

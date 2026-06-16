
ALTER TABLE concrete_pour_requests ADD COLUMN IF NOT EXISTS parent_id UUID REFERENCES concrete_pour_requests(id);
ALTER TABLE concrete_pour_requests ADD COLUMN IF NOT EXISTS is_archived BOOLEAN DEFAULT false;
ALTER TABLE concrete_pour_requests ADD COLUMN IF NOT EXISTS revision_count INTEGER DEFAULT 0;
ALTER TABLE concrete_pour_requests ADD COLUMN IF NOT EXISTS no INTEGER;
ALTER TABLE concrete_pour_requests ADD COLUMN IF NOT EXISTS rev INTEGER DEFAULT 0;
ALTER TABLE concrete_pour_requests ADD COLUMN IF NOT EXISTS element TEXT DEFAULT 'SC';
ALTER TABLE concrete_pour_requests ADD COLUMN IF NOT EXISTS ac_co TEXT DEFAULT 'P';
ALTER TABLE concrete_pour_requests ADD COLUMN IF NOT EXISTS approval_date DATE;
ALTER TABLE concrete_pour_requests ADD COLUMN IF NOT EXISTS v_time INTEGER;
ALTER TABLE concrete_pour_requests ADD COLUMN IF NOT EXISTS cpr_no TEXT;
CREATE INDEX IF NOT EXISTS idx_cpr_parent ON concrete_pour_requests(parent_id);

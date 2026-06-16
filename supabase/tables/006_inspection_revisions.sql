
ALTER TABLE inspection_requests ADD COLUMN IF NOT EXISTS parent_id UUID REFERENCES inspection_requests(id);
ALTER TABLE inspection_requests ADD COLUMN IF NOT EXISTS is_archived BOOLEAN DEFAULT false;
ALTER TABLE inspection_requests ADD COLUMN IF NOT EXISTS revision_count INTEGER DEFAULT 0;
ALTER TABLE inspection_requests ADD COLUMN IF NOT EXISTS no INTEGER;
ALTER TABLE inspection_requests ADD COLUMN IF NOT EXISTS rev INTEGER DEFAULT 0;
ALTER TABLE inspection_requests ADD COLUMN IF NOT EXISTS v_time INTEGER;
ALTER TABLE inspection_requests ADD COLUMN IF NOT EXISTS element TEXT DEFAULT 'GEN';
ALTER TABLE inspection_requests ADD COLUMN IF NOT EXISTS approval_date DATE;
CREATE INDEX IF NOT EXISTS idx_inspection_parent ON inspection_requests(parent_id);

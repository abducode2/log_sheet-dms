
-- Letters Rawaf → Naga
ALTER TABLE letters_rawaf_naga ADD COLUMN IF NOT EXISTS parent_id UUID REFERENCES letters_rawaf_naga(id);
ALTER TABLE letters_rawaf_naga ADD COLUMN IF NOT EXISTS is_archived BOOLEAN DEFAULT false;
ALTER TABLE letters_rawaf_naga ADD COLUMN IF NOT EXISTS revision_count INTEGER DEFAULT 0;
ALTER TABLE letters_rawaf_naga ADD COLUMN IF NOT EXISTS rev INTEGER DEFAULT 0;
ALTER TABLE letters_rawaf_naga ADD COLUMN IF NOT EXISTS element TEXT DEFAULT 'GEN';
ALTER TABLE letters_rawaf_naga ADD COLUMN IF NOT EXISTS ac_co TEXT DEFAULT 'P';
ALTER TABLE letters_rawaf_naga ADD COLUMN IF NOT EXISTS approval_date DATE;
ALTER TABLE letters_rawaf_naga ADD COLUMN IF NOT EXISTS v_time INTEGER;
ALTER TABLE letters_rawaf_naga ADD COLUMN IF NOT EXISTS subject TEXT;
CREATE INDEX IF NOT EXISTS idx_rwf_nag_parent ON letters_rawaf_naga(parent_id);

-- Letters Naga → Rawaf
ALTER TABLE letters_naga_rawaf ADD COLUMN IF NOT EXISTS parent_id UUID REFERENCES letters_naga_rawaf(id);
ALTER TABLE letters_naga_rawaf ADD COLUMN IF NOT EXISTS is_archived BOOLEAN DEFAULT false;
ALTER TABLE letters_naga_rawaf ADD COLUMN IF NOT EXISTS revision_count INTEGER DEFAULT 0;
ALTER TABLE letters_naga_rawaf ADD COLUMN IF NOT EXISTS rev INTEGER DEFAULT 0;
ALTER TABLE letters_naga_rawaf ADD COLUMN IF NOT EXISTS element TEXT DEFAULT 'GEN';
ALTER TABLE letters_naga_rawaf ADD COLUMN IF NOT EXISTS ac_co TEXT DEFAULT 'P';
ALTER TABLE letters_naga_rawaf ADD COLUMN IF NOT EXISTS approval_date DATE;
ALTER TABLE letters_naga_rawaf ADD COLUMN IF NOT EXISTS v_time INTEGER;
ALTER TABLE letters_naga_rawaf ADD COLUMN IF NOT EXISTS subject TEXT;
CREATE INDEX IF NOT EXISTS idx_nag_rwf_parent ON letters_naga_rawaf(parent_id);


ALTER TABLE document_transmittals ADD COLUMN IF NOT EXISTS parent_id UUID REFERENCES document_transmittals(id);
ALTER TABLE document_transmittals ADD COLUMN IF NOT EXISTS is_archived BOOLEAN DEFAULT false;
ALTER TABLE document_transmittals ADD COLUMN IF NOT EXISTS revision_count INTEGER DEFAULT 0;
ALTER TABLE document_transmittals ADD COLUMN IF NOT EXISTS no INTEGER;
ALTER TABLE document_transmittals ADD COLUMN IF NOT EXISTS rev INTEGER DEFAULT 0;
ALTER TABLE document_transmittals ADD COLUMN IF NOT EXISTS element TEXT DEFAULT 'GEN';
ALTER TABLE document_transmittals ADD COLUMN IF NOT EXISTS ac_co TEXT DEFAULT 'P';
ALTER TABLE document_transmittals ADD COLUMN IF NOT EXISTS approval_date DATE;
ALTER TABLE document_transmittals ADD COLUMN IF NOT EXISTS v_time INTEGER;
ALTER TABLE document_transmittals ADD COLUMN IF NOT EXISTS transmittal_no TEXT;
ALTER TABLE document_transmittals ADD COLUMN IF NOT EXISTS subject TEXT;
CREATE INDEX IF NOT EXISTS idx_transmittal_parent ON document_transmittals(parent_id);

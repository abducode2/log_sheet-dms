-- Add PDF URL column to supplier_prequalifications
ALTER TABLE supplier_prequalifications ADD COLUMN IF NOT EXISTS pdf_url TEXT;

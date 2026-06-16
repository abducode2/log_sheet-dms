
-- Add PDF URL column to material_submittals
ALTER TABLE material_submittals ADD COLUMN IF NOT EXISTS pdf_url TEXT;

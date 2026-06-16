-- Add PDF URL column to inspection_requests
ALTER TABLE inspection_requests ADD COLUMN IF NOT EXISTS pdf_url TEXT;

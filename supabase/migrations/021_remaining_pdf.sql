-- Add PDF URL column to remaining tables
ALTER TABLE concrete_pour_requests     ADD COLUMN IF NOT EXISTS pdf_url TEXT;
ALTER TABLE requests_for_information   ADD COLUMN IF NOT EXISTS pdf_url TEXT;
ALTER TABLE non_conformance_reports    ADD COLUMN IF NOT EXISTS pdf_url TEXT;
ALTER TABLE document_transmittals      ADD COLUMN IF NOT EXISTS pdf_url TEXT;
ALTER TABLE letters_rawaf_naga         ADD COLUMN IF NOT EXISTS pdf_url TEXT;
ALTER TABLE letters_naga_rawaf         ADD COLUMN IF NOT EXISTS pdf_url TEXT;

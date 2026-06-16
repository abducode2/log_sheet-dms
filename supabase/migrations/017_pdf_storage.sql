
-- Add PDF URL column to shop_drawings
ALTER TABLE shop_drawings ADD COLUMN IF NOT EXISTS pdf_url TEXT;

-- Create Supabase Storage bucket for PDFs
-- Run this in Supabase Dashboard > Storage > New Bucket
-- Bucket name: shop-drawings
-- Public: false


-- Drop old columns if exist, add description
ALTER TABLE pouring_log DROP COLUMN IF EXISTS zone;
ALTER TABLE pouring_log DROP COLUMN IF EXISTS block;
ALTER TABLE pouring_log DROP COLUMN IF EXISTS villa_no;
ALTER TABLE pouring_log DROP COLUMN IF EXISTS villa_type;
ALTER TABLE pouring_log DROP COLUMN IF EXISTS element_type;
ALTER TABLE pouring_log ADD COLUMN IF NOT EXISTS description TEXT;


ALTER TABLE pouring_log ADD COLUMN IF NOT EXISTS mix_design TEXT;
-- concrete_type column can remain but won't be used in UI

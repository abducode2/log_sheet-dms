
-- Add revision tracking columns to shop_drawings
ALTER TABLE shop_drawings ADD COLUMN IF NOT EXISTS parent_id UUID REFERENCES shop_drawings(id);
ALTER TABLE shop_drawings ADD COLUMN IF NOT EXISTS is_archived BOOLEAN DEFAULT false;
ALTER TABLE shop_drawings ADD COLUMN IF NOT EXISTS revision_count INTEGER DEFAULT 0;

-- Index for fast lookup of revision history
CREATE INDEX IF NOT EXISTS idx_shop_drawings_parent ON shop_drawings(parent_id);

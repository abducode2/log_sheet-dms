
CREATE TABLE IF NOT EXISTS pouring_log (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  no              INTEGER,
  concrete_type   TEXT NOT NULL CHECK (concrete_type IN ('PC','RC')),
  cast_date       DATE,
  zone            TEXT,
  block           TEXT,
  villa_no        TEXT,
  villa_type      TEXT,
  element_type    TEXT,
  cpr_no          TEXT,
  test_7d_date    DATE,
  test_7d_result  NUMERIC(6,2),
  test_28d_date   DATE,
  test_28d_result NUMERIC(6,2),
  grade           TEXT,
  supplier        TEXT,
  quantity_m3     NUMERIC(8,2),
  remarks         TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE pouring_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth_all" ON pouring_log FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE INDEX IF NOT EXISTS idx_pouring_log_no           ON pouring_log(no);
CREATE INDEX IF NOT EXISTS idx_pouring_log_concrete_type ON pouring_log(concrete_type);
CREATE INDEX IF NOT EXISTS idx_pouring_log_cast_date    ON pouring_log(cast_date);

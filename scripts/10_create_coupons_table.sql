-- Create coupons table (percent-based discounts for simplicity)
CREATE TABLE IF NOT EXISTS coupons (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  percent_off NUMERIC CHECK (percent_off > 0 AND percent_off <= 100) NOT NULL,
  min_subtotal NUMERIC DEFAULT 0 CHECK (min_subtotal >= 0),
  active BOOLEAN DEFAULT TRUE NOT NULL,
  starts_at TIMESTAMPTZ,
  ends_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_coupons_code ON coupons(code);

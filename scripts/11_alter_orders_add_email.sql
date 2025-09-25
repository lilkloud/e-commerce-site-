-- Add purchaser email to orders for notifications
ALTER TABLE orders
ADD COLUMN IF NOT EXISTS email TEXT;

CREATE INDEX IF NOT EXISTS idx_orders_email ON orders(email);

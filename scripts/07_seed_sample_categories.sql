-- Seed sample categories
INSERT INTO categories (name, description)
VALUES
  ('Electronics', 'Devices and gadgets for modern living'),
  ('Clothing', 'Apparel for all seasons and styles'),
  ('Books', 'Fiction and non-fiction across genres'),
  ('Home & Garden', 'Essentials for your home and outdoor spaces'),
  ('Sports', 'Equipment and accessories for active lifestyles')
ON CONFLICT DO NOTHING;

-- Insert sample products
INSERT INTO products (name, description, price, image_url, category_id, stock_quantity) 
SELECT 
  'Wireless Headphones',
  'High-quality wireless headphones with noise cancellation',
  199.99,
  '/placeholder.svg?height=400&width=400',
  c.id,
  50
FROM categories c WHERE c.name = 'Electronics'
ON CONFLICT DO NOTHING;

INSERT INTO products (name, description, price, image_url, category_id, stock_quantity) 
SELECT 
  'Cotton T-Shirt',
  'Comfortable 100% cotton t-shirt in various colors',
  29.99,
  '/placeholder.svg?height=400&width=400',
  c.id,
  100
FROM categories c WHERE c.name = 'Clothing'
ON CONFLICT DO NOTHING;

INSERT INTO products (name, description, price, image_url, category_id, stock_quantity) 
SELECT 
  'Programming Book',
  'Learn modern web development with this comprehensive guide',
  49.99,
  '/placeholder.svg?height=400&width=400',
  c.id,
  25
FROM categories c WHERE c.name = 'Books'
ON CONFLICT DO NOTHING;

INSERT INTO products (name, description, price, image_url, category_id, stock_quantity) 
SELECT 
  'Garden Tools Set',
  'Complete set of essential gardening tools',
  89.99,
  '/placeholder.svg?height=400&width=400',
  c.id,
  30
FROM categories c WHERE c.name = 'Home & Garden'
ON CONFLICT DO NOTHING;

INSERT INTO products (name, description, price, image_url, category_id, stock_quantity) 
SELECT 
  'Basketball',
  'Official size basketball for indoor and outdoor play',
  39.99,
  '/placeholder.svg?height=400&width=400',
  c.id,
  75
FROM categories c WHERE c.name = 'Sports'
ON CONFLICT DO NOTHING;

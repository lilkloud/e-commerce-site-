-- Additional sample products with varied categories and real-looking image URLs
-- Electronics
INSERT INTO products (name, description, price, image_url, category_id, stock_quantity)
SELECT '4K Smart TV', '55-inch 4K UHD Smart TV with HDR', 599.99, 'https://images.unsplash.com/photo-1593359714517-8f87c6b9a0a5?q=80&w=1200&auto=format&fit=crop', c.id, 20
FROM categories c WHERE c.name = 'Electronics' ON CONFLICT DO NOTHING;

INSERT INTO products (name, description, price, image_url, category_id, stock_quantity)
SELECT 'Bluetooth Speaker', 'Portable waterproof Bluetooth speaker', 79.99, 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?q=80&w=1200&auto=format&fit=crop', c.id, 60
FROM categories c WHERE c.name = 'Electronics' ON CONFLICT DO NOTHING;

-- Clothing
INSERT INTO products (name, description, price, image_url, category_id, stock_quantity)
SELECT 'Denim Jacket', 'Classic fit denim jacket', 89.99, 'https://images.unsplash.com/photo-1520975940409-b478c6b11a0a?q=80&w=1200&auto=format&fit=crop', c.id, 45
FROM categories c WHERE c.name = 'Clothing' ON CONFLICT DO NOTHING;

INSERT INTO products (name, description, price, image_url, category_id, stock_quantity)
SELECT 'Running Shoes', 'Lightweight breathable running shoes', 119.99, 'https://images.unsplash.com/photo-1528701800489-20be3c2ea5fd?q=80&w=1200&auto=format&fit=crop', c.id, 80
FROM categories c WHERE c.name = 'Clothing' ON CONFLICT DO NOTHING;

-- Books
INSERT INTO products (name, description, price, image_url, category_id, stock_quantity)
SELECT 'Design Patterns', 'Elements of reusable object-oriented software', 39.99, 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?q=80&w=1200&auto=format&fit=crop', c.id, 35
FROM categories c WHERE c.name = 'Books' ON CONFLICT DO NOTHING;

INSERT INTO products (name, description, price, image_url, category_id, stock_quantity)
SELECT 'Clean Architecture', 'A craftsman''s guide to software structure', 34.99, 'https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=1200&auto=format&fit=crop', c.id, 30
FROM categories c WHERE c.name = 'Books' ON CONFLICT DO NOTHING;

-- Home & Garden
INSERT INTO products (name, description, price, image_url, category_id, stock_quantity)
SELECT 'Ceramic Planter', 'Minimal ceramic planter pot', 24.99, 'https://images.unsplash.com/photo-1501004318641-b39e6451bec6?q=80&w=1200&auto=format&fit=crop', c.id, 70
FROM categories c WHERE c.name = 'Home & Garden' ON CONFLICT DO NOTHING;

INSERT INTO products (name, description, price, image_url, category_id, stock_quantity)
SELECT 'Aroma Diffuser', 'Ultrasonic essential oil diffuser', 49.99, 'https://images.unsplash.com/photo-1612152605747-1b8c8c6029df?q=80&w=1200&auto=format&fit=crop', c.id, 55
FROM categories c WHERE c.name = 'Home & Garden' ON CONFLICT DO NOTHING;

-- Sports
INSERT INTO products (name, description, price, image_url, category_id, stock_quantity)
SELECT 'Yoga Mat', 'Non-slip eco-friendly yoga mat', 29.99, 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=1200&auto=format&fit=crop', c.id, 100
FROM categories c WHERE c.name = 'Sports' ON CONFLICT DO NOTHING;

INSERT INTO products (name, description, price, image_url, category_id, stock_quantity)
SELECT 'Dumbbell Set', 'Adjustable dumbbell pair 5-25 lb', 149.99, 'https://images.unsplash.com/photo-1583454110551-21f2fa2f36f9?q=80&w=1200&auto=format&fit=crop', c.id, 25
FROM categories c WHERE c.name = 'Sports' ON CONFLICT DO NOTHING;

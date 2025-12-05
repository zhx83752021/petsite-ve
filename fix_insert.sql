-- Delete existing data
DELETE FROM product_skus;
DELETE FROM products;
DELETE FROM brands;
DELETE FROM categories;

-- Reset sequences
ALTER SEQUENCE categories_id_seq RESTART WITH 1;
ALTER SEQUENCE brands_id_seq RESTART WITH 1;
ALTER SEQUENCE products_id_seq RESTART WITH 1;
ALTER SEQUENCE product_skus_id_seq RESTART WITH 1;

-- Insert categories
INSERT INTO categories (name, sort, status, created_at, updated_at) VALUES
('Dog Food', 1, 1, NOW(), NOW()),
('Cat Food', 2, 1, NOW(), NOW()),
('Snacks', 3, 1, NOW(), NOW()),
('Toys', 4, 1, NOW(), NOW()),
('Supplies', 5, 1, NOW(), NOW());

-- Insert brands
INSERT INTO brands (name, sort, status, created_at, updated_at) VALUES
('Royal Canin', 1, 1, NOW(), NOW()),
('Pro Plan', 2, 1, NOW(), NOW()),
('Orijen', 3, 1, NOW(), NOW()),
('Acana', 4, 1, NOW(), NOW());

-- Insert admin
INSERT INTO admins (username, password, real_name, status, created_at, updated_at)
VALUES ('admin', '$2a$10$YQqy2lQxH8P.2fG6Zx9TY.rH4cL5KL3wQ8jv3H5qYzV1xF8H2D3uG', 'Admin', 1, NOW(), NOW())
ON CONFLICT (username) DO NOTHING;

-- Insert products
INSERT INTO products (category_id, brand_id, name, subtitle, main_images, detail, pet_type, sales, views, status, created_at, updated_at) VALUES
(1, 1, 'Royal Canin Adult Dog Food', 'Balanced nutrition for adult dogs', '["https://images.unsplash.com/photo-1589924691995-400dc9ecc119?w=800"]', '<p>Professional adult dog food</p>', 1, 1250, 5600, 1, NOW(), NOW()),
(1, 3, 'Orijen Grain-Free Dog Food', 'High protein grain-free formula', '["https://images.unsplash.com/photo-1534361960057-19889db9621e?w=800"]', '<p>85% quality animal ingredients</p>', 1, 980, 4200, 1, NOW(), NOW()),
(2, 1, 'Royal Canin Adult Cat Food', 'Complete nutrition for adult cats', '["https://images.unsplash.com/photo-1573865526739-10c1d3a03b1e?w=800"]', '<p>Designed for adult cats</p>', 2, 1560, 6800, 1, NOW(), NOW()),
(2, 3, 'Orijen Cat & Kitten Food', 'High protein cat food', '["https://images.unsplash.com/photo-1518791841217-8f162f1e1131?w=800"]', '<p>Fresh poultry and fish</p>', 2, 875, 3900, 1, NOW(), NOW()),
(3, 2, 'Pro Plan Training Treats', 'Healthy training rewards', '["https://images.unsplash.com/photo-1615751072497-5f5169febe17?w=800"]', '<p>Low calorie chicken treats</p>', 1, 2340, 8900, 1, NOW(), NOW()),
(3, 4, 'Acana Freeze-Dried Treats', 'Pure meat freeze-dried', '["https://images.unsplash.com/photo-1623387641168-d9803ddd3f35?w=800"]', '<p>100% natural ingredients</p>', 1, 1120, 4500, 1, NOW(), NOW()),
(4, NULL, 'Interactive Ball Toy', 'Keep pets entertained', '["https://images.unsplash.com/photo-1591769225440-811ad7d6eab3?w=800"]', '<p>Durable rubber ball</p>', NULL, 890, 3200, 1, NOW(), NOW()),
(4, NULL, 'Plush Toy Set', 'Soft and fun', '["https://images.unsplash.com/photo-1535294435445-d7249524ef2e?w=800"]', '<p>3-piece plush toy set</p>', NULL, 1450, 5400, 1, NOW(), NOW()),
(5, NULL, 'Stainless Steel Bowl', 'Durable and hygienic', '["https://images.unsplash.com/photo-1595278069441-2cf29f8005a4?w=800"]', '<p>Premium stainless steel</p>', NULL, 2100, 7800, 1, NOW(), NOW()),
(5, NULL, 'Comfortable Pet Bed', 'Warm sleeping space', '["https://images.unsplash.com/photo-1623387641168-d9803ddd3f35?w=800"]', '<p>Soft and washable</p>', NULL, 1670, 6200, 1, NOW(), NOW()),
(1, 2, 'Pro Plan Large Breed Food', 'For large breed dogs', '["https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=800"]', '<p>Supports bone and joint health</p>', 1, 1890, 6500, 1, NOW(), NOW()),
(2, 4, 'Acana Indoor Cat Food', 'For indoor cats', '["https://images.unsplash.com/photo-1513360371669-4adf3dd7dff8?w=800"]', '<p>Hairball control formula</p>', 2, 1340, 5900, 1, NOW(), NOW()),
(3, 1, 'Royal Canin Cat Treats', 'Delicious cat snacks', '["https://images.unsplash.com/photo-1592194996308-7b43878e84a6?w=800"]', '<p>Nutritional supplement</p>', 2, 2780, 9800, 1, NOW(), NOW()),
(5, NULL, 'Pet Leash', 'Strong and durable', '["https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=800"]', '<p>Comfortable handle design</p>', 1, 1560, 5700, 1, NOW(), NOW()),
(5, NULL, 'Automatic Feeder', 'Timed feeding', '["https://images.unsplash.com/photo-1582562124811-c09040d0a901?w=800"]', '<p>Smart timing function</p>', NULL, 670, 2800, 1, NOW(), NOW());

-- Insert SKUs
INSERT INTO product_skus (product_id, sku_code, spec_combination, price, original_price, stock, status, created_at, updated_at) VALUES
(1, 'RC-DOG-2.5KG', '2.5kg', 89.90, 99.90, 150, 1, NOW(), NOW()),
(1, 'RC-DOG-5KG', '5kg', 159.90, 179.90, 200, 1, NOW(), NOW()),
(1, 'RC-DOG-10KG', '10kg', 289.90, 319.90, 100, 1, NOW(), NOW()),
(2, 'OR-DOG-2KG', '2kg', 129.90, 149.90, 80, 1, NOW(), NOW()),
(2, 'OR-DOG-6KG', '6kg', 349.90, 399.90, 120, 1, NOW(), NOW()),
(3, 'RC-CAT-2KG', '2kg', 79.90, 89.90, 180, 1, NOW(), NOW()),
(3, 'RC-CAT-4KG', '4kg', 139.90, 159.90, 150, 1, NOW(), NOW()),
(3, 'RC-CAT-10KG', '10kg', 299.90, 339.90, 90, 1, NOW(), NOW()),
(4, 'OR-CAT-1.8KG', '1.8kg', 119.90, 139.90, 100, 1, NOW(), NOW()),
(4, 'OR-CAT-5.4KG', '5.4kg', 319.90, 369.90, 85, 1, NOW(), NOW()),
(5, 'PP-TREAT-200G', '200g', 19.90, 24.90, 300, 1, NOW(), NOW()),
(5, 'PP-TREAT-400G', '400g', 35.90, 42.90, 250, 1, NOW(), NOW()),
(6, 'AC-FD-85G', '85g', 29.90, 35.90, 200, 1, NOW(), NOW()),
(6, 'AC-FD-170G', '170g', 49.90, 59.90, 180, 1, NOW(), NOW()),
(7, 'TOY-BALL-M', 'Medium', 15.90, 19.90, 400, 1, NOW(), NOW()),
(7, 'TOY-BALL-L', 'Large', 22.90, 27.90, 350, 1, NOW(), NOW()),
(8, 'TOY-PLUSH-3PC', '3-piece', 39.90, 49.90, 280, 1, NOW(), NOW()),
(9, 'BOWL-SS-S', 'Small', 25.90, 29.90, 500, 1, NOW(), NOW()),
(9, 'BOWL-SS-M', 'Medium', 35.90, 39.90, 450, 1, NOW(), NOW()),
(9, 'BOWL-SS-L', 'Large', 45.90, 49.90, 400, 1, NOW(), NOW()),
(10, 'BED-S', 'Small', 89.90, 109.90, 150, 1, NOW(), NOW()),
(10, 'BED-M', 'Medium', 129.90, 149.90, 120, 1, NOW(), NOW()),
(10, 'BED-L', 'Large', 169.90, 199.90, 100, 1, NOW(), NOW()),
(11, 'PP-LARGE-12KG', '12kg', 329.90, 369.90, 95, 1, NOW(), NOW()),
(12, 'AC-INDOOR-5.4KG', '5.4kg', 299.90, 339.90, 110, 1, NOW(), NOW()),
(13, 'RC-CATSNACK-15G', '15g x 12', 45.90, 52.90, 380, 1, NOW(), NOW()),
(14, 'LEASH-M', 'Medium', 35.90, 42.90, 320, 1, NOW(), NOW()),
(14, 'LEASH-L', 'Large', 45.90, 52.90, 280, 1, NOW(), NOW()),
(15, 'FEEDER-AUTO', 'Standard', 199.90, 249.90, 80, 1, NOW(), NOW());

-- Verify
SELECT 'Categories:' as info, COUNT(*) as count FROM categories
UNION ALL
SELECT 'Brands:', COUNT(*) FROM brands
UNION ALL
SELECT 'Products:', COUNT(*) FROM products
UNION ALL
SELECT 'SKUs:', COUNT(*) FROM product_skus;

-- 插入示例商品数据

-- 首先确保有默认管理员
INSERT INTO admins (username, password, real_name, status)
VALUES ('admin', '$2a$10$YQqy2lQxH8P.2fG6Zx9TY.rH4cL5KL3wQ8jv3H5qYzV1xF8H2D3uG', 'System Admin', 1)
ON CONFLICT (username) DO NOTHING;

-- 插入分类
INSERT INTO categories (name, sort, status) VALUES
('Dog Food', 1, 1),
('Cat Food', 2, 1),
('Snacks', 3, 1),
('Toys', 4, 1),
('Supplies', 5, 1)
ON CONFLICT DO NOTHING;

-- 插入品牌
INSERT INTO brands (name, sort, status) VALUES
('Royal Canin', 1, 1),
('Pro Plan', 2, 1),
('Orijen', 3, 1),
('Acana', 4, 1)
ON CONFLICT DO NOTHING;

-- 插入商品 (狗粮)
INSERT INTO products (category_id, brand_id, name, subtitle, main_images, detail, pet_type, status, sales) VALUES
(1, 1, 'Royal Canin Adult Dog Food', 'Balanced nutrition for adult dogs',
'["https://images.unsplash.com/photo-1589924691995-400dc9ecc119?w=800", "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=800"]',
'<p>Professional adult dog food with balanced nutrition</p><p>Suitable for medium and large breed dogs</p>',
1, 1, 1250);

INSERT INTO products (category_id, brand_id, name, subtitle, main_images, detail, pet_type, status, sales) VALUES
(1, 3, 'Orijen Original Grain-Free Dog Food', 'High protein grain-free dog food',
'["https://images.unsplash.com/photo-1534361960057-19889db9621e?w=800", "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=800"]',
'<p>85% high quality animal ingredients</p><p>No grains, suitable for all breeds</p>',
1, 1, 980);

-- 插入商品 (猫粮)
INSERT INTO products (category_id, brand_id, name, subtitle, main_images, detail, pet_type, status, sales) VALUES
(2, 1, 'Royal Canin Adult Cat Food', 'Complete nutrition for adult cats',
'["https://images.unsplash.com/photo-1573865526739-10c1d3a03b1e?w=800", "https://images.unsplash.com/photo-1611003228941-98852ba62227?w=800"]',
'<p>Specially formulated for adult cats</p><p>Supports urinary health</p>',
2, 1, 1560);

INSERT INTO products (category_id, brand_id, name, subtitle, main_images, detail, pet_type, status, sales) VALUES
(2, 3, 'Orijen Cat & Kitten Food', 'High protein cat food',
'["https://images.unsplash.com/photo-1518791841217-8f162f1e1131?w=800", "https://images.unsplash.com/photo-1513360371669-4adf3dd7dff8?w=800"]',
'<p>Fresh poultry and fish ingredients</p><p>Suitable for all life stages</p>',
2, 1, 875);

-- 插入商品 (零食)
INSERT INTO products (category_id, brand_id, name, subtitle, main_images, detail, pet_type, status, sales) VALUES
(3, 2, 'Pro Plan Chicken Training Treats', 'Healthy training rewards',
'["https://images.unsplash.com/photo-1615751072497-5f5169febe17?w=800"]',
'<p>Low calorie chicken treats</p><p>Perfect for training sessions</p>',
1, 1, 2340);

INSERT INTO products (category_id, brand_id, name, subtitle, main_images, detail, pet_type, status, sales) VALUES
(3, 4, 'Acana Freeze-Dried Treats', 'Pure meat freeze-dried treats',
'["https://images.unsplash.com/photo-1623387641168-d9803ddd3f35?w=800"]',
'<p>100% natural ingredients</p><p>No additives or preservatives</p>',
1, 1, 1120);

-- 插入商品 (玩具)
INSERT INTO products (category_id, name, subtitle, main_images, detail, status, sales) VALUES
(4, 'Interactive Ball Toy', 'Keep your pet entertained',
'["https://images.unsplash.com/photo-1591769225440-811ad7d6eab3?w=800"]',
'<p>Durable rubber ball toy</p><p>Great for fetch and play</p>',
1, 890);

INSERT INTO products (category_id, name, subtitle, main_images, detail, status, sales) VALUES
(4, 'Plush Squeaky Toy Set', 'Soft and fun toys',
'["https://images.unsplash.com/photo-1535294435445-d7249524ef2e?w=800"]',
'<p>Set of 3 cute plush toys</p><p>Built-in squeakers for fun</p>',
1, 1450);

-- 插入商品 (用品)
INSERT INTO products (category_id, name, subtitle, main_images, detail, status, sales) VALUES
(5, 'Stainless Steel Food Bowl', 'Durable and hygienic',
'["https://images.unsplash.com/photo-1595278069441-2cf29f8005a4?w=800"]',
'<p>Premium stainless steel construction</p><p>Dishwasher safe</p>',
1, 2100);

INSERT INTO products (category_id, name, subtitle, main_images, detail, status, sales) VALUES
(5, 'Comfortable Pet Bed', 'Cozy sleeping space',
'["https://images.unsplash.com/photo-1623387641168-d9803ddd3f35?w=800"]',
'<p>Soft and washable pet bed</p><p>Multiple sizes available</p>',
1, 1670);

-- 为每个商品插入 SKU
INSERT INTO product_skus (product_id, sku_name, price, original_price, stock, status) VALUES
(1, '2.5kg', 89.90, 99.90, 150, 1),
(1, '5kg', 159.90, 179.90, 200, 1),
(1, '10kg', 289.90, 319.90, 100, 1),

(2, '2kg', 129.90, 149.90, 80, 1),
(2, '6kg', 349.90, 399.90, 120, 1),

(3, '2kg', 79.90, 89.90, 180, 1),
(3, '4kg', 139.90, 159.90, 150, 1),
(3, '10kg', 299.90, 339.90, 90, 1),

(4, '1.8kg', 119.90, 139.90, 100, 1),
(4, '5.4kg', 319.90, 369.90, 85, 1),

(5, '200g', 19.90, 24.90, 300, 1),
(5, '400g', 35.90, 42.90, 250, 1),

(6, '85g', 29.90, 35.90, 200, 1),
(6, '170g', 49.90, 59.90, 180, 1),

(7, 'Medium', 15.90, 19.90, 400, 1),
(7, 'Large', 22.90, 27.90, 350, 1),

(8, '3 Pieces', 39.90, 49.90, 280, 1),

(9, 'Small', 25.90, 29.90, 500, 1),
(9, 'Medium', 35.90, 39.90, 450, 1),
(9, 'Large', 45.90, 49.90, 400, 1),

(10, 'Small', 89.90, 109.90, 150, 1),
(10, 'Medium', 129.90, 149.90, 120, 1),
(10, 'Large', 169.90, 199.90, 100, 1);

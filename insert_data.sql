-- Insert sample products data

-- Insert admin
INSERT INTO admins (username, password, real_name, status)
VALUES ('admin', '$2a$10$YQqy2lQxH8P.2fG6Zx9TY.rH4cL5KL3wQ8jv3H5qYzV1xF8H2D3uG', 'System Admin', 1)
ON CONFLICT (username) DO NOTHING;

-- Insert products
INSERT INTO products (name, description, price, original_price, stock, sales, image, images, status) VALUES
('Royal Canin Adult Dog Food', 'Balanced nutrition for adult dogs. Professional formula with high quality ingredients.', 159.90, 179.90, 200, 1250,
'https://images.unsplash.com/photo-1589924691995-400dc9ecc119?w=800',
ARRAY['https://images.unsplash.com/photo-1589924691995-400dc9ecc119?w=800', 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=800'], 1),

('Orijen Original Grain-Free Dog Food', 'High protein grain-free dog food with 85% quality animal ingredients.', 349.90, 399.90, 120, 980,
'https://images.unsplash.com/photo-1534361960057-19889db9621e?w=800',
ARRAY['https://images.unsplash.com/photo-1534361960057-19889db9621e?w=800', 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=800'], 1),

('Royal Canin Adult Cat Food', 'Complete nutrition for adult cats. Supports urinary health.', 139.90, 159.90, 180, 1560,
'https://images.unsplash.com/photo-1573865526739-10c1d3a03b1e?w=800',
ARRAY['https://images.unsplash.com/photo-1573865526739-10c1d3a03b1e?w=800', 'https://images.unsplash.com/photo-1611003228941-98852ba62227?w=800'], 1),

('Orijen Cat & Kitten Food', 'High protein cat food with fresh poultry and fish ingredients.', 319.90, 369.90, 100, 875,
'https://images.unsplash.com/photo-1518791841217-8f162f1e1131?w=800',
ARRAY['https://images.unsplash.com/photo-1518791841217-8f162f1e1131?w=800', 'https://images.unsplash.com/photo-1513360371669-4adf3dd7dff8?w=800'], 1),

('Pro Plan Chicken Training Treats', 'Healthy training rewards. Low calorie chicken treats perfect for training sessions.', 35.90, 42.90, 300, 2340,
'https://images.unsplash.com/photo-1615751072497-5f5169febe17?w=800',
ARRAY['https://images.unsplash.com/photo-1615751072497-5f5169febe17?w=800'], 1),

('Acana Freeze-Dried Treats', 'Pure meat freeze-dried treats. 100% natural ingredients, no additives.', 49.90, 59.90, 200, 1120,
'https://images.unsplash.com/photo-1623387641168-d9803ddd3f35?w=800',
ARRAY['https://images.unsplash.com/photo-1623387641168-d9803ddd3f35?w=800'], 1),

('Interactive Ball Toy', 'Keep your pet entertained. Durable rubber ball toy great for fetch and play.', 22.90, 27.90, 400, 890,
'https://images.unsplash.com/photo-1591769225440-811ad7d6eab3?w=800',
ARRAY['https://images.unsplash.com/photo-1591769225440-811ad7d6eab3?w=800'], 1),

('Plush Squeaky Toy Set', 'Soft and fun toys. Set of 3 cute plush toys with built-in squeakers.', 39.90, 49.90, 280, 1450,
'https://images.unsplash.com/photo-1535294435445-d7249524ef2e?w=800',
ARRAY['https://images.unsplash.com/photo-1535294435445-d7249524ef2e?w=800'], 1),

('Stainless Steel Food Bowl', 'Durable and hygienic. Premium stainless steel construction, dishwasher safe.', 35.90, 39.90, 500, 2100,
'https://images.unsplash.com/photo-1595278069441-2cf29f8005a4?w=800',
ARRAY['https://images.unsplash.com/photo-1595278069441-2cf29f8005a4?w=800'], 1),

('Comfortable Pet Bed', 'Cozy sleeping space. Soft and washable pet bed, multiple sizes available.', 129.90, 149.90, 150, 1670,
'https://images.unsplash.com/photo-1623387641168-d9803ddd3f35?w=800',
ARRAY['https://images.unsplash.com/photo-1623387641168-d9803ddd3f35?w=800'], 1),

('Premium Dog Leash', 'Strong and durable leash for daily walks. Comfortable padded handle.', 45.90, 52.90, 350, 1890,
'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=800',
ARRAY['https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=800'], 1),

('Cat Scratching Post', 'Save your furniture! Natural sisal rope scratching post with hanging toys.', 89.90, 109.90, 180, 1340,
'https://images.unsplash.com/photo-1545249390-6bdfa286032f?w=800',
ARRAY['https://images.unsplash.com/photo-1545249390-6bdfa286032f?w=800'], 1),

('Automatic Pet Feeder', 'Never miss a feeding time. Programmable automatic feeder with voice recording.', 199.90, 249.90, 80, 560,
'https://images.unsplash.com/photo-1582562124811-c09040d0a901?w=800',
ARRAY['https://images.unsplash.com/photo-1582562124811-c09040d0a901?w=800'], 1),

('Pet Grooming Kit', 'Complete grooming set. Includes brush, comb, nail clipper and more.', 79.90, 95.90, 220, 1120,
'https://images.unsplash.com/photo-1581579438747-1dc8d17bbce4?w=800',
ARRAY['https://images.unsplash.com/photo-1581579438747-1dc8d17bbce4?w=800'], 1),

('Dental Chew Sticks', 'Promotes dental health. Helps clean teeth and freshen breath naturally.', 29.90, 35.90, 450, 2780,
'https://images.unsplash.com/photo-1592194996308-7b43878e84a6?w=800',
ARRAY['https://images.unsplash.com/photo-1592194996308-7b43878e84a6?w=800'], 1);

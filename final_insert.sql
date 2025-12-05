-- 插入分类
INSERT INTO categories (name, sort, status) VALUES
('狗粮', 1, 1),
('猫粮', 2, 1),
('零食', 3, 1),
('玩具', 4, 1),
('用品', 5, 1);

-- 插入品牌
INSERT INTO brands (name, sort, status) VALUES
('皇家', 1, 1),
('冠能', 2, 1),
('渴望', 3, 1),
('爱肯拿', 4, 1);

-- 插入管理员
INSERT INTO admins (username, password, real_name, status)
VALUES ('admin', '$2a$10$YQqy2lQxH8P.2fG6Zx9TY.rH4cL5KL3wQ8jv3H5qYzV1xF8H2D3uG', '系统管理员', 1)
ON CONFLICT (username) DO NOTHING;

-- 插入商品
INSERT INTO products (category_id, brand_id, name, subtitle, main_images, detail, pet_type, sales, views, status) VALUES
(1, 1, '皇家成犬粮', '均衡营养，适合成年犬', '["https://images.unsplash.com/photo-1589924691995-400dc9ecc119?w=800"]', '<p>专业成犬粮，营养均衡</p>', 1, 1250, 5600, 1),
(1, 3, '渴望无谷犬粮', '高蛋白无谷物配方', '["https://images.unsplash.com/photo-1534361960057-19889db9621e?w=800"]', '<p>85%优质动物原料</p>', 1, 980, 4200, 1),
(2, 1, '皇家成猫粮', '全面营养，呵护成猫健康', '["https://images.unsplash.com/photo-1573865526739-10c1d3a03b1e?w=800"]', '<p>专为成年猫咪设计</p>', 2, 1560, 6800, 1),
(2, 3, '渴望全猫粮', '高蛋白猫粮', '["https://images.unsplash.com/photo-1518791841217-8f162f1e1131?w=800"]', '<p>新鲜禽肉与鱼肉</p>', 2, 875, 3900, 1),
(3, 2, '冠能训练零食', '健康训练奖励', '["https://images.unsplash.com/photo-1615751072497-5f5169febe17?w=800"]', '<p>低卡鸡肉零食</p>', 1, 2340, 8900, 1),
(3, 4, '爱肯拿冻干零食', '纯肉冻干', '["https://images.unsplash.com/photo-1623387641168-d9803ddd3f35?w=800"]', '<p>100%天然成分</p>', 1, 1120, 4500, 1),
(4, NULL, '互动球玩具', '让宠物快乐玩耍', '["https://images.unsplash.com/photo-1591769225440-811ad7d6eab3?w=800"]', '<p>耐咬橡胶球</p>', NULL, 890, 3200, 1),
(4, NULL, '毛绒玩具套装', '柔软有趣', '["https://images.unsplash.com/photo-1535294435445-d7249524ef2e?w=800"]', '<p>3件套毛绒玩具</p>', NULL, 1450, 5400, 1),
(5, NULL, '不锈钢食盆', '耐用卫生', '["https://images.unsplash.com/photo-1595278069441-2cf29f8005a4?w=800"]', '<p>优质不锈钢</p>', NULL, 2100, 7800, 1),
(5, NULL, '舒适宠物窝', '温暖睡眠空间', '["https://images.unsplash.com/photo-1623387641168-d9803ddd3f35?w=800"]', '<p>柔软可洗</p>', NULL, 1670, 6200, 1),
(1, 2, '冠能大型犬粮', '专为大型犬设计', '["https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=800"]', '<p>支持骨骼关节健康</p>', 1, 1890, 6500, 1),
(2, 4, '爱肯拿室内猫粮', '室内猫专用', '["https://images.unsplash.com/photo-1513360371669-4adf3dd7dff8?w=800"]', '<p>控制毛球配方</p>', 2, 1340, 5900, 1),
(3, 1, '皇家猫条', '美味猫零食', '["https://images.unsplash.com/photo-1592194996308-7b43878e84a6?w=800"]', '<p>营养补充零食</p>', 2, 2780, 9800, 1),
(5, NULL, '宠物牵引绳', '结实耐用', '["https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=800"]', '<p>舒适手柄设计</p>', 1, 1560, 5700, 1),
(5, NULL, '自动喂食器', '定时定量喂食', '["https://images.unsplash.com/photo-1582562124811-c09040d0a901?w=800"]', '<p>智能定时功能</p>', NULL, 670, 2800, 1);

-- 插入商品SKU
INSERT INTO product_skus (product_id, sku_code, spec_combination, price, original_price, stock, status) VALUES
(1, 'RC-DOG-2.5KG', '2.5kg', 89.90, 99.90, 150, 1),
(1, 'RC-DOG-5KG', '5kg', 159.90, 179.90, 200, 1),
(1, 'RC-DOG-10KG', '10kg', 289.90, 319.90, 100, 1),
(2, 'OR-DOG-2KG', '2kg', 129.90, 149.90, 80, 1),
(2, 'OR-DOG-6KG', '6kg', 349.90, 399.90, 120, 1),
(3, 'RC-CAT-2KG', '2kg', 79.90, 89.90, 180, 1),
(3, 'RC-CAT-4KG', '4kg', 139.90, 159.90, 150, 1),
(3, 'RC-CAT-10KG', '10kg', 299.90, 339.90, 90, 1),
(4, 'OR-CAT-1.8KG', '1.8kg', 119.90, 139.90, 100, 1),
(4, 'OR-CAT-5.4KG', '5.4kg', 319.90, 369.90, 85, 1),
(5, 'PP-TREAT-200G', '200g', 19.90, 24.90, 300, 1),
(5, 'PP-TREAT-400G', '400g', 35.90, 42.90, 250, 1),
(6, 'AC-FD-85G', '85g', 29.90, 35.90, 200, 1),
(6, 'AC-FD-170G', '170g', 49.90, 59.90, 180, 1),
(7, 'TOY-BALL-M', '中号', 15.90, 19.90, 400, 1),
(7, 'TOY-BALL-L', '大号', 22.90, 27.90, 350, 1),
(8, 'TOY-PLUSH-3PC', '3件套', 39.90, 49.90, 280, 1),
(9, 'BOWL-SS-S', '小号', 25.90, 29.90, 500, 1),
(9, 'BOWL-SS-M', '中号', 35.90, 39.90, 450, 1),
(9, 'BOWL-SS-L', '大号', 45.90, 49.90, 400, 1),
(10, 'BED-S', '小号', 89.90, 109.90, 150, 1),
(10, 'BED-M', '中号', 129.90, 149.90, 120, 1),
(10, 'BED-L', '大号', 169.90, 199.90, 100, 1),
(11, 'PP-LARGE-12KG', '12kg', 329.90, 369.90, 95, 1),
(12, 'AC-INDOOR-5.4KG', '5.4kg', 299.90, 339.90, 110, 1),
(13, 'RC-CATSNACK-15G', '15g*12条', 45.90, 52.90, 380, 1),
(14, 'LEASH-M', '中号', 35.90, 42.90, 320, 1),
(14, 'LEASH-L', '大号', 45.90, 52.90, 280, 1),
(15, 'FEEDER-AUTO', '标准版', 199.90, 249.90, 80, 1);

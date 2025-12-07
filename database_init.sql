-- 数据库初始化脚本
-- 用于创建缺失的表和插入示例数据

-- ============================================
-- 1. 创建 brands 表（品牌表）
-- ============================================
CREATE TABLE IF NOT EXISTS brands (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  logo VARCHAR(255),
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 插入示例品牌数据
INSERT INTO brands (name, logo, description) VALUES
('皇家宠物', 'https://via.placeholder.com/100', '专业宠物食品品牌，致力于为宠物提供最优质的营养'),
('宝路', 'https://via.placeholder.com/100', '知名狗粮品牌，深受全球宠物主人信赖'),
('伟嘉', 'https://via.placeholder.com/100', '优质猫粮品牌，为猫咪提供全面营养'),
('比瑞吉', 'https://via.placeholder.com/100', '国产优质宠物食品品牌'),
('冠能', 'https://via.placeholder.com/100', '雀巢旗下专业宠物食品品牌')
ON CONFLICT DO NOTHING;

-- ============================================
-- 2. 创建 posts 表（社区动态表）
-- ============================================
CREATE TABLE IF NOT EXISTS posts (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  content TEXT NOT NULL,
  images JSONB DEFAULT '[]',
  status VARCHAR(20) DEFAULT 'published',
  like_count INTEGER DEFAULT 0,
  comment_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 插入示例动态数据
INSERT INTO posts (user_id, content, images, status, like_count, comment_count) VALUES
(1, '我家的狗狗今天特别可爱！分享几张照片给大家看看～', '["https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=400"]', 'published', 15, 8),
(1, '刚买了一款新的猫粮，猫咪很喜欢吃，推荐给大家！', '["https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400"]', 'published', 23, 12),
(1, '宠物美容心得分享：如何给狗狗洗澡更省心', '[]', 'published', 31, 15),
(1, '请问大家的猫咪都是吃什么牌子的猫粮啊？', '[]', 'published', 8, 20),
(1, '今天带狗狗去公园玩耍，它玩得很开心！', '["https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=400", "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400"]', 'published', 42, 18)
ON CONFLICT DO NOTHING;

-- ============================================
-- 3. 修复现有表的缺失字段
-- ============================================

-- 为 categories 表添加可能缺失的字段
ALTER TABLE categories
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS sort INTEGER DEFAULT 0;

-- 为 products 表添加可能缺失的字段
ALTER TABLE products
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS images JSONB DEFAULT '[]';

-- 更新现有数据的默认值
UPDATE categories SET sort = id WHERE sort IS NULL OR sort = 0;
UPDATE products SET description = '暂无描述' WHERE description IS NULL OR description = '';

-- ============================================
-- 4. 创建索引优化查询性能
-- ============================================

-- brands 表索引
CREATE INDEX IF NOT EXISTS idx_brands_created_at ON brands(created_at DESC);

-- posts 表索引
CREATE INDEX IF NOT EXISTS idx_posts_user_id ON posts(user_id);
CREATE INDEX IF NOT EXISTS idx_posts_status ON posts(status);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at DESC);

-- products 表索引
CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);

-- ============================================
-- 5. 验证数据
-- ============================================

-- 查看各表数据量
SELECT 'brands' as table_name, COUNT(*) as count FROM brands
UNION ALL
SELECT 'posts', COUNT(*) FROM posts
UNION ALL
SELECT 'products', COUNT(*) FROM products
UNION ALL
SELECT 'categories', COUNT(*) FROM categories
UNION ALL
SELECT 'users', COUNT(*) FROM users;

-- 显示品牌列表
SELECT * FROM brands ORDER BY id;

-- 显示动态列表（前5条）
SELECT p.id, p.content, p.like_count, p.comment_count, p.created_at
FROM posts p
ORDER BY p.created_at DESC
LIMIT 5;

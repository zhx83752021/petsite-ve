import { VercelRequest, VercelResponse } from '@vercel/node';
import { getPool } from './_db';

export default async (req: VercelRequest, res: VercelResponse) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({
      code: 405,
      message: 'Method not allowed'
    });
  }

  try {
    const db = getPool();
    const results: string[] = [];

    // 0. 创建 users 表
    try {
      await db.query(`
        CREATE TABLE IF NOT EXISTS users (
          id SERIAL PRIMARY KEY,
          username VARCHAR(50) UNIQUE NOT NULL,
          password VARCHAR(255) NOT NULL,
          email VARCHAR(100),
          phone VARCHAR(20),
          role VARCHAR(20) DEFAULT 'user',
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        )
      `);
      results.push('✅ users 表创建成功');
    } catch (err: any) {
      results.push(`⚠️ users 表: ${err.message}`);
    }

    // 0.1 插入测试用户
    try {
      await db.query(`
        INSERT INTO users (username, password, email, role) VALUES
        ('testuser', '$2a$10$YourHashedPasswordHere', 'test@example.com', 'user')
        ON CONFLICT (username) DO NOTHING
      `);
      results.push('✅ 测试用户创建成功');
    } catch (err: any) {
      results.push(`⚠️ 测试用户: ${err.message}`);
    }

    // 1. 创建 categories 表
    try {
      await db.query(`
        CREATE TABLE IF NOT EXISTS categories (
          id SERIAL PRIMARY KEY,
          name VARCHAR(100) NOT NULL,
          parent_id INTEGER DEFAULT 0,
          icon VARCHAR(255),
          sort INTEGER DEFAULT 0,
          description TEXT,
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        )
      `);
      results.push('✅ categories 表创建成功');
    } catch (err: any) {
      results.push(`⚠️ categories 表: ${err.message}`);
    }

    // 0.1 删除不需要的字段
    try {
      // 删除 slug 字段（如果存在），因为我们的数据模型不需要它
      await db.query(`ALTER TABLE categories DROP COLUMN IF EXISTS slug`);
      results.push('✅ categories 表字段清理完成');
    } catch (err: any) {
      results.push(`⚠️ categories 字段清理: ${err.message}`);
    }

    // 0.2 删除外键约束（如果存在）
    try {
      await db.query(`
        ALTER TABLE categories DROP CONSTRAINT IF EXISTS categories_parent_id_fkey
      `);
      results.push('✅ categories 外键约束清理完成');
    } catch (err: any) {
      results.push(`⚠️ categories 外键清理: ${err.message}`);
    }

    // 0.3 插入分类数据（parent_id 使用 NULL 而不是 0）
    try {
      await db.query(`
        INSERT INTO categories (name, parent_id, icon, sort, description) VALUES
        ('猫粮', NULL, '🐱', 1, '各类猫粮商品'),
        ('狗粮', NULL, '🐶', 2, '各类狗粮商品'),
        ('零食', NULL, '🍖', 3, '宠物零食'),
        ('用品', NULL, '🎾', 4, '宠物用品'),
        ('玩具', NULL, '🧸', 5, '宠物玩具')
        ON CONFLICT DO NOTHING
      `);
      results.push('✅ 分类数据插入成功');
    } catch (err: any) {
      results.push(`⚠️ 分类数据: ${err.message}`);
    }

    // 0.2 创建 products 表
    try {
      await db.query(`
        CREATE TABLE IF NOT EXISTS products (
          id SERIAL PRIMARY KEY,
          name VARCHAR(200) NOT NULL,
          category_id INTEGER NOT NULL,
          brand_id INTEGER,
          description TEXT,
          images JSONB DEFAULT '[]',
          status VARCHAR(20) DEFAULT 'active',
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        )
      `);
      results.push('✅ products 表创建成功');
    } catch (err: any) {
      results.push(`⚠️ products 表: ${err.message}`);
    }

    // 0.3 创建 product_skus 表
    try {
      await db.query(`
        CREATE TABLE IF NOT EXISTS product_skus (
          id SERIAL PRIMARY KEY,
          product_id INTEGER NOT NULL,
          name VARCHAR(200) NOT NULL,
          price DECIMAL(10, 2) NOT NULL,
          stock INTEGER DEFAULT 0,
          specs JSONB DEFAULT '{}',
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        )
      `);
      results.push('✅ product_skus 表创建成功');
    } catch (err: any) {
      results.push(`⚠️ product_skus 表: ${err.message}`);
    }

    // 0.4 确保 product_skus 表有必要字段
    try {
      // 删除不需要的 sku_code 字段
      await db.query(`ALTER TABLE product_skus DROP COLUMN IF EXISTS sku_code`);
      await db.query(`ALTER TABLE product_skus ADD COLUMN IF NOT EXISTS name VARCHAR(200)`);
      await db.query(`ALTER TABLE product_skus ADD COLUMN IF NOT EXISTS specs JSONB DEFAULT '{}'`);
      results.push('✅ product_skus 表字段检查完成');
    } catch (err: any) {
      results.push(`⚠️ product_skus 字段: ${err.message}`);
    }

    // 1. 创建 brands 表
    try {
      await db.query(`
        CREATE TABLE IF NOT EXISTS brands (
          id SERIAL PRIMARY KEY,
          name VARCHAR(100) NOT NULL,
          logo VARCHAR(255),
          description TEXT,
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        )
      `);
      results.push('✅ brands 表创建成功');
    } catch (err: any) {
      results.push(`⚠️ brands 表: ${err.message}`);
    }

    // 2. 插入品牌数据
    try {
      await db.query(`
        INSERT INTO brands (name, logo, description) VALUES
        ('皇家宠物', 'https://via.placeholder.com/100', '专业宠物食品品牌'),
        ('宝路', 'https://via.placeholder.com/100', '知名狗粮品牌'),
        ('伟嘉', 'https://via.placeholder.com/100', '优质猫粮品牌'),
        ('比瑞吉', 'https://via.placeholder.com/100', '国产优质宠物食品品牌'),
        ('冠能', 'https://via.placeholder.com/100', '雀巢旗下专业宠物食品品牌')
        ON CONFLICT DO NOTHING
      `);
      results.push('✅ 品牌数据插入成功');
    } catch (err: any) {
      results.push(`⚠️ 品牌数据: ${err.message}`);
    }

    // 3. 创建 posts 表
    try {
      await db.query(`
        CREATE TABLE IF NOT EXISTS posts (
          id SERIAL PRIMARY KEY,
          user_id INTEGER NOT NULL,
          content TEXT NOT NULL,
          images JSONB DEFAULT '[]',
          status VARCHAR(20) DEFAULT 'published',
          like_count INTEGER DEFAULT 0,
          comment_count INTEGER DEFAULT 0,
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        )
      `);
      results.push('✅ posts 表创建成功');
    } catch (err: any) {
      results.push(`⚠️ posts 表: ${err.message}`);
    }

    // 4. 插入动态数据
    try {
      await db.query(`
        INSERT INTO posts (user_id, content, images, status, like_count, comment_count) VALUES
        (1, '我家的狗狗今天特别可爱！', '["https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=400"]', 'published', 15, 8),
        (1, '刚买了一款新的猫粮，推荐给大家！', '["https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400"]', 'published', 23, 12),
        (1, '宠物美容心得分享', '[]', 'published', 31, 15),
        (1, '请问大家的猫咪都是吃什么牌子的猫粮？', '[]', 'published', 8, 20),
        (1, '今天带狗狗去公园玩耍！', '["https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=400"]', 'published', 42, 18)
        ON CONFLICT DO NOTHING
      `);
      results.push('✅ 动态数据插入成功');
    } catch (err: any) {
      results.push(`⚠️ 动态数据: ${err.message}`);
    }

    // 5. 为 categories 添加字段
    try {
      await db.query(`ALTER TABLE categories ADD COLUMN IF NOT EXISTS description TEXT`);
      await db.query(`ALTER TABLE categories ADD COLUMN IF NOT EXISTS sort INTEGER DEFAULT 0`);
      results.push('✅ categories 表字段添加成功');
    } catch (err: any) {
      results.push(`⚠️ categories 字段: ${err.message}`);
    }

    // 6. 为 products 添加字段
    try {
      await db.query(`ALTER TABLE products ADD COLUMN IF NOT EXISTS description TEXT`);
      await db.query(`ALTER TABLE products ADD COLUMN IF NOT EXISTS images JSONB DEFAULT '[]'`);
      results.push('✅ products 表字段添加成功');
    } catch (err: any) {
      results.push(`⚠️ products 字段: ${err.message}`);
    }

    // 7. 创建 orders 表
    try {
      await db.query(`
        CREATE TABLE IF NOT EXISTS orders (
          id SERIAL PRIMARY KEY,
          order_no VARCHAR(50) UNIQUE NOT NULL,
          user_id INTEGER NOT NULL,
          total_amount DECIMAL(10, 2) NOT NULL,
          payment_method VARCHAR(20),
          payment_status VARCHAR(20) DEFAULT 'pending',
          shipping_status VARCHAR(20) DEFAULT 'pending',
          status VARCHAR(20) DEFAULT 'pending',
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        )
      `);
      results.push('✅ orders 表创建成功');
    } catch (err: any) {
      results.push(`⚠️ orders 表: ${err.message}`);
    }

    // 7.1 确保 orders 表字段兼容性
    try {
      // 删除或修改 final_amount 字段的 NOT NULL 约束
      await db.query(`ALTER TABLE orders DROP COLUMN IF EXISTS final_amount`);
      // 尝试添加 order_status 字段（如果不存在）
      await db.query(`ALTER TABLE orders ADD COLUMN IF NOT EXISTS order_status VARCHAR(20) DEFAULT 'pending'`);
      // 如果数据库使用 status 字段，复制数据到 order_status
      await db.query(`UPDATE orders SET order_status = status WHERE order_status IS NULL`);
      results.push('✅ orders 表字段兼容处理完成');
    } catch (err: any) {
      results.push(`⚠️ orders 字段兼容: ${err.message}`);
    }

    // 8. 创建 order_items 表
    try {
      await db.query(`
        CREATE TABLE IF NOT EXISTS order_items (
          id SERIAL PRIMARY KEY,
          order_id INTEGER NOT NULL,
          product_id INTEGER NOT NULL,
          product_name VARCHAR(200) NOT NULL,
          sku_name VARCHAR(200),
          price DECIMAL(10, 2) NOT NULL,
          quantity INTEGER NOT NULL,
          created_at TIMESTAMP DEFAULT NOW()
        )
      `);
      results.push('✅ order_items 表创建成功');
    } catch (err: any) {
      results.push(`⚠️ order_items 表: ${err.message}`);
    }

    // 9. 为 orders 表添加缺失字段
    try {
      await db.query(`ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_status VARCHAR(20) DEFAULT 'pending'`);
      results.push('✅ orders 表字段补充成功');
    } catch (err: any) {
      results.push(`⚠️ orders 字段: ${err.message}`);
    }

    // 10. 插入订单示例数据
    try {
      const orderResult = await db.query(`
        INSERT INTO orders (order_no, user_id, total_amount, payment_method, payment_status, shipping_status, status) VALUES
        ('ORDER' || to_char(NOW(), 'YYYYMMDD') || '001', 1, 299.00, 'alipay', 'paid', 'shipped', 'pending'),
        ('ORDER' || to_char(NOW(), 'YYYYMMDD') || '002', 1, 158.00, 'wechat', 'paid', 'pending', 'pending'),
        ('ORDER' || to_char(NOW(), 'YYYYMMDD') || '003', 1, 599.00, 'alipay', 'pending', 'pending', 'pending'),
        ('ORDER' || to_char(NOW(), 'YYYYMMDD') || '004', 1, 89.00, 'wechat', 'paid', 'delivered', 'completed'),
        ('ORDER' || to_char(NOW(), 'YYYYMMDD') || '005', 1, 239.00, 'alipay', 'paid', 'shipped', 'pending')
        ON CONFLICT (order_no) DO NOTHING
        RETURNING id
      `);

      if (orderResult.rows.length > 0) {
        // 为第一个订单添加订单项
        await db.query(`
          INSERT INTO order_items (order_id, product_id, product_name, sku_name, price, quantity) VALUES
          (${orderResult.rows[0].id}, 1, '皇家猫粮', '成猫粮 2kg', 299.00, 1)
          ON CONFLICT DO NOTHING
        `);
      }

      results.push('✅ 订单示例数据插入成功');
    } catch (err: any) {
      results.push(`⚠️ 订单数据: ${err.message}`);
    }

    // 11. 插入商品数据
    try {
      const productResult = await db.query(`
        INSERT INTO products (name, category_id, brand_id, description, images) VALUES
        ('皇家猫粮成猫粮', 1, 1, '专为成年猫设计的全价猫粮，营养均衡，适口性好', '["https://images.unsplash.com/photo-1589924691995-400dc9ecc119?w=800"]'),
        ('宝路狗粮成犬粮', 2, 2, '优质狗粮，富含蛋白质和维生素，适合成年犬', '["https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=800"]'),
        ('伟嘉幼猫粮', 1, 3, '专为幼猫设计，易消化易吸收', '["https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=800"]'),
        ('比瑞吉鸡肉粒', 3, 4, '纯鸡肉制作，营养美味的宠物零食', '["https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=800"]'),
        ('冠能幼犬粮', 2, 5, '富含DHA和益生菌，促进幼犬健康成长', '["https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=800"]'),
        ('猫咪玩具球', 5, NULL, '互动玩具，让猫咪更活泼', '["https://images.unsplash.com/photo-1579547945413-497e1b99dac0?w=800"]'),
        ('狗狗磨牙棒', 3, NULL, '健康磨牙，清洁牙齿', '["https://images.unsplash.com/photo-1598134493553-a5af9c28c8c8?w=800"]'),
        ('宠物饮水器', 4, NULL, '自动循环过滤饮水器', '["https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?w=800"]')
        ON CONFLICT DO NOTHING
        RETURNING id
      `);

      // 为每个商品插入SKU
      if (productResult.rows.length > 0) {
        const productIds = productResult.rows.map(r => r.id);

        await db.query(`
          INSERT INTO product_skus (product_id, name, price, stock, specs) VALUES
          (${productIds[0] || 1}, '2kg装', 299.00, 100, '{"weight": "2kg"}'),
          (${productIds[0] || 1}, '5kg装', 599.00, 50, '{"weight": "5kg"}'),
          (${productIds[1] || 2}, '3kg装', 158.00, 80, '{"weight": "3kg"}'),
          (${productIds[1] || 2}, '10kg装', 468.00, 30, '{"weight": "10kg"}'),
          (${productIds[2] || 3}, '1.5kg装', 189.00, 60, '{"weight": "1.5kg"}'),
          (${productIds[3] || 4}, '500g装', 89.00, 120, '{"weight": "500g"}'),
          (${productIds[4] || 5}, '5kg装', 239.00, 40, '{"weight": "5kg"}'),
          (${productIds[5] || 6}, '单个装', 29.00, 200, '{"color": "随机"}'),
          (${productIds[6] || 7}, '3根装', 45.00, 150, '{"count": "3"}'),
          (${productIds[7] || 8}, '2L容量', 139.00, 80, '{"capacity": "2L"}')
          ON CONFLICT DO NOTHING
        `);
      }

      results.push('✅ 商品和SKU数据插入成功');
    } catch (err: any) {
      results.push(`⚠️ 商品数据: ${err.message}`);
    }

    // 12. 更新现有数据
    try {
      await db.query(`UPDATE categories SET sort = id WHERE sort IS NULL OR sort = 0`);
      await db.query(`UPDATE products SET description = '优质宠物商品，值得信赖' WHERE description IS NULL OR description = ''`);
      results.push('✅ 现有数据更新成功');
    } catch (err: any) {
      results.push(`⚠️ 数据更新: ${err.message}`);
    }

    return res.status(200).json({
      code: 200,
      message: '数据库初始化完成',
      data: {
        results
      }
    });

  } catch (error: any) {
    console.error('Init data error:', error);
    return res.status(500).json({
      code: 500,
      message: '初始化失败',
      error: error.message
    });
  }
};

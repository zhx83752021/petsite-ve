import { VercelRequest, VercelResponse } from '@vercel/node';
import { Pool } from 'pg';

let pool: Pool | null = null;

const getPool = () => {
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      max: 2,
      idleTimeoutMillis: 1000,
    });
  }
  return pool;
};

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

    // 7. 更新现有数据
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

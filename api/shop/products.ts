import { VercelRequest, VercelResponse } from '@vercel/node';
import { Pool } from 'pg';

// 创建数据库连接池（全局复用）
let pool: Pool | null = null;

const getPool = () => {
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      max: 2,
      idleTimeoutMillis: 1000,
      connectionTimeoutMillis: 5000,
    });
  }
  return pool;
};

export default async (req: VercelRequest, res: VercelResponse) => {
  // 设置 CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    return res.status(405).json({
      code: 405,
      message: 'Method not allowed'
    });
  }

  try {
    const db = getPool();

    // 查询商品列表
    const result = await db.query(`
      SELECT
        p.id,
        p.name,
        p.description,
        p.category_id,
        c.name as category_name,
        p.images,
        p.status,
        p.created_at,
        p.updated_at,
        MIN(ps.price) as min_price,
        MAX(ps.price) as max_price,
        SUM(ps.stock) as total_stock
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN product_skus ps ON p.id = ps.product_id
      WHERE p.deleted_at IS NULL
      GROUP BY p.id, c.name
      ORDER BY p.created_at DESC
    `);

    res.status(200).json({
      code: 0,
      message: 'success',
      data: result.rows
    });
  } catch (error: any) {
    console.error('Database error:', error);
    res.status(500).json({
      code: 500,
      message: '服务器错误',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

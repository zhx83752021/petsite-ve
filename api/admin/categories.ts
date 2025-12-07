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
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    const db = getPool();

    // GET - 获取分类列表
    if (req.method === 'GET') {
      const result = await db.query(`
        SELECT id, name, icon, description, sort, created_at, updated_at
        FROM categories
        ORDER BY sort ASC, id DESC
      `);

      return res.status(200).json({
        code: 200,
        message: 'success',
        data: {
          items: result.rows,
          total: result.rows.length
        }
      });
    }

    return res.status(405).json({
      code: 405,
      message: 'Method not allowed'
    });

  } catch (error: any) {
    console.error('Categories API error:', error);
    res.status(500).json({
      code: 500,
      message: '服务器错误',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

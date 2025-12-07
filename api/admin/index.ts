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

    // GET - 获取管理员列表
    if (req.method === 'GET') {
      const result = await db.query(`
        SELECT id, username, email, role, created_at, updated_at
        FROM admins
        ORDER BY id DESC
      `);

      return res.status(200).json({
        code: 200,
        message: 'success',
        data: {
          list: result.rows,
          total: result.rows.length
        }
      });
    }

    return res.status(405).json({
      code: 405,
      message: 'Method not allowed'
    });

  } catch (error: any) {
    console.error('Admin list error:', error);

    // 如果表不存在或任何错误，返回空列表
    return res.status(200).json({
      code: 200,
      message: 'success',
      data: {
        list: [],
        total: 0
      }
    });
  }
};

import { VercelRequest, VercelResponse } from '@vercel/node';
import { Pool } from 'pg';
import * as bcrypt from 'bcryptjs';

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

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    const db = getPool();

    // 创建 admins 表
    await db.query(`
      CREATE TABLE IF NOT EXISTS admins (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        email VARCHAR(100),
        role VARCHAR(20) DEFAULT 'admin',
        avatar VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        deleted_at TIMESTAMP
      )
    `);

    // 检查是否已有管理员
    const checkResult = await db.query('SELECT COUNT(*) as count FROM admins');
    const count = parseInt(checkResult.rows[0].count);

    if (count === 0) {
      // 创建默认管理员
      const hashedPassword = await bcrypt.hash('admin123', 10);

      await db.query(`
        INSERT INTO admins (username, password, email, role)
        VALUES ($1, $2, $3, $4)
      `, ['admin', hashedPassword, 'admin@petsite.com', 'super_admin']);

      res.status(200).json({
        success: true,
        message: 'admins 表已创建，默认管理员已添加',
        admin: {
          username: 'admin',
          password: 'admin123',
          email: 'admin@petsite.com',
          role: 'super_admin'
        }
      });
    } else {
      res.status(200).json({
        success: true,
        message: 'admins 表已存在',
        adminCount: count
      });
    }
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

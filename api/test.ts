import { VercelRequest, VercelResponse } from '@vercel/node';

export default async (req: VercelRequest, res: VercelResponse) => {
  // 设置 CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    // 测试环境变量
    const hasDatabase = !!process.env.DATABASE_URL;
    const hasJwtSecret = !!process.env.JWT_SECRET;

    // 测试数据库连接
    let dbStatus = 'not tested';
    let dbError = null;

    if (hasDatabase) {
      try {
        const { Pool } = require('pg');
        const pool = new Pool({
          connectionString: process.env.DATABASE_URL,
          max: 1,
          connectionTimeoutMillis: 5000,
        });

        const result = await pool.query('SELECT NOW()');
        dbStatus = 'connected';
        await pool.end();
      } catch (error: any) {
        dbStatus = 'failed';
        dbError = error.message;
      }
    }

    res.status(200).json({
      success: true,
      message: 'API 测试成功',
      environment: {
        NODE_ENV: process.env.NODE_ENV || 'not set',
        hasDatabase,
        hasJwtSecret,
        databaseStatus: dbStatus,
        databaseError: dbError
      },
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'API 测试失败',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

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
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS,GET');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    const db = getPool();

    let debugInfo: any = {
      method: req.method,
      body: req.body,
      contentType: req.headers['content-type']
    };

    // 检查 admins 表
    const adminsResult = await db.query('SELECT id, username, role FROM admins');
    debugInfo.adminsInDb = adminsResult.rows;

    // 如果是 POST 请求，尝试登录
    if (req.method === 'POST') {
      const { username, password } = req.body || {};

      debugInfo.receivedUsername = username;
      debugInfo.receivedPassword = password ? '***' : 'empty';

      if (username && password) {
        // 查询用户
        const userResult = await db.query(
          'SELECT * FROM admins WHERE username = $1',
          [username]
        );

        debugInfo.userFound = userResult.rows.length > 0;

        if (userResult.rows.length > 0) {
          const user = userResult.rows[0];
          debugInfo.userRole = user.role;

          // 验证密码
          const isValid = await bcrypt.compare(password, user.password);
          debugInfo.passwordValid = isValid;

          if (isValid) {
            return res.status(200).json({
              success: true,
              message: '登录成功',
              debug: debugInfo
            });
          }
        }
      }
    }

    res.status(200).json({
      success: false,
      message: '调试信息',
      debug: debugInfo
    });

  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
      stack: error.stack
    });
  }
};

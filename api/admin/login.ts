import { VercelRequest, VercelResponse } from '@vercel/node';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import { getPool } from '../_db';

export default async (req: VercelRequest, res: VercelResponse) => {
  // 设置 CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
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
    const { username, password } = req.body;

    // 验证输入
    if (!username || !password) {
      return res.status(400).json({
        code: 400,
        message: '用户名和密码不能为空'
      });
    }

    const db = getPool();

    // 查询管理员
    const result = await db.query(
      'SELECT * FROM admins WHERE username = $1 AND deleted_at IS NULL',
      [username]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        code: 401,
        message: '用户名或密码错误'
      });
    }

    const admin = result.rows[0];

    // 验证密码
    const isPasswordValid = await bcrypt.compare(password, admin.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        code: 401,
        message: '用户名或密码错误'
      });
    }

    // 生成 JWT Token
    const jwtSecret = process.env.JWT_SECRET || 'your-super-secret-jwt-key-min-32-chars';
    const token = jwt.sign(
      {
        id: admin.id,
        username: admin.username,
        role: 'admin'
      },
      jwtSecret,
      {
        expiresIn: process.env.JWT_EXPIRES_IN || '7d'
      } as jwt.SignOptions
    );

    // 返回成功响应
    res.status(200).json({
      code: 200,
      message: '登录成功',
      data: {
        token,
        admin: {
          id: admin.id,
          username: admin.username,
          realName: admin.real_name || admin.username,
          email: admin.email || '',
          phone: admin.phone || '',
          status: admin.status || 1
        }
      }
    });
  } catch (error: any) {
    console.error('Login error:', error);
    res.status(500).json({
      code: 500,
      message: '服务器错误',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

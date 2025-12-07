/**
 * 用户登录 API
 */
import type { VercelRequest, VercelResponse } from '@vercel/node';
import pkg from 'pg';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const { Client } = pkg;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // 设置 CORS 头
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(200).json({
      code: 405,
      message: '方法不允许',
      data: null,
    });
  }

  const { username, password } = req.body || {};

  if (!username || !password) {
    return res.status(200).json({
      code: 400,
      message: '用户名和密码不能为空',
      data: null,
    });
  }

  const client = new Client({
    connectionString: process.env.POSTGRES_URL || process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false,
    },
  });

  try {
    await client.connect();

    // 查询用户
    const result = await client.query(
      "SELECT id, username, password, email, phone, avatar, role, status FROM users WHERE username = $1 AND role = 'user'",
      [username]
    );

    await client.end();

    if (result.rows.length === 0) {
      return res.status(200).json({
        code: 401,
        message: '用户名或密码错误',
        data: null,
      });
    }

    const user = result.rows[0];

    // 检查账号状态
    if (user.status !== 'active' && user.status !== 1) {
      return res.status(200).json({
        code: 403,
        message: '账号已被禁用',
        data: null,
      });
    }

    // 验证密码
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(200).json({
        code: 401,
        message: '用户名或密码错误',
        data: null,
      });
    }

    // 生成 token
    const token = jwt.sign(
      {
        id: user.id,
        username: user.username,
        role: user.role,
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    // 返回用户信息（不包含密码）
    const { password: _, ...userInfo } = user;

    res.status(200).json({
      code: 200,
      message: '登录成功',
      data: {
        token,
        user: userInfo,
      },
    });
  } catch (error: any) {
    console.error('[API] 登录失败:', error);

    if (client) {
      try {
        await client.end();
      } catch (e) {
        // ignore
      }
    }

    res.status(200).json({
      code: 500,
      message: error.message || '登录失败',
      data: null,
    });
  }
}

/**
 * 管理员登录 API
 */
import type { VercelRequest, VercelResponse } from '@vercel/node';
import pkg from 'pg';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const { Client } = pkg;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // 只允许 POST 请求
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

    // 查询管理员
    const result = await client.query(
      'SELECT id, username, password, nickname, email, role, status FROM admins WHERE username = $1',
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

    const admin = result.rows[0];

    // 检查账号状态
    if (admin.status !== 1) {
      return res.status(200).json({
        code: 403,
        message: '账号已被禁用',
        data: null,
      });
    }

    // 验证密码
    const isValidPassword = await bcrypt.compare(password, admin.password);
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
        id: admin.id,
        username: admin.username,
        role: admin.role,
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    // 返回用户信息（不包含密码）
    const { password: _, ...adminInfo } = admin;

    res.status(200).json({
      code: 200,
      message: '登录成功',
      data: {
        token,
        adminInfo,
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

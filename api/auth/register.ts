/**
 * 用户注册 API
 */
import type { VercelRequest, VercelResponse } from '@vercel/node';
import pkg from 'pg';
import bcrypt from 'bcryptjs';

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

  const { username, password, email, phone } = req.body || {};

  // 参数验证
  if (!username || !password) {
    return res.status(200).json({
      code: 400,
      message: '用户名和密码不能为空',
      data: null,
    });
  }

  if (password.length < 6) {
    return res.status(200).json({
      code: 400,
      message: '密码长度至少为6位',
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

    // 检查用户名是否已存在
    const existingUser = await client.query(
      'SELECT id FROM users WHERE username = $1',
      [username]
    );

    if (existingUser.rows.length > 0) {
      await client.end();
      return res.status(200).json({
        code: 400,
        message: '用户名已存在',
        data: null,
      });
    }

    // 如果提供了邮箱，检查邮箱是否已存在
    if (email) {
      const existingEmail = await client.query(
        'SELECT id FROM users WHERE email = $1',
        [email]
      );

      if (existingEmail.rows.length > 0) {
        await client.end();
        return res.status(200).json({
          code: 400,
          message: '邮箱已被注册',
          data: null,
        });
      }
    }

    // 加密密码
    const hashedPassword = await bcrypt.hash(password, 10);

    // 创建用户
    const result = await client.query(
      `INSERT INTO users (username, password, email, phone, role, status)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, username, email, phone, created_at`,
      [username, hashedPassword, email || null, phone || null, 'user', 'active']
    );

    await client.end();

    const newUser = result.rows[0];

    res.status(200).json({
      code: 200,
      message: '注册成功',
      data: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        phone: newUser.phone,
        createdAt: newUser.created_at,
      },
    });
  } catch (error: any) {
    console.error('[API] 注册失败:', error);

    if (client) {
      try {
        await client.end();
      } catch (e) {
        // ignore
      }
    }

    res.status(200).json({
      code: 500,
      message: error.message || '注册失败',
      data: null,
    });
  }
}

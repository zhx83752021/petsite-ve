/**
 * 用户个人信息管理 API
 * GET - 获取用户信息
 * PUT - 更新用户信息
 */
import type { VercelRequest, VercelResponse } from '@vercel/node';
import pkg from 'pg';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const { Client } = pkg;

// 验证 token 并获取用户 ID
function getUserIdFromToken(req: VercelRequest): number | null {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return null;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as any;
    return decoded.id;
  } catch (error) {
    return null;
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // 设置 CORS 头
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // 验证用户身份
  const userId = getUserIdFromToken(req);
  if (!userId) {
    return res.status(200).json({
      code: 401,
      message: '请先登录',
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

    // GET - 获取用户信息
    if (req.method === 'GET') {
      const result = await client.query(
        'SELECT id, username, email, phone, avatar, role, status, created_at FROM users WHERE id = $1',
        [userId]
      );

      await client.end();

      if (result.rows.length === 0) {
        return res.status(200).json({
          code: 404,
          message: '用户不存在',
          data: null,
        });
      }

      const user = result.rows[0];

      return res.status(200).json({
        code: 200,
        message: 'success',
        data: {
          id: user.id,
          username: user.username,
          email: user.email,
          phone: user.phone,
          avatar: user.avatar,
          role: user.role,
          status: user.status,
          createdAt: user.created_at,
        },
      });
    }

    // PUT - 更新用户信息
    if (req.method === 'PUT') {
      const { email, phone, avatar, oldPassword, newPassword } = req.body || {};

      // 如果要修改密码，需要验证旧密码
      if (newPassword) {
        if (!oldPassword) {
          await client.end();
          return res.status(200).json({
            code: 400,
            message: '请输入旧密码',
            data: null,
          });
        }

        if (newPassword.length < 6) {
          await client.end();
          return res.status(200).json({
            code: 400,
            message: '新密码长度至少为6位',
            data: null,
          });
        }

        // 验证旧密码
        const userResult = await client.query(
          'SELECT password FROM users WHERE id = $1',
          [userId]
        );

        const isValidPassword = await bcrypt.compare(oldPassword, userResult.rows[0].password);
        if (!isValidPassword) {
          await client.end();
          return res.status(200).json({
            code: 400,
            message: '旧密码错误',
            data: null,
          });
        }

        // 加密新密码
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        await client.query(
          'UPDATE users SET password = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
          [hashedPassword, userId]
        );
      }

      // 更新其他信息
      const updateFields: string[] = ['updated_at = CURRENT_TIMESTAMP'];
      const updateParams: any[] = [];
      let paramIndex = 1;

      if (email !== undefined) {
        // 检查邮箱是否已被其他用户使用
        const emailCheck = await client.query(
          'SELECT id FROM users WHERE email = $1 AND id != $2',
          [email, userId]
        );

        if (emailCheck.rows.length > 0) {
          await client.end();
          return res.status(200).json({
            code: 400,
            message: '该邮箱已被使用',
            data: null,
          });
        }

        updateFields.push(`email = $${paramIndex}`);
        updateParams.push(email);
        paramIndex++;
      }

      if (phone !== undefined) {
        updateFields.push(`phone = $${paramIndex}`);
        updateParams.push(phone);
        paramIndex++;
      }

      if (avatar !== undefined) {
        updateFields.push(`avatar = $${paramIndex}`);
        updateParams.push(avatar);
        paramIndex++;
      }

      if (updateParams.length > 0) {
        updateParams.push(userId);
        await client.query(
          `UPDATE users SET ${updateFields.join(', ')} WHERE id = $${paramIndex}`,
          updateParams
        );
      }

      await client.end();

      return res.status(200).json({
        code: 200,
        message: '更新成功',
        data: null,
      });
    }

    await client.end();

    return res.status(200).json({
      code: 405,
      message: '方法不允许',
      data: null,
    });
  } catch (error: any) {
    console.error('[API] 用户信息操作失败:', error);

    if (client) {
      try {
        await client.end();
      } catch (e) {
        // ignore
      }
    }

    res.status(200).json({
      code: 500,
      message: error.message || '操作失败',
      data: null,
    });
  }
}

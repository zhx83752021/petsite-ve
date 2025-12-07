/**
 * 用户地址管理 API
 * GET - 获取地址列表
 * POST - 添加新地址
 * PUT - 更新地址
 * DELETE - 删除地址
 */
import type { VercelRequest, VercelResponse } from '@vercel/node';
import pkg from 'pg';
import jwt from 'jsonwebtoken';

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
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
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

    // GET - 获取地址列表
    if (req.method === 'GET') {
      const result = await client.query(
        `SELECT * FROM user_addresses
         WHERE user_id = $1
         ORDER BY is_default DESC, created_at DESC`,
        [userId]
      );

      await client.end();

      const addresses = result.rows.map((row: any) => ({
        id: row.id,
        name: row.name,
        phone: row.phone,
        province: row.province,
        city: row.city,
        district: row.district,
        detail: row.detail,
        postalCode: row.postal_code,
        isDefault: row.is_default,
        createdAt: row.created_at,
      }));

      return res.status(200).json({
        code: 200,
        message: 'success',
        data: addresses,
      });
    }

    // POST - 添加新地址
    if (req.method === 'POST') {
      const { name, phone, province, city, district, detail, postalCode, isDefault } = req.body || {};

      // 参数验证
      if (!name || !phone || !province || !city || !district || !detail) {
        await client.end();
        return res.status(200).json({
          code: 400,
          message: '地址信息不完整',
          data: null,
        });
      }

      // 如果设置为默认地址，先取消其他默认地址
      if (isDefault) {
        await client.query(
          'UPDATE user_addresses SET is_default = false WHERE user_id = $1',
          [userId]
        );
      }

      const result = await client.query(
        `INSERT INTO user_addresses (user_id, name, phone, province, city, district, detail, postal_code, is_default)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         RETURNING id`,
        [userId, name, phone, province, city, district, detail, postalCode, isDefault || false]
      );

      await client.end();

      return res.status(200).json({
        code: 200,
        message: '添加成功',
        data: { id: result.rows[0].id },
      });
    }

    // PUT - 更新地址
    if (req.method === 'PUT') {
      const { id, name, phone, province, city, district, detail, postalCode, isDefault } = req.body || {};

      if (!id) {
        await client.end();
        return res.status(200).json({
          code: 400,
          message: '地址ID不能为空',
          data: null,
        });
      }

      // 验证地址是否属于当前用户
      const addressCheck = await client.query(
        'SELECT id FROM user_addresses WHERE id = $1 AND user_id = $2',
        [id, userId]
      );

      if (addressCheck.rows.length === 0) {
        await client.end();
        return res.status(200).json({
          code: 404,
          message: '地址不存在',
          data: null,
        });
      }

      // 如果设置为默认地址，先取消其他默认地址
      if (isDefault) {
        await client.query(
          'UPDATE user_addresses SET is_default = false WHERE user_id = $1 AND id != $2',
          [userId, id]
        );
      }

      await client.query(
        `UPDATE user_addresses
         SET name = $1, phone = $2, province = $3, city = $4, district = $5,
             detail = $6, postal_code = $7, is_default = $8, updated_at = CURRENT_TIMESTAMP
         WHERE id = $9`,
        [name, phone, province, city, district, detail, postalCode, isDefault || false, id]
      );

      await client.end();

      return res.status(200).json({
        code: 200,
        message: '更新成功',
        data: null,
      });
    }

    // DELETE - 删除地址
    if (req.method === 'DELETE') {
      const { id } = req.query;

      if (!id) {
        await client.end();
        return res.status(200).json({
          code: 400,
          message: '地址ID不能为空',
          data: null,
        });
      }

      await client.query(
        'DELETE FROM user_addresses WHERE id = $1 AND user_id = $2',
        [id, userId]
      );

      await client.end();

      return res.status(200).json({
        code: 200,
        message: '删除成功',
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
    console.error('[API] 地址操作失败:', error);

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

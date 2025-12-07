/**
 * 用户订单查询 API
 * GET - 获取用户订单列表
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
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(200).json({
      code: 405,
      message: '方法不允许',
      data: null,
    });
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

    const { page = 1, pageSize = 10, status = '' } = req.query;

    const conditions: string[] = ['user_id = $1'];
    const params: any[] = [userId];
    let paramIndex = 2;

    // 状态筛选
    if (status) {
      conditions.push(`status = $${paramIndex}`);
      params.push(status);
      paramIndex++;
    }

    const whereClause = conditions.join(' AND ');

    // 计算偏移量
    const offset = (parseInt(page as string) - 1) * parseInt(pageSize as string);
    const limit = parseInt(pageSize as string);

    // 查询订单列表
    const result = await client.query(`
      SELECT *
      FROM orders
      WHERE ${whereClause}
      ORDER BY created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `, [...params, limit, offset]);

    // 查询总数
    const countResult = await client.query(`
      SELECT COUNT(*) as total
      FROM orders
      WHERE ${whereClause}
    `, params);

    await client.end();

    const orders = result.rows.map((row: any) => ({
      id: row.id,
      orderNo: row.order_no,
      totalAmount: parseFloat(row.total_amount),
      status: row.status,
      receiverName: row.receiver_name,
      receiverPhone: row.receiver_phone,
      receiverAddress: row.receiver_address,
      remark: row.remark,
      createdAt: row.created_at,
      paidAt: row.paid_at,
      shippedAt: row.shipped_at,
      completedAt: row.completed_at,
      cancelledAt: row.cancelled_at,
    }));

    const total = parseInt(countResult.rows[0]?.total || '0');

    return res.status(200).json({
      code: 200,
      message: 'success',
      data: {
        list: orders,
        pagination: {
          total,
          page: parseInt(page as string),
          pageSize: parseInt(pageSize as string),
        },
      },
    });
  } catch (error: any) {
    console.error('[API] 查询订单失败:', error);

    if (client) {
      try {
        await client.end();
      } catch (e) {
        // ignore
      }
    }

    res.status(200).json({
      code: 500,
      message: error.message || '查询失败',
      data: null,
    });
  }
}

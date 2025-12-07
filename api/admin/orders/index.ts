/**
 * 管理后台 - 订单列表管理 API
 * GET - 获取订单列表
 */
import type { VercelRequest, VercelResponse } from '@vercel/node';
import pkg from 'pg';
import jwt from 'jsonwebtoken';

const { Client } = pkg;

// 验证管理员 token
function getAdminIdFromToken(req: VercelRequest): number | null {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return null;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as any;
    if (decoded.role !== 'admin') return null;
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

  // 验证管理员身份
  const adminId = getAdminIdFromToken(req);
  if (!adminId) {
    return res.status(200).json({
      code: 401,
      message: '需要管理员权限',
      data: null,
    });
  }

  if (req.method !== 'GET') {
    return res.status(200).json({
      code: 405,
      message: '方法不允许',
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

    const {
      page = 1,
      pageSize = 20,
      orderNo = '',
      status = '',
      startDate = '',
      endDate = '',
    } = req.query;

    const conditions: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    // 订单号搜索
    if (orderNo) {
      conditions.push(`o.order_no ILIKE $${paramIndex}`);
      params.push(`%${orderNo}%`);
      paramIndex++;
    }

    // 状态筛选
    if (status) {
      conditions.push(`o.status = $${paramIndex}`);
      params.push(status);
      paramIndex++;
    }

    // 日期范围筛选
    if (startDate) {
      conditions.push(`o.created_at >= $${paramIndex}`);
      params.push(startDate);
      paramIndex++;
    }

    if (endDate) {
      conditions.push(`o.created_at <= $${paramIndex}`);
      params.push(endDate);
      paramIndex++;
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // 计算偏移量
    const offset = (parseInt(page as string) - 1) * parseInt(pageSize as string);
    const limit = parseInt(pageSize as string);

    // 查询订单列表
    const result = await client.query(`
      SELECT
        o.id,
        o.order_no,
        o.user_id,
        o.total_amount,
        o.status,
        o.receiver_name,
        o.receiver_phone,
        o.receiver_address,
        o.created_at,
        o.updated_at,
        o.paid_at,
        o.shipped_at,
        o.completed_at,
        u.username
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
      ${whereClause}
      ORDER BY o.created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `, [...params, limit, offset]);

    // 查询总数
    const countResult = await client.query(`
      SELECT COUNT(*) as total
      FROM orders o
      ${whereClause}
    `, params);

    await client.end();

    const orders = result.rows.map((row: any) => ({
      id: row.id,
      orderNo: row.order_no,
      userId: row.user_id,
      username: row.username,
      totalAmount: parseFloat(row.total_amount),
      status: row.status,
      receiverName: row.receiver_name,
      receiverPhone: row.receiver_phone,
      receiverAddress: row.receiver_address,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      paidAt: row.paid_at,
      shippedAt: row.shipped_at,
      completedAt: row.completed_at,
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

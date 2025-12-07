/**
 * 管理后台 - 销售统计 API
 * 支持按日、周、月统计
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

  if (req.method !== 'GET') {
    return res.status(200).json({
      code: 405,
      message: '方法不允许',
      data: null,
    });
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

  const { type = 'day', startDate, endDate } = req.query;

  const client = new Client({
    connectionString: process.env.POSTGRES_URL || process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false,
    },
  });

  try {
    await client.connect();

    let query = '';
    let groupBy = '';

    // 根据类型选择分组方式
    switch (type) {
      case 'day':
        groupBy = "DATE(created_at)";
        query = `
          SELECT
            DATE(created_at) as period,
            COUNT(*) as order_count,
            COALESCE(SUM(CASE WHEN status != 'cancelled' THEN total_amount ELSE 0 END), 0) as total_amount,
            COALESCE(SUM(CASE WHEN status = 'completed' THEN total_amount ELSE 0 END), 0) as completed_amount
          FROM orders
          WHERE 1=1
        `;
        break;
      case 'week':
        groupBy = "DATE_TRUNC('week', created_at)";
        query = `
          SELECT
            DATE_TRUNC('week', created_at) as period,
            COUNT(*) as order_count,
            COALESCE(SUM(CASE WHEN status != 'cancelled' THEN total_amount ELSE 0 END), 0) as total_amount,
            COALESCE(SUM(CASE WHEN status = 'completed' THEN total_amount ELSE 0 END), 0) as completed_amount
          FROM orders
          WHERE 1=1
        `;
        break;
      case 'month':
        groupBy = "DATE_TRUNC('month', created_at)";
        query = `
          SELECT
            DATE_TRUNC('month', created_at) as period,
            COUNT(*) as order_count,
            COALESCE(SUM(CASE WHEN status != 'cancelled' THEN total_amount ELSE 0 END), 0) as total_amount,
            COALESCE(SUM(CASE WHEN status = 'completed' THEN total_amount ELSE 0 END), 0) as completed_amount
          FROM orders
          WHERE 1=1
        `;
        break;
      default:
        await client.end();
        return res.status(200).json({
          code: 400,
          message: '无效的统计类型',
          data: null,
        });
    }

    const params: any[] = [];
    let paramIndex = 1;

    // 日期范围筛选
    if (startDate) {
      query += ` AND created_at >= $${paramIndex}`;
      params.push(startDate);
      paramIndex++;
    }

    if (endDate) {
      query += ` AND created_at <= $${paramIndex}`;
      params.push(endDate);
      paramIndex++;
    }

    query += ` GROUP BY ${groupBy} ORDER BY period DESC`;

    const result = await client.query(query, params);

    await client.end();

    const data = result.rows.map((row: any) => ({
      period: row.period,
      orderCount: parseInt(row.order_count),
      totalAmount: parseFloat(row.total_amount),
      completedAmount: parseFloat(row.completed_amount),
    }));

    return res.status(200).json({
      code: 200,
      message: 'success',
      data: {
        type,
        list: data,
        summary: {
          totalOrders: data.reduce((sum, item) => sum + item.orderCount, 0),
          totalAmount: data.reduce((sum, item) => sum + item.totalAmount, 0),
          completedAmount: data.reduce((sum, item) => sum + item.completedAmount, 0),
        },
      },
    });
  } catch (error: any) {
    console.error('[API] 销售统计查询失败:', error);

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

/**
 * 管理后台 - 订单数据导出 API
 * 导出为 CSV 格式
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

// 将数据转换为 CSV 格式
function arrayToCSV(data: any[], headers: string[]): string {
  const headerRow = headers.join(',');
  const dataRows = data.map(row => {
    return headers.map(header => {
      const value = row[header] || '';
      // 处理包含逗号或换行符的字段
      if (typeof value === 'string' && (value.includes(',') || value.includes('\n') || value.includes('"'))) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value;
    }).join(',');
  });

  return [headerRow, ...dataRows].join('\n');
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

  const { startDate, endDate, status } = req.query;

  const client = new Client({
    connectionString: process.env.POSTGRES_URL || process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false,
    },
  });

  try {
    await client.connect();

    const conditions: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

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

    // 状态筛选
    if (status) {
      conditions.push(`o.status = $${paramIndex}`);
      params.push(status);
      paramIndex++;
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // 查询订单数据
    const result = await client.query(`
      SELECT
        o.id,
        o.order_no,
        o.user_id,
        u.username,
        o.total_amount,
        o.status,
        o.receiver_name,
        o.receiver_phone,
        o.receiver_address,
        o.remark,
        o.created_at,
        o.paid_at,
        o.shipped_at,
        o.completed_at
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
      ${whereClause}
      ORDER BY o.created_at DESC
    `, params);

    await client.end();

    // 转换为 CSV 格式
    const headers = [
      'id',
      'order_no',
      'username',
      'total_amount',
      'status',
      'receiver_name',
      'receiver_phone',
      'receiver_address',
      'remark',
      'created_at',
      'paid_at',
      'shipped_at',
      'completed_at',
    ];

    const csvData = arrayToCSV(result.rows, headers);

    // 设置响应头为 CSV 文件下载
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename=orders_${Date.now()}.csv`);

    // 添加 UTF-8 BOM 以支持 Excel 正确显示中文
    res.status(200).send('\uFEFF' + csvData);
  } catch (error: any) {
    console.error('[API] 订单导出失败:', error);

    if (client) {
      try {
        await client.end();
      } catch (e) {
        // ignore
      }
    }

    res.status(200).json({
      code: 500,
      message: error.message || '导出失败',
      data: null,
    });
  }
}

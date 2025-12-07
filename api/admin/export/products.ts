/**
 * 管理后台 - 商品数据导出 API
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

  const { categoryId, status } = req.query;

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

    // 分类筛选
    if (categoryId) {
      conditions.push(`p.category_id = $${paramIndex}`);
      params.push(categoryId);
      paramIndex++;
    }

    // 状态筛选
    if (status) {
      conditions.push(`p.status = $${paramIndex}`);
      params.push(status);
      paramIndex++;
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // 查询商品数据
    const result = await client.query(`
      SELECT
        p.id,
        p.name,
        p.subtitle,
        c.name as category_name,
        p.sales,
        p.status,
        MIN(ps.price) as min_price,
        MAX(ps.price) as max_price,
        SUM(ps.stock) as total_stock,
        p.created_at
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN product_skus ps ON p.id = ps.product_id
      ${whereClause}
      GROUP BY p.id, p.name, p.subtitle, c.name, p.sales, p.status, p.created_at
      ORDER BY p.created_at DESC
    `, params);

    await client.end();

    // 转换为 CSV 格式
    const headers = [
      'id',
      'name',
      'subtitle',
      'category_name',
      'sales',
      'status',
      'min_price',
      'max_price',
      'total_stock',
      'created_at',
    ];

    const csvData = arrayToCSV(result.rows, headers);

    // 设置响应头为 CSV 文件下载
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename=products_${Date.now()}.csv`);

    // 添加 UTF-8 BOM
    res.status(200).send('\uFEFF' + csvData);
  } catch (error: any) {
    console.error('[API] 商品导出失败:', error);

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

/**
 * 管理后台 - 分类管理 API
 * GET - 获取分类列表
 * POST - 创建分类
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
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
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

  const client = new Client({
    connectionString: process.env.POSTGRES_URL || process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false,
    },
  });

  try {
    await client.connect();

    // GET - 获取分类列表（包含已禁用的）
    if (req.method === 'GET') {
      const { includeDisabled = 'false' } = req.query;

      let whereClause = '';
      if (includeDisabled !== 'true') {
        whereClause = 'WHERE status = 1';
      }

      const result = await client.query(`
        SELECT
          id,
          name,
          parent_id,
          icon,
          sort,
          status,
          created_at,
          updated_at
        FROM categories
        ${whereClause}
        ORDER BY sort ASC, id ASC
      `);

      await client.end();

      // 构建树形结构
      const categories = result.rows;
      const categoryMap = new Map();
      const rootCategories: any[] = [];

      // 第一遍：创建所有分类对象并统计商品数
      for (const cat of categories) {
        // 查询该分类下的商品数量
        const productCountResult = await client.query(
          'SELECT COUNT(*) as count FROM products WHERE category_id = $1',
          [cat.id]
        );

        categoryMap.set(cat.id, {
          id: cat.id,
          name: cat.name,
          parentId: cat.parent_id,
          icon: cat.icon,
          sort: cat.sort,
          status: cat.status,
          productCount: parseInt(productCountResult.rows[0]?.count || '0'),
          createdAt: cat.created_at,
          updatedAt: cat.updated_at,
          children: [],
        });
      }

      // 第二遍：构建树形结构
      categories.forEach((cat: any) => {
        const category = categoryMap.get(cat.id);
        if (cat.parent_id) {
          const parent = categoryMap.get(cat.parent_id);
          if (parent) {
            parent.children.push(category);
          }
        } else {
          rootCategories.push(category);
        }
      });

      return res.status(200).json({
        code: 200,
        message: 'success',
        data: {
          list: rootCategories,
          total: rootCategories.length,
        },
      });
    }

    // POST - 创建分类
    if (req.method === 'POST') {
      const { name, parentId, icon, sort = 0, status = 1 } = req.body || {};

      if (!name) {
        await client.end();
        return res.status(200).json({
          code: 400,
          message: '分类名称不能为空',
          data: null,
        });
      }

      // 检查同级分类名称是否重复
      const existingResult = await client.query(
        'SELECT id FROM categories WHERE name = $1 AND parent_id IS NOT DISTINCT FROM $2',
        [name, parentId || null]
      );

      if (existingResult.rows.length > 0) {
        await client.end();
        return res.status(200).json({
          code: 400,
          message: '同级分类名称已存在',
          data: null,
        });
      }

      const result = await client.query(
        `INSERT INTO categories (name, parent_id, icon, sort, status)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id`,
        [name, parentId || null, icon, sort, status]
      );

      await client.end();

      return res.status(200).json({
        code: 200,
        message: '创建成功',
        data: { id: result.rows[0].id },
      });
    }

    await client.end();

    return res.status(200).json({
      code: 405,
      message: '方法不允许',
      data: null,
    });
  } catch (error: any) {
    console.error('[API] 分类管理失败:', error);

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

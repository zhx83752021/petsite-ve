/**
 * 管理后台 - 分类详情/编辑/删除 API
 * GET - 获取分类详情
 * PUT - 更新分类
 * DELETE - 删除分类
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
  res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, DELETE, OPTIONS');
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

  const { id } = req.query;

  if (!id) {
    return res.status(200).json({
      code: 400,
      message: '分类ID不能为空',
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

    // GET - 获取分类详情
    if (req.method === 'GET') {
      const result = await client.query(
        'SELECT * FROM categories WHERE id = $1',
        [id]
      );

      if (result.rows.length === 0) {
        await client.end();
        return res.status(200).json({
          code: 404,
          message: '分类不存在',
          data: null,
        });
      }

      // 查询商品数量
      const productCountResult = await client.query(
        'SELECT COUNT(*) as count FROM products WHERE category_id = $1',
        [id]
      );

      // 查询子分类数量
      const childCountResult = await client.query(
        'SELECT COUNT(*) as count FROM categories WHERE parent_id = $1',
        [id]
      );

      await client.end();

      const category = result.rows[0];

      return res.status(200).json({
        code: 200,
        message: 'success',
        data: {
          id: category.id,
          name: category.name,
          parentId: category.parent_id,
          icon: category.icon,
          sort: category.sort,
          status: category.status,
          productCount: parseInt(productCountResult.rows[0]?.count || '0'),
          childCount: parseInt(childCountResult.rows[0]?.count || '0'),
          createdAt: category.created_at,
          updatedAt: category.updated_at,
        },
      });
    }

    // PUT - 更新分类
    if (req.method === 'PUT') {
      const { name, parentId, icon, sort, status } = req.body || {};

      if (!name) {
        await client.end();
        return res.status(200).json({
          code: 400,
          message: '分类名称不能为空',
          data: null,
        });
      }

      // 检查是否会造成循环引用
      if (parentId) {
        // 检查父分类是否是自己
        if (parseInt(parentId) === parseInt(id as string)) {
          await client.end();
          return res.status(200).json({
            code: 400,
            message: '不能将自己设为父分类',
            data: null,
          });
        }

        // 检查父分类是否是自己的子分类
        const checkCircular = async (checkId: number): Promise<boolean> => {
          const result = await client.query(
            'SELECT parent_id FROM categories WHERE id = $1',
            [checkId]
          );

          if (result.rows.length === 0) return false;

          const parentIdValue = result.rows[0].parent_id;
          if (!parentIdValue) return false;
          if (parentIdValue === parseInt(id as string)) return true;

          return await checkCircular(parentIdValue);
        };

        const hasCircular = await checkCircular(parseInt(parentId));
        if (hasCircular) {
          await client.end();
          return res.status(200).json({
            code: 400,
            message: '不能形成循环引用',
            data: null,
          });
        }
      }

      // 检查同级分类名称是否重复
      const existingResult = await client.query(
        'SELECT id FROM categories WHERE name = $1 AND parent_id IS NOT DISTINCT FROM $2 AND id != $3',
        [name, parentId || null, id]
      );

      if (existingResult.rows.length > 0) {
        await client.end();
        return res.status(200).json({
          code: 400,
          message: '同级分类名称已存在',
          data: null,
        });
      }

      await client.query(
        `UPDATE categories
         SET name = $1, parent_id = $2, icon = $3, sort = $4, status = $5, updated_at = CURRENT_TIMESTAMP
         WHERE id = $6`,
        [name, parentId || null, icon, sort, status, id]
      );

      await client.end();

      return res.status(200).json({
        code: 200,
        message: '更新成功',
        data: null,
      });
    }

    // DELETE - 删除分类
    if (req.method === 'DELETE') {
      // 检查是否有子分类
      const childResult = await client.query(
        'SELECT COUNT(*) as count FROM categories WHERE parent_id = $1',
        [id]
      );

      if (parseInt(childResult.rows[0].count) > 0) {
        await client.end();
        return res.status(200).json({
          code: 400,
          message: '该分类下有子分类，无法删除',
          data: null,
        });
      }

      // 检查是否有商品
      const productResult = await client.query(
        'SELECT COUNT(*) as count FROM products WHERE category_id = $1',
        [id]
      );

      if (parseInt(productResult.rows[0].count) > 0) {
        await client.end();
        return res.status(200).json({
          code: 400,
          message: '该分类下有商品，无法删除',
          data: null,
        });
      }

      await client.query('DELETE FROM categories WHERE id = $1', [id]);

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
    console.error('[API] 分类操作失败:', error);

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

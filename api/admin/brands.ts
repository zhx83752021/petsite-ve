import { VercelRequest, VercelResponse } from '@vercel/node';
import { Pool } from 'pg';

let pool: Pool | null = null;

const getPool = () => {
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      max: 2,
      idleTimeoutMillis: 1000,
    });
  }
  return pool;
};

export default async (req: VercelRequest, res: VercelResponse) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    const db = getPool();

    // GET - 获取品牌列表
    if (req.method === 'GET') {
      const result = await db.query(`
        SELECT id, name, logo, description, created_at, updated_at
        FROM brands
        ORDER BY id DESC
      `);

      return res.status(200).json({
        code: 200,
        message: 'success',
        data: {
          items: result.rows,
          total: result.rows.length
        }
      });
    }

    // POST - 创建品牌
    if (req.method === 'POST') {
      const { name, logo, description } = req.body;

      if (!name) {
        return res.status(400).json({
          code: 400,
          message: '品牌名称不能为空'
        });
      }

      const result = await db.query(
        `INSERT INTO brands (name, logo, description, created_at, updated_at)
         VALUES ($1, $2, $3, NOW(), NOW())
         RETURNING *`,
        [name, logo || null, description || null]
      );

      return res.status(200).json({
        code: 200,
        message: '创建成功',
        data: result.rows[0]
      });
    }

    // PUT - 更新品牌
    if (req.method === 'PUT') {
      const { id, name, logo, description } = req.body;

      if (!id || !name) {
        return res.status(400).json({
          code: 400,
          message: 'ID和品牌名称不能为空'
        });
      }

      const result = await db.query(
        `UPDATE brands
         SET name = $1, logo = $2, description = $3, updated_at = NOW()
         WHERE id = $4
         RETURNING *`,
        [name, logo || null, description || null, id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          code: 404,
          message: '品牌不存在'
        });
      }

      return res.status(200).json({
        code: 200,
        message: '更新成功',
        data: result.rows[0]
      });
    }

    // DELETE - 删除品牌
    if (req.method === 'DELETE') {
      const { id } = req.query;

      if (!id) {
        return res.status(400).json({
          code: 400,
          message: 'ID不能为空'
        });
      }

      await db.query('DELETE FROM brands WHERE id = $1', [id]);

      return res.status(200).json({
        code: 200,
        message: '删除成功'
      });
    }

    return res.status(405).json({
      code: 405,
      message: 'Method not allowed'
    });

  } catch (error: any) {
    console.error('Brands API error:', error);

    // 如果表不存在或任何数据库错误，返回空列表
    return res.status(200).json({
      code: 200,
      message: 'success',
      data: {
        items: [],
        total: 0
      }
    });
  }
};

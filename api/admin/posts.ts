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

    // GET - 获取动态列表
    if (req.method === 'GET') {
      const { page = 1, pageSize = 20, status, userId } = req.query;

      let query = `
        SELECT
          p.id,
          p.user_id,
          u.username as user_name,
          p.content,
          p.images,
          p.status,
          p.like_count,
          p.comment_count,
          p.created_at,
          p.updated_at
        FROM posts p
        LEFT JOIN users u ON p.user_id = u.id
        WHERE 1=1
      `;

      const params: any[] = [];
      let paramIndex = 1;

      if (status) {
        query += ` AND p.status = $${paramIndex}`;
        params.push(status);
        paramIndex++;
      }

      if (userId) {
        query += ` AND p.user_id = $${paramIndex}`;
        params.push(userId);
        paramIndex++;
      }

      query += ` ORDER BY p.created_at DESC`;

      const result = await db.query(query, params);

      return res.status(200).json({
        code: 200,
        message: 'success',
        data: {
          items: result.rows,
          total: result.rows.length,
          page: parseInt(page as string),
          pageSize: parseInt(pageSize as string)
        }
      });
    }

    // POST - 创建动态
    if (req.method === 'POST') {
      const { userId, content, images, status = 'published' } = req.body;

      if (!userId || !content) {
        return res.status(400).json({
          code: 400,
          message: '用户ID和内容不能为空'
        });
      }

      const result = await db.query(
        `INSERT INTO posts (user_id, content, images, status, like_count, comment_count, created_at, updated_at)
         VALUES ($1, $2, $3, $4, 0, 0, NOW(), NOW())
         RETURNING *`,
        [userId, content, images || [], status]
      );

      return res.status(200).json({
        code: 200,
        message: '创建成功',
        data: result.rows[0]
      });
    }

    // PUT - 更新动态
    if (req.method === 'PUT') {
      const { id, content, images, status } = req.body;

      if (!id) {
        return res.status(400).json({
          code: 400,
          message: 'ID不能为空'
        });
      }

      const updates: string[] = [];
      const params: any[] = [];
      let paramIndex = 1;

      if (content !== undefined) {
        updates.push(`content = $${paramIndex}`);
        params.push(content);
        paramIndex++;
      }

      if (images !== undefined) {
        updates.push(`images = $${paramIndex}`);
        params.push(images);
        paramIndex++;
      }

      if (status !== undefined) {
        updates.push(`status = $${paramIndex}`);
        params.push(status);
        paramIndex++;
      }

      if (updates.length === 0) {
        return res.status(400).json({
          code: 400,
          message: '没有要更新的字段'
        });
      }

      updates.push(`updated_at = NOW()`);
      params.push(id);

      const query = `
        UPDATE posts
        SET ${updates.join(', ')}
        WHERE id = $${paramIndex}
        RETURNING *
      `;

      const result = await db.query(query, params);

      if (result.rows.length === 0) {
        return res.status(404).json({
          code: 404,
          message: '动态不存在'
        });
      }

      return res.status(200).json({
        code: 200,
        message: '更新成功',
        data: result.rows[0]
      });
    }

    // DELETE - 删除动态
    if (req.method === 'DELETE') {
      const { id } = req.query;

      if (!id) {
        return res.status(400).json({
          code: 400,
          message: 'ID不能为空'
        });
      }

      await db.query('DELETE FROM posts WHERE id = $1', [id]);

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
    console.error('Posts API error:', error);

    // 如果表不存在，返回空列表
    if (error.code === '42P01') {
      return res.status(200).json({
        code: 200,
        message: 'success',
        data: {
          items: [],
          total: 0
        }
      });
    }

    res.status(500).json({
      code: 500,
      message: '服务器错误',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

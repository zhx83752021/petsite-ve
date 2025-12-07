/**
 * 购物车 API
 * GET - 获取购物车列表
 * POST - 添加商品到购物车
 * PUT - 更新购物车商品数量
 * DELETE - 从购物车删除商品
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

    // GET - 获取购物车列表
    if (req.method === 'GET') {
      const result = await client.query(`
        SELECT
          c.id,
          c.product_id,
          c.sku_id,
          c.quantity,
          p.name as product_name,
          p.main_images,
          ps.price,
          ps.stock,
          ps.spec_combination
        FROM cart_items c
        JOIN products p ON c.product_id = p.id
        JOIN product_skus ps ON c.sku_id = ps.id
        WHERE c.user_id = $1
        ORDER BY c.created_at DESC
      `, [userId]);

      await client.end();

      const items = result.rows.map((row: any) => ({
        id: row.id,
        productId: row.product_id,
        skuId: row.sku_id,
        quantity: row.quantity,
        productName: row.product_name,
        image: row.main_images?.[0] || '',
        price: parseFloat(row.price),
        stock: row.stock,
        spec: row.spec_combination,
        selected: true,
      }));

      return res.status(200).json({
        code: 200,
        message: 'success',
        data: items,
      });
    }

    // POST - 添加商品到购物车
    if (req.method === 'POST') {
      const { productId, skuId, quantity = 1 } = req.body || {};

      if (!productId || !skuId) {
        await client.end();
        return res.status(200).json({
          code: 400,
          message: '商品ID和SKU ID不能为空',
          data: null,
        });
      }

      // 检查商品和SKU是否存在
      const skuCheck = await client.query(
        'SELECT stock FROM product_skus WHERE id = $1 AND product_id = $2',
        [skuId, productId]
      );

      if (skuCheck.rows.length === 0) {
        await client.end();
        return res.status(200).json({
          code: 404,
          message: '商品规格不存在',
          data: null,
        });
      }

      const stock = skuCheck.rows[0].stock;
      if (stock < quantity) {
        await client.end();
        return res.status(200).json({
          code: 400,
          message: '库存不足',
          data: null,
        });
      }

      // 检查购物车中是否已存在该商品
      const existing = await client.query(
        'SELECT id, quantity FROM cart_items WHERE user_id = $1 AND product_id = $2 AND sku_id = $3',
        [userId, productId, skuId]
      );

      if (existing.rows.length > 0) {
        // 更新数量
        const newQuantity = existing.rows[0].quantity + quantity;
        if (newQuantity > stock) {
          await client.end();
          return res.status(200).json({
            code: 400,
            message: '库存不足',
            data: null,
          });
        }

        await client.query(
          'UPDATE cart_items SET quantity = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
          [newQuantity, existing.rows[0].id]
        );
      } else {
        // 新增购物车项
        await client.query(
          'INSERT INTO cart_items (user_id, product_id, sku_id, quantity) VALUES ($1, $2, $3, $4)',
          [userId, productId, skuId, quantity]
        );
      }

      await client.end();

      return res.status(200).json({
        code: 200,
        message: '添加成功',
        data: null,
      });
    }

    // PUT - 更新购物车商品数量
    if (req.method === 'PUT') {
      const { id, quantity } = req.body || {};

      if (!id || !quantity || quantity < 1) {
        await client.end();
        return res.status(200).json({
          code: 400,
          message: '参数错误',
          data: null,
        });
      }

      // 检查购物车项是否属于当前用户
      const cartItem = await client.query(
        `SELECT c.id, ps.stock
         FROM cart_items c
         JOIN product_skus ps ON c.sku_id = ps.id
         WHERE c.id = $1 AND c.user_id = $2`,
        [id, userId]
      );

      if (cartItem.rows.length === 0) {
        await client.end();
        return res.status(200).json({
          code: 404,
          message: '购物车项不存在',
          data: null,
        });
      }

      const stock = cartItem.rows[0].stock;
      if (quantity > stock) {
        await client.end();
        return res.status(200).json({
          code: 400,
          message: '库存不足',
          data: null,
        });
      }

      await client.query(
        'UPDATE cart_items SET quantity = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
        [quantity, id]
      );

      await client.end();

      return res.status(200).json({
        code: 200,
        message: '更新成功',
        data: null,
      });
    }

    // DELETE - 删除购物车商品
    if (req.method === 'DELETE') {
      const { id } = req.query;

      if (!id) {
        await client.end();
        return res.status(200).json({
          code: 400,
          message: '购物车项ID不能为空',
          data: null,
        });
      }

      await client.query(
        'DELETE FROM cart_items WHERE id = $1 AND user_id = $2',
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
    console.error('[API] 购物车操作失败:', error);

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

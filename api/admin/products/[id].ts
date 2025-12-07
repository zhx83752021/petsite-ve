/**
 * 管理后台 - 商品详情/编辑/删除 API
 * GET - 获取商品详情
 * PUT - 更新商品
 * DELETE - 删除商品
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
      message: '商品ID不能为空',
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

    // GET - 获取商品详情
    if (req.method === 'GET') {
      const productResult = await client.query(
        `SELECT
          p.*,
          c.name as category_name
         FROM products p
         LEFT JOIN categories c ON p.category_id = c.id
         WHERE p.id = $1`,
        [id]
      );

      if (productResult.rows.length === 0) {
        await client.end();
        return res.status(200).json({
          code: 404,
          message: '商品不存在',
          data: null,
        });
      }

      // 查询 SKU
      const skuResult = await client.query(
        'SELECT * FROM product_skus WHERE product_id = $1 ORDER BY id ASC',
        [id]
      );

      await client.end();

      const product = productResult.rows[0];

      return res.status(200).json({
        code: 200,
        message: 'success',
        data: {
          id: product.id,
          name: product.name,
          subtitle: product.subtitle,
          detail: product.detail,
          mainImages: product.main_images || [],
          detailImages: product.detail_images || [],
          categoryId: product.category_id,
          categoryName: product.category_name,
          brandId: product.brand_id,
          sales: product.sales || 0,
          status: product.status,
          createdAt: product.created_at,
          updatedAt: product.updated_at,
          skus: skuResult.rows.map((sku: any) => ({
            id: sku.id,
            skuCode: sku.sku_code,
            spec: sku.spec_combination,
            price: parseFloat(sku.price),
            originalPrice: parseFloat(sku.original_price),
            stock: sku.stock,
            status: sku.status,
          })),
        },
      });
    }

    // PUT - 更新商品
    if (req.method === 'PUT') {
      const {
        name,
        subtitle,
        detail,
        mainImages,
        detailImages,
        categoryId,
        brandId,
        status,
        skus,
      } = req.body || {};

      // 参数验证
      if (!name || !categoryId) {
        await client.end();
        return res.status(200).json({
          code: 400,
          message: '商品名称和分类不能为空',
          data: null,
        });
      }

      // 开启事务
      await client.query('BEGIN');

      try {
        // 更新商品基本信息
        await client.query(
          `UPDATE products
           SET name = $1, subtitle = $2, detail = $3, main_images = $4, detail_images = $5,
               category_id = $6, brand_id = $7, status = $8, updated_at = CURRENT_TIMESTAMP
           WHERE id = $9`,
          [name, subtitle, detail, mainImages, detailImages, categoryId, brandId, status, id]
        );

        // 如果提供了 SKU 数据，更新 SKU
        if (skus && Array.isArray(skus)) {
          // 删除旧的 SKU
          await client.query('DELETE FROM product_skus WHERE product_id = $1', [id]);

          // 创建新的 SKU
          for (const sku of skus) {
            await client.query(
              `INSERT INTO product_skus (product_id, sku_code, spec_combination, price, original_price, stock, status)
               VALUES ($1, $2, $3, $4, $5, $6, $7)`,
              [
                id,
                sku.skuCode || `SKU-${id}-${Date.now()}`,
                sku.spec || '',
                sku.price,
                sku.originalPrice || sku.price,
                sku.stock || 0,
                sku.status || 1,
              ]
            );
          }
        }

        await client.query('COMMIT');
        await client.end();

        return res.status(200).json({
          code: 200,
          message: '更新成功',
          data: null,
        });
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      }
    }

    // DELETE - 删除商品
    if (req.method === 'DELETE') {
      // 开启事务
      await client.query('BEGIN');

      try {
        // 检查是否有未完成的订单
        const orderCheck = await client.query(
          `SELECT COUNT(*) as count FROM orders o
           WHERE o.status NOT IN ('completed', 'cancelled')
           AND EXISTS (
             SELECT 1 FROM cart_items ci WHERE ci.product_id = $1
           )`,
          [id]
        );

        if (parseInt(orderCheck.rows[0].count) > 0) {
          await client.query('ROLLBACK');
          await client.end();
          return res.status(200).json({
            code: 400,
            message: '该商品有未完成的订单，无法删除',
            data: null,
          });
        }

        // 删除购物车中的商品
        await client.query('DELETE FROM cart_items WHERE product_id = $1', [id]);

        // 删除 SKU
        await client.query('DELETE FROM product_skus WHERE product_id = $1', [id]);

        // 删除商品
        await client.query('DELETE FROM products WHERE id = $1', [id]);

        await client.query('COMMIT');
        await client.end();

        return res.status(200).json({
          code: 200,
          message: '删除成功',
          data: null,
        });
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      }
    }

    await client.end();

    return res.status(200).json({
      code: 405,
      message: '方法不允许',
      data: null,
    });
  } catch (error: any) {
    console.error('[API] 商品操作失败:', error);

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

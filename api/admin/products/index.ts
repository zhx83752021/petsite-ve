/**
 * 管理后台 - 商品列表管理 API
 * GET - 获取商品列表
 * POST - 创建新商品
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

    // GET - 获取商品列表
    if (req.method === 'GET') {
      const {
        page = 1,
        pageSize = 20,
        keyword = '',
        categoryId = '',
        status = '',
      } = req.query;

      const conditions: string[] = [];
      const params: any[] = [];
      let paramIndex = 1;

      // 关键词搜索
      if (keyword) {
        conditions.push(`(p.name ILIKE $${paramIndex} OR p.subtitle ILIKE $${paramIndex})`);
        params.push(`%${keyword}%`);
        paramIndex++;
      }

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

      // 计算偏移量
      const offset = (parseInt(page as string) - 1) * parseInt(pageSize as string);
      const limit = parseInt(pageSize as string);

      // 查询商品列表
      const result = await client.query(`
        SELECT
          p.id,
          p.name,
          p.subtitle,
          p.main_images,
          p.category_id,
          p.brand_id,
          p.sales,
          p.status,
          p.created_at,
          p.updated_at,
          c.name as category_name,
          COUNT(ps.id) as sku_count,
          MIN(ps.price) as min_price,
          MAX(ps.price) as max_price,
          SUM(ps.stock) as total_stock
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
        LEFT JOIN product_skus ps ON p.id = ps.product_id
        ${whereClause}
        GROUP BY p.id, p.name, p.subtitle, p.main_images, p.category_id, p.brand_id, p.sales, p.status, p.created_at, p.updated_at, c.name
        ORDER BY p.created_at DESC
        LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
      `, [...params, limit, offset]);

      // 查询总数
      const countResult = await client.query(`
        SELECT COUNT(DISTINCT p.id) as total
        FROM products p
        ${whereClause}
      `, params);

      await client.end();

      const items = result.rows.map((row: any) => ({
        id: row.id,
        name: row.name,
        subtitle: row.subtitle,
        image: row.main_images?.[0] || '',
        images: row.main_images || [],
        categoryId: row.category_id,
        categoryName: row.category_name,
        brandId: row.brand_id,
        sales: row.sales || 0,
        status: row.status,
        skuCount: parseInt(row.sku_count) || 0,
        minPrice: parseFloat(row.min_price) || 0,
        maxPrice: parseFloat(row.max_price) || 0,
        totalStock: parseInt(row.total_stock) || 0,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      }));

      const total = parseInt(countResult.rows[0]?.total || '0');

      return res.status(200).json({
        code: 200,
        message: 'success',
        data: {
          list: items,
          pagination: {
            total,
            page: parseInt(page as string),
            pageSize: parseInt(pageSize as string),
          },
        },
      });
    }

    // POST - 创建新商品
    if (req.method === 'POST') {
      const {
        name,
        subtitle,
        detail,
        mainImages,
        detailImages,
        categoryId,
        brandId,
        status = 1,
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

      if (!skus || !Array.isArray(skus) || skus.length === 0) {
        await client.end();
        return res.status(200).json({
          code: 400,
          message: '至少需要一个SKU',
          data: null,
        });
      }

      // 开启事务
      await client.query('BEGIN');

      try {
        // 创建商品
        const productResult = await client.query(
          `INSERT INTO products (name, subtitle, detail, main_images, detail_images, category_id, brand_id, status)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
           RETURNING id`,
          [name, subtitle, detail, mainImages, detailImages, categoryId, brandId, status]
        );

        const productId = productResult.rows[0].id;

        // 创建 SKU
        for (const sku of skus) {
          await client.query(
            `INSERT INTO product_skus (product_id, sku_code, spec_combination, price, original_price, stock, status)
             VALUES ($1, $2, $3, $4, $5, $6, $7)`,
            [
              productId,
              sku.skuCode || `SKU-${productId}-${Date.now()}`,
              sku.spec || '',
              sku.price,
              sku.originalPrice || sku.price,
              sku.stock || 0,
              sku.status || 1,
            ]
          );
        }

        await client.query('COMMIT');
        await client.end();

        return res.status(200).json({
          code: 200,
          message: '创建成功',
          data: { id: productId },
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
    console.error('[API] 商品管理失败:', error);

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

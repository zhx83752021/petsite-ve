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

    // GET - 获取商品列表（管理后台版本，包含更多信息）
    if (req.method === 'GET') {
      const { page = 1, pageSize = 20, categoryId, status, keyword } = req.query;

      let query = `
        SELECT
          p.id,
          p.name,
          p.description,
          p.category_id,
          c.name as category_name,
          p.images,
          p.created_at,
          p.updated_at
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
        WHERE 1=1
      `;

      const params: any[] = [];
      let paramIndex = 1;

      if (categoryId) {
        query += ` AND p.category_id = $${paramIndex}`;
        params.push(categoryId);
        paramIndex++;
      }

      if (keyword) {
        query += ` AND p.name ILIKE $${paramIndex}`;
        params.push(`%${keyword}%`);
        paramIndex++;
      }

      query += ` ORDER BY p.id DESC`;

      const result = await db.query(query, params);

      // 为每个商品查询 SKU 信息
      const products = await Promise.all(result.rows.map(async (product: any) => {
        const skuResult = await db.query(
          'SELECT id, sku_name, price, stock FROM product_skus WHERE product_id = $1',
          [product.id]
        );

        return {
          ...product,
          skus: skuResult.rows,
          minPrice: skuResult.rows.length > 0 ? Math.min(...skuResult.rows.map((s: any) => s.price)) : 0,
          totalStock: skuResult.rows.reduce((sum: number, s: any) => sum + (s.stock || 0), 0)
        };
      }));

      return res.status(200).json({
        code: 200,
        message: 'success',
        data: {
          items: products,
          total: products.length,
          page: parseInt(page as string),
          pageSize: parseInt(pageSize as string)
        }
      });
    }

    // POST - 创建商品
    if (req.method === 'POST') {
      const { name, description, categoryId, images, skus } = req.body;

      if (!name || !categoryId) {
        return res.status(400).json({
          code: 400,
          message: '商品名称和分类不能为空'
        });
      }

      // 创建商品
      const productResult = await db.query(
        `INSERT INTO products (name, description, category_id, images, created_at, updated_at)
         VALUES ($1, $2, $3, $4, NOW(), NOW())
         RETURNING *`,
        [name, description || '', categoryId, images || []]
      );

      const productId = productResult.rows[0].id;

      // 创建 SKU
      if (skus && Array.isArray(skus) && skus.length > 0) {
        for (const sku of skus) {
          await db.query(
            `INSERT INTO product_skus (product_id, sku_name, price, stock, created_at, updated_at)
             VALUES ($1, $2, $3, $4, NOW(), NOW())`,
            [productId, sku.skuName || '默认规格', sku.price || 0, sku.stock || 0]
          );
        }
      } else {
        // 如果没有提供 SKU，创建默认 SKU
        await db.query(
          `INSERT INTO product_skus (product_id, sku_name, price, stock, created_at, updated_at)
           VALUES ($1, $2, $3, $4, NOW(), NOW())`,
          [productId, '默认规格', 0, 0]
        );
      }

      return res.status(200).json({
        code: 200,
        message: '创建成功',
        data: productResult.rows[0]
      });
    }

    // PUT - 更新商品
    if (req.method === 'PUT') {
      const { id, name, description, categoryId, images, skus } = req.body;

      if (!id) {
        return res.status(400).json({
          code: 400,
          message: 'ID不能为空'
        });
      }

      const updates: string[] = [];
      const params: any[] = [];
      let paramIndex = 1;

      if (name !== undefined) {
        updates.push(`name = $${paramIndex}`);
        params.push(name);
        paramIndex++;
      }

      if (description !== undefined) {
        updates.push(`description = $${paramIndex}`);
        params.push(description);
        paramIndex++;
      }

      if (categoryId !== undefined) {
        updates.push(`category_id = $${paramIndex}`);
        params.push(categoryId);
        paramIndex++;
      }

      if (images !== undefined) {
        updates.push(`images = $${paramIndex}`);
        params.push(images);
        paramIndex++;
      }

      if (updates.length === 0 && !skus) {
        return res.status(400).json({
          code: 400,
          message: '没有要更新的字段'
        });
      }

      if (updates.length > 0) {
        updates.push(`updated_at = NOW()`);
        params.push(id);

        const query = `
          UPDATE products
          SET ${updates.join(', ')}
          WHERE id = $${paramIndex}
          RETURNING *
        `;

        const result = await db.query(query, params);

        if (result.rows.length === 0) {
          return res.status(404).json({
            code: 404,
            message: '商品不存在'
          });
        }
      }

      // 更新 SKU（如果提供）
      if (skus && Array.isArray(skus)) {
        // 删除现有 SKU
        await db.query('DELETE FROM product_skus WHERE product_id = $1', [id]);

        // 创建新 SKU
        for (const sku of skus) {
          await db.query(
            `INSERT INTO product_skus (product_id, sku_name, price, stock, created_at, updated_at)
             VALUES ($1, $2, $3, $4, NOW(), NOW())`,
            [id, sku.skuName || '默认规格', sku.price || 0, sku.stock || 0]
          );
        }
      }

      return res.status(200).json({
        code: 200,
        message: '更新成功'
      });
    }

    // DELETE - 删除商品
    if (req.method === 'DELETE') {
      const { id } = req.query;

      if (!id) {
        return res.status(400).json({
          code: 400,
          message: 'ID不能为空'
        });
      }

      // 删除 SKU
      await db.query('DELETE FROM product_skus WHERE product_id = $1', [id]);

      // 删除商品
      await db.query('DELETE FROM products WHERE id = $1', [id]);

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
    console.error('Products API error:', error);
    res.status(500).json({
      code: 500,
      message: '服务器错误',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

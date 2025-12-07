/**
 * 商品列表 API - 直接访问数据库
 */
import type { VercelRequest, VercelResponse } from '@vercel/node';
import pkg from 'pg';
const { Client } = pkg;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const client = new Client({
    connectionString: process.env.POSTGRES_URL || process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false,
    },
  });

  try {
    await client.connect();

    // 查询商品和SKU
    const result = await client.query(`
      SELECT
        p.id,
        p.name,
        p.subtitle,
        p.main_images,
        p.category_id,
        p.sales,
        MIN(ps.price) as min_price,
        MAX(ps.price) as max_price,
        SUM(ps.stock) as total_stock
      FROM products p
      LEFT JOIN product_skus ps ON p.id = ps.product_id
      WHERE p.status = 1
      GROUP BY p.id, p.name, p.subtitle, p.main_images, p.category_id, p.sales
      ORDER BY p.created_at DESC
      LIMIT 20
    `);

    await client.end();

    res.status(200).json({
      success: true,
      data: {
        products: result.rows,
        total: result.rowCount || 0,
      },
    });
  } catch (error: any) {
    console.error('[API] 查询商品失败:', error);

    if (client) {
      try {
        await client.end();
      } catch (e) {
        // ignore
      }
    }

    res.status(500).json({
      success: false,
      message: '查询商品失败',
      error: error.message,
    });
  }
}

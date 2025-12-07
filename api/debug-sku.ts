/**
 * SKU 调试 API - 直接查询数据库
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

    // 查询所有 SKU
    const allSkus = await client.query('SELECT * FROM product_skus ORDER BY product_id, id');

    // 查询商品 5 的 SKU
    const product5Skus = await client.query(
      'SELECT * FROM product_skus WHERE product_id = 5'
    );

    // 查询商品 5 的基本信息
    const product5 = await client.query(
      'SELECT id, name, status FROM products WHERE id = 5'
    );

    await client.end();

    res.status(200).json({
      code: 200,
      message: 'debug',
      data: {
        allSkusCount: allSkus.rows.length,
        allSkus: allSkus.rows,
        product5Info: product5.rows[0] || null,
        product5SkusCount: product5Skus.rows.length,
        product5Skus: product5Skus.rows,
      },
    });
  } catch (error: any) {
    console.error('[DEBUG] 查询失败:', error);
    res.status(200).json({
      code: 500,
      message: error.message,
      data: null,
    });
  }
}

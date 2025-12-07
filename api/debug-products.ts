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

  try {
    const db = getPool();

    let debugInfo: any = {};

    // 检查 products 表结构
    const columnsResult = await db.query(`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'products'
      ORDER BY ordinal_position
    `);
    debugInfo.productColumns = columnsResult.rows;

    // 尝试简单查询
    try {
      const simpleResult = await db.query('SELECT * FROM products LIMIT 3');
      debugInfo.simpleQuery = {
        success: true,
        rowCount: simpleResult.rows.length,
        sampleData: simpleResult.rows
      };
    } catch (error: any) {
      debugInfo.simpleQuery = {
        success: false,
        error: error.message
      };
    }

    // 尝试带 JOIN 的复杂查询
    try {
      const complexResult = await db.query(`
        SELECT
          p.id,
          p.name,
          p.description,
          p.category_id,
          c.name as category_name,
          p.images,
          MIN(ps.price) as min_price,
          MAX(ps.price) as max_price,
          SUM(ps.stock) as total_stock
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
        LEFT JOIN product_skus ps ON p.id = ps.product_id
        GROUP BY p.id, c.name
        LIMIT 3
      `);
      debugInfo.complexQuery = {
        success: true,
        rowCount: complexResult.rows.length,
        sampleData: complexResult.rows
      };
    } catch (error: any) {
      debugInfo.complexQuery = {
        success: false,
        error: error.message
      };
    }

    res.status(200).json({
      success: true,
      debug: debugInfo
    });

  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
      stack: error.stack
    });
  }
};

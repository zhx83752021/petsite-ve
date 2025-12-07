import { VercelRequest, VercelResponse } from '@vercel/node';
import { Pool } from 'pg';

let pool: Pool | null = null;

const getPool = () => {
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      max: 2,
      idleTimeoutMillis: 1000,
      connectionTimeoutMillis: 5000,
    });
  }
  return pool;
};

export default async (req: VercelRequest, res: VercelResponse) => {
  res.setHeader('Access-Control-Allow-Origin', '*');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    const db = getPool();

    // 检查所有表
    const tablesResult = await db.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);

    const tables = tablesResult.rows.map(r => r.table_name);

    // 检查每个表的数据量
    const tableCounts: any = {};

    for (const table of tables) {
      try {
        const countResult = await db.query(`SELECT COUNT(*) as count FROM "${table}"`);
        tableCounts[table] = parseInt(countResult.rows[0].count);
      } catch (error: any) {
        tableCounts[table] = `Error: ${error.message}`;
      }
    }

    // 检查关键表的具体数据
    let productsData = null;
    let adminsData = null;

    try {
      const productsResult = await db.query('SELECT id, name FROM products LIMIT 3');
      productsData = productsResult.rows;
    } catch (error: any) {
      productsData = `Error: ${error.message}`;
    }

    try {
      const adminsResult = await db.query('SELECT id, username, role FROM admins LIMIT 3');
      adminsData = adminsResult.rows;
    } catch (error: any) {
      adminsData = `Error: ${error.message}`;
    }

    res.status(200).json({
      success: true,
      tables,
      tableCounts,
      sampleData: {
        products: productsData,
        admins: adminsData
      }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

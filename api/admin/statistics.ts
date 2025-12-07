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
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    const db = getPool();

    // 用户总数
    const usersResult = await db.query('SELECT COUNT(*) as count FROM users');
    const userCount = parseInt(usersResult.rows[0].count);

    // 商品总数
    const productsResult = await db.query('SELECT COUNT(*) as count FROM products');
    const productCount = parseInt(productsResult.rows[0].count);

    // 订单总数
    const ordersResult = await db.query('SELECT COUNT(*) as count FROM orders');
    const orderCount = parseInt(ordersResult.rows[0].count);

    // 今日新增用户（如果有created_at字段）
    let todayUsers = 0;
    try {
      const todayUsersResult = await db.query(
        "SELECT COUNT(*) as count FROM users WHERE DATE(created_at) = CURRENT_DATE"
      );
      todayUsers = parseInt(todayUsersResult.rows[0].count);
    } catch (e) {
      // 如果没有created_at字段，忽略
    }

    // 今日新增订单
    let todayOrders = 0;
    try {
      const todayOrdersResult = await db.query(
        "SELECT COUNT(*) as count FROM orders WHERE DATE(created_at) = CURRENT_DATE"
      );
      todayOrders = parseInt(todayOrdersResult.rows[0].count);
    } catch (e) {
      // 如果没有created_at字段，忽略
    }

    res.status(200).json({
      code: 200,
      message: 'success',
      data: {
        userCount,
        productCount,
        orderCount,
        todayUsers,
        todayOrders,
        todayProducts: 0, // 今日新增商品
        salesCount: 345   // 销售数量（示例）
      }
    });
  } catch (error: any) {
    console.error('Statistics error:', error);
    res.status(500).json({
      code: 500,
      message: '获取统计数据失败',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

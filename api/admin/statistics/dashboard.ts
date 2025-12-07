/**
 * 管理后台 - 仪表盘统计数据 API
 * 获取关键业务指标
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
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(200).json({
      code: 405,
      message: '方法不允许',
      data: null,
    });
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

    // 1. 今日数据
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    // 今日订单数和销售额
    const todayOrders = await client.query(
      `SELECT
        COUNT(*) as order_count,
        COALESCE(SUM(total_amount), 0) as total_amount
       FROM orders
       WHERE created_at >= $1`,
      [todayStart]
    );

    // 今日新用户数
    const todayUsers = await client.query(
      `SELECT COUNT(*) as count FROM users WHERE created_at >= $1 AND role = 'user'`,
      [todayStart]
    );

    // 2. 总体数据
    const totalStats = await client.query(`
      SELECT
        (SELECT COUNT(*) FROM orders) as total_orders,
        (SELECT COALESCE(SUM(total_amount), 0) FROM orders WHERE status != 'cancelled') as total_sales,
        (SELECT COUNT(*) FROM users WHERE role = 'user') as total_users,
        (SELECT COUNT(*) FROM products WHERE status = 1) as total_products
    `);

    // 3. 订单状态统计
    const orderStatus = await client.query(`
      SELECT
        status,
        COUNT(*) as count,
        COALESCE(SUM(total_amount), 0) as amount
      FROM orders
      GROUP BY status
    `);

    // 4. 近7天订单趋势
    const last7Days = await client.query(`
      SELECT
        DATE(created_at) as date,
        COUNT(*) as order_count,
        COALESCE(SUM(total_amount), 0) as total_amount
      FROM orders
      WHERE created_at >= CURRENT_DATE - INTERVAL '7 days'
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `);

    // 5. 热销商品 TOP 10
    const topProducts = await client.query(`
      SELECT
        p.id,
        p.name,
        p.main_images,
        p.sales,
        MIN(ps.price) as price
      FROM products p
      LEFT JOIN product_skus ps ON p.id = ps.product_id
      WHERE p.status = 1
      GROUP BY p.id, p.name, p.main_images, p.sales
      ORDER BY p.sales DESC
      LIMIT 10
    `);

    // 6. 分类销售统计
    const categoryStats = await client.query(`
      SELECT
        c.id,
        c.name,
        COUNT(DISTINCT p.id) as product_count,
        COALESCE(SUM(p.sales), 0) as total_sales
      FROM categories c
      LEFT JOIN products p ON c.id = p.category_id AND p.status = 1
      WHERE c.status = 1 AND c.parent_id IS NULL
      GROUP BY c.id, c.name
      ORDER BY total_sales DESC
    `);

    // 7. 待处理事项
    const pendingTasks = await client.query(`
      SELECT
        (SELECT COUNT(*) FROM orders WHERE status = 'pending') as pending_orders,
        (SELECT COUNT(*) FROM orders WHERE status = 'paid') as paid_orders,
        (SELECT COUNT(*) FROM products WHERE status = 1) as active_products,
        (SELECT COUNT(*) FROM product_skus WHERE stock < 10 AND status = 1) as low_stock_products
    `);

    await client.end();

    // 格式化数据
    const today = todayOrders.rows[0];
    const total = totalStats.rows[0];
    const tasks = pendingTasks.rows[0];

    const orderStatusMap: any = {};
    orderStatus.rows.forEach((row: any) => {
      orderStatusMap[row.status] = {
        count: parseInt(row.count),
        amount: parseFloat(row.amount),
      };
    });

    return res.status(200).json({
      code: 200,
      message: 'success',
      data: {
        // 今日数据
        today: {
          orderCount: parseInt(today.order_count),
          sales: parseFloat(today.total_amount),
          newUsers: parseInt(todayUsers.rows[0].count),
        },
        // 总体数据
        total: {
          orders: parseInt(total.total_orders),
          sales: parseFloat(total.total_sales),
          users: parseInt(total.total_users),
          products: parseInt(total.total_products),
        },
        // 订单状态
        orderStatus: {
          pending: orderStatusMap.pending || { count: 0, amount: 0 },
          paid: orderStatusMap.paid || { count: 0, amount: 0 },
          shipped: orderStatusMap.shipped || { count: 0, amount: 0 },
          completed: orderStatusMap.completed || { count: 0, amount: 0 },
          cancelled: orderStatusMap.cancelled || { count: 0, amount: 0 },
        },
        // 近7天趋势
        trend: last7Days.rows.map((row: any) => ({
          date: row.date,
          orderCount: parseInt(row.order_count),
          amount: parseFloat(row.total_amount),
        })),
        // 热销商品
        topProducts: topProducts.rows.map((row: any) => ({
          id: row.id,
          name: row.name,
          image: row.main_images?.[0] || '',
          sales: row.sales || 0,
          price: parseFloat(row.price) || 0,
        })),
        // 分类统计
        categoryStats: categoryStats.rows.map((row: any) => ({
          id: row.id,
          name: row.name,
          productCount: parseInt(row.product_count),
          totalSales: parseInt(row.total_sales),
        })),
        // 待处理任务
        pendingTasks: {
          pendingOrders: parseInt(tasks.pending_orders),
          paidOrders: parseInt(tasks.paid_orders),
          activeProducts: parseInt(tasks.active_products),
          lowStockProducts: parseInt(tasks.low_stock_products),
        },
      },
    });
  } catch (error: any) {
    console.error('[API] 统计数据查询失败:', error);

    if (client) {
      try {
        await client.end();
      } catch (e) {
        // ignore
      }
    }

    res.status(200).json({
      code: 500,
      message: error.message || '查询失败',
      data: null,
    });
  }
}

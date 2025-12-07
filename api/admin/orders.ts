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
  res.setHeader('Access-Control-Allow-Methods', 'GET,PUT,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    const db = getPool();

    // GET - 获取订单列表
    if (req.method === 'GET') {
      const { page = 1, pageSize = 20, status, userId } = req.query;

      let query = `
        SELECT
          o.id,
          o.order_no,
          o.user_id,
          u.username as user_name,
          o.total_amount,
          o.payment_method,
          o.payment_status,
          o.shipping_status,
          o.order_status,
          o.created_at,
          o.updated_at
        FROM orders o
        LEFT JOIN users u ON o.user_id = u.id
        WHERE 1=1
      `;

      const params: any[] = [];
      let paramIndex = 1;

      if (status) {
        query += ` AND o.order_status = $${paramIndex}`;
        params.push(status);
        paramIndex++;
      }

      if (userId) {
        query += ` AND o.user_id = $${paramIndex}`;
        params.push(userId);
        paramIndex++;
      }

      query += ` ORDER BY o.created_at DESC`;

      const result = await db.query(query, params);

      // 为每个订单获取订单项
      const orders = await Promise.all(result.rows.map(async (order: any) => {
        const itemsResult = await db.query(`
          SELECT
            oi.id,
            oi.product_id,
            oi.product_name,
            oi.sku_name,
            oi.price,
            oi.quantity
          FROM order_items oi
          WHERE oi.order_id = $1
        `, [order.id]);

        return {
          ...order,
          items: itemsResult.rows
        };
      }));

      return res.status(200).json({
        code: 200,
        message: 'success',
        data: {
          items: orders,
          total: orders.length,
          page: parseInt(page as string),
          pageSize: parseInt(pageSize as string)
        }
      });
    }

    // PUT - 更新订单状态
    if (req.method === 'PUT') {
      const { id, orderStatus, paymentStatus, shippingStatus } = req.body;

      if (!id) {
        return res.status(400).json({
          code: 400,
          message: 'ID不能为空'
        });
      }

      const updates: string[] = [];
      const params: any[] = [];
      let paramIndex = 1;

      if (orderStatus !== undefined) {
        updates.push(`order_status = $${paramIndex}`);
        params.push(orderStatus);
        paramIndex++;
      }

      if (paymentStatus !== undefined) {
        updates.push(`payment_status = $${paramIndex}`);
        params.push(paymentStatus);
        paramIndex++;
      }

      if (shippingStatus !== undefined) {
        updates.push(`shipping_status = $${paramIndex}`);
        params.push(shippingStatus);
        paramIndex++;
      }

      if (updates.length === 0) {
        return res.status(400).json({
          code: 400,
          message: '没有要更新的字段'
        });
      }

      updates.push(`updated_at = NOW()`);
      params.push(id);

      const query = `
        UPDATE orders
        SET ${updates.join(', ')}
        WHERE id = $${paramIndex}
        RETURNING *
      `;

      const result = await db.query(query, params);

      if (result.rows.length === 0) {
        return res.status(404).json({
          code: 404,
          message: '订单不存在'
        });
      }

      return res.status(200).json({
        code: 200,
        message: '更新成功',
        data: result.rows[0]
      });
    }

    return res.status(405).json({
      code: 405,
      message: 'Method not allowed'
    });

  } catch (error: any) {
    console.error('Orders API error:', error);
    res.status(500).json({
      code: 500,
      message: '服务器错误',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

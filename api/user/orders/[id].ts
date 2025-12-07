/**
 * 用户订单详情/取消订单 API
 * GET - 获取订单详情
 * PUT - 取消订单
 */
import type { VercelRequest, VercelResponse } from '@vercel/node';
import pkg from 'pg';
import jwt from 'jsonwebtoken';

const { Client } = pkg;

// 验证 token 并获取用户 ID
function getUserIdFromToken(req: VercelRequest): number | null {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return null;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as any;
    return decoded.id;
  } catch (error) {
    return null;
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // 设置 CORS 头
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // 验证用户身份
  const userId = getUserIdFromToken(req);
  if (!userId) {
    return res.status(200).json({
      code: 401,
      message: '请先登录',
      data: null,
    });
  }

  const { id } = req.query;

  if (!id) {
    return res.status(200).json({
      code: 400,
      message: '订单ID不能为空',
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

    // GET - 获取订单详情
    if (req.method === 'GET') {
      const orderResult = await client.query(
        'SELECT * FROM orders WHERE id = $1 AND user_id = $2',
        [id, userId]
      );

      if (orderResult.rows.length === 0) {
        await client.end();
        return res.status(200).json({
          code: 404,
          message: '订单不存在',
          data: null,
        });
      }

      const order = orderResult.rows[0];

      await client.end();

      return res.status(200).json({
        code: 200,
        message: 'success',
        data: {
          id: order.id,
          orderNo: order.order_no,
          totalAmount: parseFloat(order.total_amount),
          status: order.status,
          receiverName: order.receiver_name,
          receiverPhone: order.receiver_phone,
          receiverAddress: order.receiver_address,
          remark: order.remark,
          createdAt: order.created_at,
          updatedAt: order.updated_at,
          paidAt: order.paid_at,
          shippedAt: order.shipped_at,
          completedAt: order.completed_at,
          cancelledAt: order.cancelled_at,
        },
      });
    }

    // PUT - 取消订单
    if (req.method === 'PUT') {
      const { action } = req.body || {};

      if (action !== 'cancel') {
        await client.end();
        return res.status(200).json({
          code: 400,
          message: '无效的操作',
          data: null,
        });
      }

      // 查询订单状态
      const orderResult = await client.query(
        'SELECT status FROM orders WHERE id = $1 AND user_id = $2',
        [id, userId]
      );

      if (orderResult.rows.length === 0) {
        await client.end();
        return res.status(200).json({
          code: 404,
          message: '订单不存在',
          data: null,
        });
      }

      const currentStatus = orderResult.rows[0].status;

      // 只有待支付和已支付的订单可以取消
      if (!['pending', 'paid'].includes(currentStatus)) {
        await client.end();
        return res.status(200).json({
          code: 400,
          message: '该订单状态不允许取消',
          data: null,
        });
      }

      // 更新订单状态为已取消
      await client.query(
        'UPDATE orders SET status = $1, cancelled_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
        ['cancelled', id]
      );

      await client.end();

      return res.status(200).json({
        code: 200,
        message: '订单已取消',
        data: null,
      });
    }

    await client.end();

    return res.status(200).json({
      code: 405,
      message: '方法不允许',
      data: null,
    });
  } catch (error: any) {
    console.error('[API] 订单操作失败:', error);

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

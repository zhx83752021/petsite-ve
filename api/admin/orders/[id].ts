/**
 * 管理后台 - 订单详情/更新状态 API
 * GET - 获取订单详情
 * PUT - 更新订单状态
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
  res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, OPTIONS');
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
        `SELECT
          o.*,
          u.username,
          u.phone as user_phone
         FROM orders o
         LEFT JOIN users u ON o.user_id = u.id
         WHERE o.id = $1`,
        [id]
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
          userId: order.user_id,
          username: order.username,
          userPhone: order.user_phone,
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

    // PUT - 更新订单状态
    if (req.method === 'PUT') {
      const { status, remark } = req.body || {};

      if (!status) {
        await client.end();
        return res.status(200).json({
          code: 400,
          message: '订单状态不能为空',
          data: null,
        });
      }

      // 验证状态流转是否合法
      const validStatuses = ['pending', 'paid', 'shipped', 'completed', 'cancelled'];
      if (!validStatuses.includes(status)) {
        await client.end();
        return res.status(200).json({
          code: 400,
          message: '无效的订单状态',
          data: null,
        });
      }

      // 查询当前订单状态
      const currentResult = await client.query(
        'SELECT status FROM orders WHERE id = $1',
        [id]
      );

      if (currentResult.rows.length === 0) {
        await client.end();
        return res.status(200).json({
          code: 404,
          message: '订单不存在',
          data: null,
        });
      }

      const currentStatus = currentResult.rows[0].status;

      // 状态流转规则验证
      const statusFlow: any = {
        pending: ['paid', 'cancelled'],
        paid: ['shipped', 'cancelled'],
        shipped: ['completed'],
        completed: [],
        cancelled: [],
      };

      if (!statusFlow[currentStatus]?.includes(status)) {
        await client.end();
        return res.status(200).json({
          code: 400,
          message: `订单当前状态为 ${currentStatus}，不能更新为 ${status}`,
          data: null,
        });
      }

      // 更新订单状态
      const updateFields = ['status = $1', 'updated_at = CURRENT_TIMESTAMP'];
      const updateParams: any[] = [status];
      let paramIndex = 2;

      // 根据状态设置时间戳
      if (status === 'paid') {
        updateFields.push(`paid_at = CURRENT_TIMESTAMP`);
      } else if (status === 'shipped') {
        updateFields.push(`shipped_at = CURRENT_TIMESTAMP`);
      } else if (status === 'completed') {
        updateFields.push(`completed_at = CURRENT_TIMESTAMP`);
      } else if (status === 'cancelled') {
        updateFields.push(`cancelled_at = CURRENT_TIMESTAMP`);
      }

      if (remark) {
        updateFields.push(`remark = $${paramIndex}`);
        updateParams.push(remark);
        paramIndex++;
      }

      updateParams.push(id);

      await client.query(
        `UPDATE orders SET ${updateFields.join(', ')} WHERE id = $${paramIndex}`,
        updateParams
      );

      await client.end();

      return res.status(200).json({
        code: 200,
        message: '更新成功',
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

/**
 * 支付回调 API
 * 模拟支付成功后的回调处理
 * 实际生产环境需要验证支付平台的签名
 */
import type { VercelRequest, VercelResponse } from '@vercel/node';
import pkg from 'pg';

const { Client } = pkg;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // 设置 CORS 头
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(200).json({
      code: 405,
      message: '方法不允许',
      data: null,
    });
  }

  const { paymentNo, orderId, status, sign } = req.body || {};

  // 实际生产环境需要验证签名
  // if (!verifySign(req.body, sign)) {
  //   return res.status(200).json({
  //     code: 400,
  //     message: '签名验证失败',
  //     data: null,
  //   });
  // }

  if (!paymentNo || !orderId) {
    return res.status(200).json({
      code: 400,
      message: '参数不完整',
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

    // 开启事务
    await client.query('BEGIN');

    // 查询订单
    const orderResult = await client.query(
      'SELECT * FROM orders WHERE id = $1',
      [orderId]
    );

    if (orderResult.rows.length === 0) {
      await client.query('ROLLBACK');
      await client.end();
      return res.status(200).json({
        code: 404,
        message: '订单不存在',
        data: null,
      });
    }

    const order = orderResult.rows[0];

    // 检查订单是否已支付
    if (order.status !== 'pending') {
      await client.query('ROLLBACK');
      await client.end();
      return res.status(200).json({
        code: 400,
        message: '订单状态不正确',
        data: null,
      });
    }

    // 支付成功，更新订单状态
    if (status === 'success') {
      await client.query(
        `UPDATE orders
         SET status = 'paid', paid_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
         WHERE id = $1`,
        [orderId]
      );

      await client.query('COMMIT');
      await client.end();

      return res.status(200).json({
        code: 200,
        message: '支付成功',
        data: { orderId, status: 'paid' },
      });
    } else {
      // 支付失败，订单保持待支付状态
      await client.query('ROLLBACK');
      await client.end();

      return res.status(200).json({
        code: 400,
        message: '支付失败',
        data: null,
      });
    }
  } catch (error: any) {
    console.error('[API] 支付回调处理失败:', error);

    if (client) {
      try {
        await client.query('ROLLBACK');
        await client.end();
      } catch (e) {
        // ignore
      }
    }

    res.status(200).json({
      code: 500,
      message: error.message || '处理失败',
      data: null,
    });
  }
}

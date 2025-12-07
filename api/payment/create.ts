/**
 * 支付创建 API
 * 模拟版：实际生产环境需要对接支付宝、微信支付等
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
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

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

  // 验证用户身份
  const userId = getUserIdFromToken(req);
  if (!userId) {
    return res.status(200).json({
      code: 401,
      message: '请先登录',
      data: null,
    });
  }

  const { orderId, paymentMethod = 'alipay' } = req.body || {};

  if (!orderId) {
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

    // 查询订单
    const orderResult = await client.query(
      'SELECT * FROM orders WHERE id = $1 AND user_id = $2',
      [orderId, userId]
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

    // 检查订单状态
    if (order.status !== 'pending') {
      await client.end();
      return res.status(200).json({
        code: 400,
        message: '订单状态不允许支付',
        data: null,
      });
    }

    await client.end();

    // 生成支付订单号
    const paymentNo = `PAY${Date.now()}${Math.floor(Math.random() * 10000)}`;

    // ========================================
    // 这里应该调用真实的支付接口
    // 例如：支付宝、微信支付、银联等
    // ========================================
    // const paymentResult = await createAlipayOrder({
    //   orderNo: order.order_no,
    //   amount: order.total_amount,
    //   subject: '宠物商城订单',
    //   body: `订单号：${order.order_no}`,
    // });

    // 模拟返回支付参数
    const mockPaymentData = {
      paymentNo,
      paymentMethod,
      amount: parseFloat(order.total_amount),
      // 模拟支付链接（实际应该是支付宝/微信的支付链接）
      paymentUrl: `https://mock-payment.com/pay?no=${paymentNo}&amount=${order.total_amount}`,
      // 模拟二维码数据（用于扫码支付）
      qrCode: `https://mock-payment.com/qr/${paymentNo}`,
      // 支付过期时间（15分钟）
      expireTime: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
    };

    return res.status(200).json({
      code: 200,
      message: '支付订单创建成功',
      data: mockPaymentData,
    });
  } catch (error: any) {
    console.error('[API] 创建支付订单失败:', error);

    if (client) {
      try {
        await client.end();
      } catch (e) {
        // ignore
      }
    }

    res.status(200).json({
      code: 500,
      message: error.message || '创建失败',
      data: null,
    });
  }
}

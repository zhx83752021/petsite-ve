/**
 * 创建订单 API
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

// 生成订单号
function generateOrderNo(): string {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `ORD${timestamp}${random}`;
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

  const { items, address } = req.body || {};

  // 参数验证
  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(200).json({
      code: 400,
      message: '订单商品不能为空',
      data: null,
    });
  }

  if (!address || !address.name || !address.phone || !address.detail) {
    return res.status(200).json({
      code: 400,
      message: '收货地址信息不完整',
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

    // 计算订单总金额并验证库存
    let totalAmount = 0;
    const orderItems: any[] = [];

    for (const item of items) {
      const { skuId, quantity } = item;

      if (!skuId || !quantity || quantity < 1) {
        await client.query('ROLLBACK');
        await client.end();
        return res.status(200).json({
          code: 400,
          message: '商品信息不完整',
          data: null,
        });
      }

      // 查询商品和 SKU 信息
      const skuResult = await client.query(
        `SELECT
          ps.id, ps.product_id, ps.price, ps.stock, ps.spec_combination,
          p.name as product_name, p.main_images
         FROM product_skus ps
         JOIN products p ON ps.product_id = p.id
         WHERE ps.id = $1 AND ps.status = 1 AND p.status = 1`,
        [skuId]
      );

      if (skuResult.rows.length === 0) {
        await client.query('ROLLBACK');
        await client.end();
        return res.status(200).json({
          code: 404,
          message: '商品不存在或已下架',
          data: null,
        });
      }

      const sku = skuResult.rows[0];

      // 检查库存
      if (sku.stock < quantity) {
        await client.query('ROLLBACK');
        await client.end();
        return res.status(200).json({
          code: 400,
          message: `${sku.product_name} 库存不足`,
          data: null,
        });
      }

      // 扣减库存
      await client.query(
        'UPDATE product_skus SET stock = stock - $1 WHERE id = $2',
        [quantity, skuId]
      );

      const itemTotal = parseFloat(sku.price) * quantity;
      totalAmount += itemTotal;

      orderItems.push({
        productId: sku.product_id,
        skuId: sku.id,
        productName: sku.product_name,
        spec: sku.spec_combination,
        price: parseFloat(sku.price),
        quantity,
        image: sku.main_images?.[0] || '',
      });
    }

    // 创建订单
    const orderNo = generateOrderNo();
    const orderResult = await client.query(
      `INSERT INTO orders (
        user_id, order_no, total_amount, status,
        receiver_name, receiver_phone, receiver_address
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id, order_no, created_at`,
      [
        userId,
        orderNo,
        totalAmount,
        'pending', // 待支付
        address.name,
        address.phone,
        `${address.province} ${address.city} ${address.district} ${address.detail}`,
      ]
    );

    const orderId = orderResult.rows[0].id;

    // 清空购物车中已下单的商品
    if (items.length > 0) {
      const skuIds = items.map((item: any) => item.skuId);
      await client.query(
        'DELETE FROM cart_items WHERE user_id = $1 AND sku_id = ANY($2)',
        [userId, skuIds]
      );
    }

    // 提交事务
    await client.query('COMMIT');
    await client.end();

    res.status(200).json({
      code: 200,
      message: '订单创建成功',
      data: {
        orderId,
        orderNo,
        totalAmount,
        items: orderItems,
        createdAt: orderResult.rows[0].created_at,
      },
    });
  } catch (error: any) {
    console.error('[API] 创建订单失败:', error);

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
      message: error.message || '创建订单失败',
      data: null,
    });
  }
}

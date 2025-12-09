import { VercelRequest, VercelResponse } from '@vercel/node';
import { getPool } from '../_db';

export default async (req: VercelRequest, res: VercelResponse) => {
  // 设置 CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    return res.status(405).json({
      code: 405,
      message: 'Method not allowed'
    });
  }

  try {
    const db = getPool();

    // 查询商品列表 - 简化版本
    const result = await db.query(`
      SELECT
        p.id,
        p.name,
        p.category_id
      FROM products p
      ORDER BY p.id DESC
    `);

    // 为每个商品查询价格和库存
    const items = await Promise.all(result.rows.map(async (product: any) => {
      try {
        const skuResult = await db.query(
          'SELECT MIN(price) as min_price, MAX(price) as max_price, SUM(stock) as total_stock FROM product_skus WHERE product_id = $1',
          [product.id]
        );

        const sku = skuResult.rows[0] || {};

        return {
          id: product.id,
          name: product.name,
          description: '',
          category_id: product.category_id,
          image: 'https://images.unsplash.com/photo-1589924691995-400dc9ecc119?w=400',
          images: [],
          price: parseFloat(sku.min_price || 0),
          originalPrice: parseFloat(sku.max_price || 0),
          stock: parseInt(sku.total_stock || 0),
          sales: 0
        };
      } catch (err) {
        console.error('SKU query error:', err);
        return {
          id: product.id,
          name: product.name,
          description: '',
          image: 'https://images.unsplash.com/photo-1589924691995-400dc9ecc119?w=400',
          images: [],
          price: 0,
          originalPrice: 0,
          stock: 0,
          sales: 0
        };
      }
    }));

    res.status(200).json({
      code: 200,
      message: 'success',
      data: {
        items,
        total: items.length
      }
    });
  } catch (error: any) {
    console.error('Database error:', error);
    res.status(500).json({
      code: 500,
      message: '服务器错误',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

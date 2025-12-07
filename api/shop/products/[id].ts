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

  if (req.method !== 'GET') {
    return res.status(405).json({
      code: 405,
      message: 'Method not allowed'
    });
  }

  try {
    const { id } = req.query;

    if (!id) {
      return res.status(400).json({
        code: 400,
        message: '商品ID不能为空'
      });
    }

    const db = getPool();

    // 查询商品基本信息
    const productResult = await db.query(
      'SELECT id, name, category_id FROM products WHERE id = $1',
      [id]
    );

    if (productResult.rows.length === 0) {
      return res.status(404).json({
        code: 404,
        message: '商品不存在'
      });
    }

    const product = productResult.rows[0];

    // 查询商品SKU信息
    const skuResult = await db.query(
      'SELECT id, name as sku_name, price, stock, specs FROM product_skus WHERE product_id = $1',
      [id]
    );

    // 计算价格范围
    const prices = skuResult.rows.map((sku: any) => parseFloat(sku.price));
    const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
    const maxPrice = prices.length > 0 ? Math.max(...prices) : 0;
    const totalStock = skuResult.rows.reduce((sum: number, sku: any) => sum + parseInt(sku.stock || 0), 0);

    // 查询分类名称
    let categoryName = '';
    try {
      const categoryResult = await db.query(
        'SELECT name FROM categories WHERE id = $1',
        [product.category_id]
      );
      if (categoryResult.rows.length > 0) {
        categoryName = categoryResult.rows[0].name;
      }
    } catch (err) {
      console.error('Category query error:', err);
    }

    // 返回商品详情
    res.status(200).json({
      code: 200,
      message: 'success',
      data: {
        id: product.id,
        name: product.name,
        description: '这是一款优质的宠物商品，专为您的爱宠精心挑选。',
        category_id: product.category_id,
        category_name: categoryName || '未分类',
        image: 'https://images.unsplash.com/photo-1589924691995-400dc9ecc119?w=800',
        images: [
          'https://images.unsplash.com/photo-1589924691995-400dc9ecc119?w=800',
          'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=800',
          'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=800'
        ],
        price: minPrice,
        originalPrice: maxPrice,
        stock: totalStock,
        sales: 0,
        skus: skuResult.rows.map((sku: any) => ({
          id: sku.id,
          name: sku.sku_name,
          price: parseFloat(sku.price),
          stock: parseInt(sku.stock || 0),
          specs: sku.specs || {}
        }))
      }
    });
  } catch (error: any) {
    console.error('Product detail API error:', error);
    res.status(500).json({
      code: 500,
      message: '加载商品失败',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

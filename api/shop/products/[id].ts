/**
 * 商品详情 API
 */
import type { VercelRequest, VercelResponse } from '@vercel/node';
import pkg from 'pg';
const { Client } = pkg;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // 设置 CORS 头
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { id } = req.query;

  if (!id) {
    return res.status(200).json({
      code: 400,
      message: '商品ID不能为空',
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

    // 查询商品基本信息
    const productResult = await client.query(
      `SELECT
        p.id,
        p.name,
        p.slug,
        p.subtitle,
        p.detail,
        p.main_images,
        p.category_id,
        p.brand_id,
        p.status,
        p.sales,
        p.views,
        p.created_at,
        p.updated_at
      FROM products p
      WHERE p.id = $1 AND p.status = 1`,
      [id]
    );

    if (productResult.rows.length === 0) {
      await client.end();
      return res.status(200).json({
        code: 404,
        message: '商品不存在',
        data: null,
      });
    }

    const product = productResult.rows[0];

    // 查询商品所有SKU
    const skuResult = await client.query(
      `SELECT
        id,
        sku_code,
        spec_combination,
        price,
        original_price,
        stock,
        status
      FROM product_skus
      WHERE product_id = $1 AND status = 1
      ORDER BY price ASC`,
      [id]
    );

    await client.end();

    // 调试日志
    console.log(`[API] 商品 ${id} 的 SKU 数量:`, skuResult.rows.length);
    console.log(`[API] SKU 数据:`, JSON.stringify(skuResult.rows, null, 2));

    // 计算价格范围
    const skus = skuResult.rows;

    // 如果没有 SKU，返回空数据
    if (skus.length === 0) {
      console.log(`[API] 警告: 商品 ${id} 没有 SKU 数据`);
      return res.status(200).json({
        code: 200,
        message: 'success',
        data: {
          ...product,
          price: 0,
          originalPrice: 0,
          stock: 0,
          skus: [],
        },
      });
    }

    const prices = skus.map((sku: any) => parseFloat(sku.price));
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const totalStock = skus.reduce((sum: number, sku: any) => sum + (sku.stock || 0), 0);

    // 转换数据格式
    const detail = {
      id: product.id,
      name: product.name,
      subtitle: product.subtitle,
      detail: product.detail || '',
      image: product.main_images?.[0] || '',
      images: product.main_images || [],
      price: minPrice,
      originalPrice: maxPrice > minPrice ? maxPrice : minPrice * 1.2,
      sales: product.sales || 0,
      stock: totalStock,
      categoryId: product.category_id,
      brandId: product.brand_id,
      views: product.views || 0,
      skus: skus.map((sku: any) => ({
        id: sku.id,
        skuCode: sku.sku_code,
        spec: sku.spec_combination,
        name: sku.spec_combination, // 前端期望的字段
        value: sku.spec_combination, // 前端期望的字段
        price: parseFloat(sku.price),
        originalPrice: parseFloat(sku.original_price || sku.price),
        stock: sku.stock || 0,
      })),
      createdAt: product.created_at,
      updatedAt: product.updated_at,
    };

    res.status(200).json({
      code: 200,
      message: 'success',
      data: detail,
    });
  } catch (error: any) {
    console.error('[API] 查询商品详情失败:', error);

    if (client) {
      try {
        await client.end();
      } catch (e) {
        // ignore
      }
    }

    res.status(200).json({
      code: 500,
      message: error.message || '查询商品详情失败',
      data: null,
    });
  }
}

/**
 * 商品列表 API - 直接访问数据库
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

  const client = new Client({
    connectionString: process.env.POSTGRES_URL || process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false,
    },
  });

  try {
    await client.connect();

    // 获取查询参数
    const {
      page = 1,
      pageSize = 20,
      keyword = '',
      categoryId = '',
      brandId = '',
      minPrice = '',
      maxPrice = '',
      sortBy = 'created_at', // created_at, price, sales
      sortOrder = 'desc' // asc, desc
    } = req.query;

    // 构建 WHERE 条件
    const conditions: string[] = ['p.status = 1'];
    const params: any[] = [];
    let paramIndex = 1;

    // 关键词搜索
    if (keyword) {
      conditions.push(`(p.name ILIKE $${paramIndex} OR p.subtitle ILIKE $${paramIndex})`);
      params.push(`%${keyword}%`);
      paramIndex++;
    }

    // 分类筛选
    if (categoryId) {
      conditions.push(`p.category_id = $${paramIndex}`);
      params.push(categoryId);
      paramIndex++;
    }

    // 品牌筛选
    if (brandId) {
      conditions.push(`p.brand_id = $${paramIndex}`);
      params.push(brandId);
      paramIndex++;
    }

    // 价格范围筛选
    if (minPrice) {
      conditions.push(`ps.price >= $${paramIndex}`);
      params.push(parseFloat(minPrice as string));
      paramIndex++;
    }

    if (maxPrice) {
      conditions.push(`ps.price <= $${paramIndex}`);
      params.push(parseFloat(maxPrice as string));
      paramIndex++;
    }

    const whereClause = conditions.join(' AND ');

    // 排序字段映射
    const sortFieldMap: any = {
      'created_at': 'p.created_at',
      'price': 'min_price',
      'sales': 'p.sales',
    };
    const sortField = sortFieldMap[sortBy as string] || 'p.created_at';
    const sortDirection = sortOrder === 'asc' ? 'ASC' : 'DESC';

    // 计算偏移量
    const offset = (parseInt(page as string) - 1) * parseInt(pageSize as string);
    const limit = parseInt(pageSize as string);

    // 查询商品和SKU
    const result = await client.query(`
      SELECT
        p.id,
        p.name,
        p.subtitle,
        p.main_images,
        p.category_id,
        p.sales,
        MIN(ps.price) as min_price,
        MAX(ps.price) as max_price,
        SUM(ps.stock) as total_stock
      FROM products p
      LEFT JOIN product_skus ps ON p.id = ps.product_id
      WHERE ${whereClause}
      GROUP BY p.id, p.name, p.subtitle, p.main_images, p.category_id, p.sales
      ORDER BY ${sortField} ${sortDirection}
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `, [...params, limit, offset]);

    // 查询总数
    const countResult = await client.query(`
      SELECT COUNT(DISTINCT p.id) as total
      FROM products p
      LEFT JOIN product_skus ps ON p.id = ps.product_id
      WHERE ${whereClause}
    `, params);

    await client.end();

    // 转换数据格式以匹配前端期望
    const items = result.rows.map((row: any) => ({
      id: row.id,
      name: row.name,
      subtitle: row.subtitle,
      image: row.main_images?.[0] || '',
      images: row.main_images || [],
      price: parseFloat(row.min_price) || 0,
      originalPrice: parseFloat(row.max_price) || 0,
      sales: row.sales || 0,
      stock: row.total_stock || 0,
      categoryId: row.category_id,
    }));

    const total = parseInt(countResult.rows[0]?.total || '0');

    res.status(200).json({
      code: 200,
      message: 'success',
      data: {
        items,
        pagination: {
          total,
          page: parseInt(page as string),
          pageSize: parseInt(pageSize as string),
        },
      },
    });
  } catch (error: any) {
    console.error('[API] 查询商品失败:', error);

    if (client) {
      try {
        await client.end();
      } catch (e) {
        // ignore
      }
    }

    res.status(200).json({
      code: 500,
      message: error.message || '查询商品失败',
      data: null,
    });
  }
}

/**
 * 商品分类列表 API
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

    // 查询所有分类
    const result = await client.query(`
      SELECT
        id,
        name,
        parent_id,
        icon,
        sort,
        status
      FROM categories
      WHERE status = 1
      ORDER BY sort ASC, id ASC
    `);

    await client.end();

    // 构建树形结构
    const categories = result.rows;
    const categoryMap = new Map();
    const rootCategories: any[] = [];

    // 第一遍：创建所有分类对象
    categories.forEach((cat: any) => {
      categoryMap.set(cat.id, {
        id: cat.id,
        name: cat.name,
        parentId: cat.parent_id,
        icon: cat.icon,
        sort: cat.sort,
        children: [],
      });
    });

    // 第二遍：构建树形结构
    categories.forEach((cat: any) => {
      const category = categoryMap.get(cat.id);
      if (cat.parent_id) {
        const parent = categoryMap.get(cat.parent_id);
        if (parent) {
          parent.children.push(category);
        }
      } else {
        rootCategories.push(category);
      }
    });

    res.status(200).json({
      code: 200,
      message: 'success',
      data: {
        list: rootCategories,
        total: rootCategories.length,
      },
    });
  } catch (error: any) {
    console.error('[API] 查询分类失败:', error);

    if (client) {
      try {
        await client.end();
      } catch (e) {
        // ignore
      }
    }

    res.status(200).json({
      code: 500,
      message: error.message || '查询分类失败',
      data: null,
    });
  }
}

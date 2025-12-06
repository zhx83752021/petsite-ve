import { Router, Request, Response } from 'express';
import sequelize from '../config/database';
import { Product } from '../models';

const router = Router();

/**
 * 诊断路由 - 用于调试 Serverless 环境
 */

// 数据库连接测试
router.get('/db-test', async (_req: Request, res: Response) => {
  try {
    await sequelize.authenticate();
    res.json({
      success: true,
      message: '数据库连接正常',
      env: {
        NODE_ENV: process.env.NODE_ENV,
        DATABASE_URL_EXISTS: !!process.env.DATABASE_URL,
        VERCEL: !!process.env.VERCEL,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: '数据库连接失败',
      error: error.message,
      env: {
        NODE_ENV: process.env.NODE_ENV,
        DATABASE_URL_EXISTS: !!process.env.DATABASE_URL,
        VERCEL: !!process.env.VERCEL,
      },
    });
  }
});

// 商品数量测试
router.get('/product-count', async (_req: Request, res: Response) => {
  try {
    const count = await Product.count();
    res.json({
      success: true,
      count,
      message: `找到 ${count} 个商品`,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: '查询商品失败',
      error: error.message,
    });
  }
});

// 获取第一个商品
router.get('/first-product', async (_req: Request, res: Response) => {
  try {
    const product = await Product.findOne();
    res.json({
      success: true,
      product,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: '查询商品失败',
      error: error.message,
    });
  }
});

export default router;

/**
 * 数据库初始化路由
 * 警告：仅在首次部署时使用，初始化完成后应禁用此路由
 */
import { Router, Request, Response } from 'express';
import { testConnection, syncDatabase } from '../config/database';
import bcrypt from 'bcryptjs';
import { Admin } from '../models';
import { Category } from '../models';
import { Brand } from '../models';
import { logger } from '../utils/logger';

const router = Router();

/**
 * 初始化数据库
 * POST /api/init/database
 */
router.post('/database', async (req: Request, res: Response): Promise<void> => {
  try {
    // 安全检查：需要提供初始化密钥
    const { initKey } = req.body;
    const expectedKey = process.env.INIT_KEY || 'your-secret-init-key';

    if (initKey !== expectedKey) {
      res.status(403).json({
        code: 403,
        message: '无权限执行此操作',
      });
      return;
    }

    logger.info('开始初始化数据库...');

    // 1. 测试数据库连接
    await testConnection();
    logger.info('数据库连接成功');

    // 2. 同步数据库模型（创建表）
    await syncDatabase(false); // false = 不删除现有数据
    logger.info('数据库表创建成功');

    // 3. 创建默认管理员账号
    const adminExists = await Admin.findOne({ where: { username: 'admin' } });
    if (!adminExists) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await Admin.create({
        username: 'admin',
        password: hashedPassword,
        realName: '系统管理员',
        status: 1,
      });
      logger.info('默认管理员账号创建成功');
    } else {
      logger.info('管理员账号已存在，跳过创建');
    }

    // 4. 创建默认分类
    const categoryCount = await Category.count();
    if (categoryCount === 0) {
      await Category.bulkCreate([
        { name: '狗粮', sort: 1, status: 1 },
        { name: '猫粮', sort: 2, status: 1 },
        { name: '零食', sort: 3, status: 1 },
        { name: '玩具', sort: 4, status: 1 },
        { name: '用品', sort: 5, status: 1 },
      ]);
      logger.info('默认分类创建成功');
    } else {
      logger.info('分类数据已存在，跳过创建');
    }

    // 5. 创建默认品牌
    const brandCount = await Brand.count();
    if (brandCount === 0) {
      await Brand.bulkCreate([
        { name: '皇家', sort: 1, status: 1 },
        { name: '冠能', sort: 2, status: 1 },
        { name: '渴望', sort: 3, status: 1 },
        { name: '爱肯拿', sort: 4, status: 1 },
      ]);
      logger.info('默认品牌创建成功');
    } else {
      logger.info('品牌数据已存在，跳过创建');
    }

    logger.info('数据库初始化完成');

    res.json({
      code: 200,
      message: '数据库初始化成功',
      data: {
        admin: {
          username: 'admin',
          password: 'admin123',
          note: '默认管理员账号，请及时修改密码',
        },
        categories: 5,
        brands: 4,
      },
    });
  } catch (error: any) {
    logger.error('数据库初始化失败:', error);
    res.status(500).json({
      code: 500,
      message: '数据库初始化失败',
      error: error.message,
    });
  }
});

/**
 * 检查数据库状态
 * GET /api/init/status
 */
router.get('/status', async (_req: Request, res: Response) => {
  try {
    await testConnection();

    const adminCount = await Admin.count();
    const categoryCount = await Category.count();
    const brandCount = await Brand.count();

    res.json({
      code: 200,
      message: '数据库状态正常',
      data: {
        connected: true,
        admins: adminCount,
        categories: categoryCount,
        brands: brandCount,
        initialized: adminCount > 0 && categoryCount > 0,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      code: 500,
      message: '数据库连接失败',
      error: error.message,
    });
  }
});

export default router;

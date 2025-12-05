import dotenv from 'dotenv';
import { testConnection, syncDatabase } from '../src/config/database';
import { logger } from '../src/utils/logger';

// 加载环境变量
dotenv.config({ path: `.env.${process.env.NODE_ENV || 'development'}` });

/**
 * 数据库初始化脚本
 * 用于创建所有数据库表
 */
const initDatabase = async (): Promise<void> => {
  try {
    logger.info('开始初始化数据库...');

    // 测试数据库连接
    logger.info('正在测试数据库连接...');
    await testConnection();

    // 同步数据库模型 (force: true 会删除现有表并重新创建)
    const forceSync = process.argv.includes('--force');
    logger.info(`正在同步数据库模型 (force: ${forceSync})...`);
    await syncDatabase(forceSync);

    logger.info('数据库初始化完成!');
    process.exit(0);
  } catch (error) {
    logger.error('数据库初始化失败:', error);
    process.exit(1);
  }
};

// 运行初始化
initDatabase();

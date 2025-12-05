import dotenv from 'dotenv';
import sequelize from '../src/config/database';
import { logger } from '../src/utils/logger';

// 加载环境变量
dotenv.config({ path: `.env.${process.env.NODE_ENV || 'development'}` });

/**
 * 清理购物车表脚本
 * 删除旧的 cart_items 表，让 Sequelize 重新创建
 */
const cleanCartTable = async (): Promise<void> => {
  try {
    logger.info('开始清理购物车表...');

    // 删除旧表
    await sequelize.query('DROP TABLE IF EXISTS cart_items CASCADE;');
    logger.info('购物车表已删除');

    logger.info('清理完成! 请重启后端服务以重新创建表');
    process.exit(0);
  } catch (error) {
    logger.error('清理失败:', error);
    process.exit(1);
  }
};

// 运行清理
cleanCartTable();

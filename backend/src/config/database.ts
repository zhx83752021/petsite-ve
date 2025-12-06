import dotenv from 'dotenv';
import { Sequelize } from 'sequelize';
import { logger } from '../utils/logger';

// 确保环境变量已加载
dotenv.config({ path: `.env.${process.env.NODE_ENV || 'development'}` });

/**
 * 数据库配置和连接
 */
const DB_HOST: string = String(process.env.DB_HOST || 'localhost');
const DB_PORT: string = String(process.env.DB_PORT || '5432');
const DB_NAME: string = String(process.env.DB_NAME || 'pet_web');
const DB_USER: string = String(process.env.DB_USER || 'postgres');
const DB_PASSWORD: string = String(process.env.DB_PASSWORD || '');

// 调试日志
console.log('[Database Config]');
console.log('DB_PASSWORD type:', typeof DB_PASSWORD);
console.log('DB_PASSWORD value:', DB_PASSWORD ? '******' : '(empty)');
console.log('DB_PASSWORD length:', DB_PASSWORD.length);

// Serverless 环境检测
const isServerless = process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME;

const sequelize = new Sequelize(
  process.env.DATABASE_URL || `postgres://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}`,
  {
    dialect: 'postgres' as 'postgres',
    dialectOptions: {
      ssl: process.env.NODE_ENV === 'production' ? {
        require: true,
        rejectUnauthorized: false
      } : false,
      // 设置客户端编码为 UTF8
      client_encoding: 'UTF8',
    },
    // 使用 UTC 时区,避免时区转换问题
    timezone: '+08:00',
    // Serverless 环境下的连接池配置
    pool: isServerless ? {
      max: 2,
      min: 0,
      acquire: 10000,
      idle: 1000,
      evict: 1000,
    } : {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
    logging: (sql: string) => {
      if (process.env.NODE_ENV === 'development') {
        console.log('[SQL]:', sql);
        logger.debug(sql);
      } else {
        // 生产环境也输出到控制台,方便 Vercel 日志查看
        console.log('[SQL]:', sql);
      }
    },
    // 模型默认配置
    define: {
      timestamps: true,
      underscored: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      deletedAt: 'deleted_at',
      paranoid: true,
      // 防止字段名自动转换问题
      freezeTableName: false,
    },
    // 查询选项
    query: {
      raw: false,
    },
  }
);

/**
 * 测试数据库连接
 */
export const testConnection = async (): Promise<void> => {
  try {
    await sequelize.authenticate();
    logger.info('数据库连接成功');
  } catch (error) {
    logger.error('数据库连接失败:', error);
    throw error;
  }
};

/**
 * 初始化数据库模型
 * 导入所有模型以注册到 Sequelize
 */
export const initModels = async (): Promise<void> => {
  try {
    // 静态导入模型文件,确保模型被注册
    require('../models');
    logger.info('数据库模型初始化成功');
  } catch (error) {
    logger.error('数据库模型初始化失败:', error);
    throw error;
  }
};

/**
 * 同步数据库模型
 */
export const syncDatabase = async (force = false): Promise<void> => {
  try {
    // 先初始化模型
    await initModels();
    // 然后同步数据库
    await sequelize.sync({ force });
    logger.info(`数据库模型同步成功 (force: ${force})`);
  } catch (error) {
    logger.error('数据库模型同步失败:', error);
    throw error;
  }
};

export default sequelize;

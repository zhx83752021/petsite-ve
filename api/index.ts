/**
 * Vercel Serverless Function 入口
 * 将Express应用导出为Serverless Function
 */
import type { VercelRequest, VercelResponse } from '@vercel/node';
import dotenv from 'dotenv';
import createApp from '../backend/src/app.js';
import { testConnection, initModels } from '../backend/src/config/database.js';

// 加载环境变量
dotenv.config();

// 缓存应用实例和数据库连接状态
let app: any = null;
let isDbInitialized = false;

/**
 * 初始化数据库（仅在首次调用时执行）
 */
async function initializeDatabase() {
  if (!isDbInitialized) {
    console.log('[Serverless] 初始化数据库连接...');
    try {
      await testConnection();
      await initModels();
      isDbInitialized = true;
      console.log('[Serverless] 数据库初始化成功');
    } catch (error) {
      console.error('[Serverless] 数据库初始化失败:', error);
      throw error;
    }
  }
}

/**
 * 获取或创建应用实例（单例模式）
 */
async function getApp() {
  if (!app) {
    console.log('[Serverless] 创建应用实例...');
    await initializeDatabase();
    app = createApp();
    console.log('[Serverless] 应用实例创建成功');
  }
  return app;
}

// Vercel Serverless Function Handler
export default async (req: VercelRequest, res: VercelResponse) => {
  try {
    const appInstance = await getApp();

    // 将 Vercel request/response 转换为 Express 兼容格式
    return new Promise((resolve, reject) => {
      appInstance(req as any, res as any, (err?: any) => {
        if (err) {
          console.error('[Serverless] 请求处理错误:', err);
          reject(err);
        } else {
          resolve(undefined);
        }
      });
    });
  } catch (error) {
    console.error('[Serverless] 初始化错误:', error);
    res.status(500).json({
      code: 500,
      message: '服务器初始化失败',
      error: process.env.NODE_ENV === 'development' ? String(error) : undefined,
    });
  }
};

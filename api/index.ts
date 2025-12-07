/**
 * Vercel Serverless Function 入口
 * 代理所有 API 请求到 Express 应用
 */
import type { VercelRequest, VercelResponse } from '@vercel/node';

let app: any = null;

async function getApp() {
  if (!app) {
    // 动态导入 Express 应用
    const createAppModule = await import('../backend/src/app');
    const createApp = createAppModule.default;
    app = createApp();

    // 初始化数据库连接
    try {
      const dbModule = await import('../backend/src/config/database');
      await dbModule.testConnection();
      console.log('[Serverless] 数据库连接成功');
    } catch (err) {
      console.error('[Serverless] 数据库连接失败:', err);
    }
  }
  return app;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const appInstance = await getApp();

    // 代理请求到 Express
    return new Promise<void>((resolve, reject) => {
      appInstance(req, res, (err: any) => {
        if (err) {
          console.error('[Serverless] 错误:', err);
          reject(err);
        } else {
          resolve();
        }
      });
    });
  } catch (error: any) {
    console.error('[Serverless] 初始化错误:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}

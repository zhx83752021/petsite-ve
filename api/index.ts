/**
 * Vercel Serverless Function 入口
 * 代理所有 API 请求到 Express 应用
 */
import { VercelRequest, VercelResponse } from '@vercel/node';

let app: any = null;
let initError: any = null;

async function getApp() {
  if (initError) {
    throw initError;
  }

  if (!app) {
    try {
      console.log('[Serverless] 开始初始化应用...');

      // 检查环境变量
      const hasDbUrl = !!(process.env.POSTGRES_URL || process.env.DATABASE_URL);
      console.log('[Serverless] 数据库连接字符串存在:', hasDbUrl);

      if (!hasDbUrl) {
        throw new Error('缺少数据库连接字符串 (POSTGRES_URL 或 DATABASE_URL)');
      }

      // 动态导入 Express 应用
      console.log('[Serverless] 导入 Express 应用...');
      const createAppModule = await import('../backend/src/app');
      const createApp = createAppModule.default;
      app = createApp();
      console.log('[Serverless] Express 应用创建成功');

      // 测试数据库连接
      try {
        console.log('[Serverless] 测试数据库连接...');
        const dbModule = await import('../backend/src/config/database');
        await dbModule.testConnection();
        console.log('[Serverless] 数据库连接成功');
      } catch (dbErr: any) {
        console.error('[Serverless] 数据库连接失败:', dbErr.message);
        console.error('[Serverless] 堆栈:', dbErr.stack);
        // 数据库连接失败不阻止应用启动，但记录错误
      }

      console.log('[Serverless] 应用初始化完成');
    } catch (err: any) {
      console.error('[Serverless] 应用初始化失败:', err.message);
      console.error('[Serverless] 堆栈:', err.stack);
      initError = err;
      throw err;
    }
  }
  return app;
}

module.exports = async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    console.log(`[Serverless] 收到请求: ${req.method} ${req.url}`);

    // 简单的健康检查，不加载 Express
    if (req.url === '/api/health' || req.url === '/health') {
      return res.status(200).json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        message: 'API is running',
      });
    }

    const appInstance = await getApp();

    // 代理请求到 Express
    return new Promise<void>((resolve, reject) => {
      appInstance(req, res, (err: any) => {
        if (err) {
          console.error('[Serverless] Express 错误:', err);
          reject(err);
        } else {
          resolve();
        }
      });
    });
  } catch (error: any) {
    console.error('[Serverless] 处理请求失败:', error.message);
    console.error('[Serverless] 堆栈:', error.stack);

    res.status(500).json({
      success: false,
      code: 500,
      message: '服务器内部错误',
      error: error.message,
      stack: error.stack,
      url: req.url,
    });
  }
}

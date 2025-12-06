/**
 * Vercel Serverless Function 入口
 * 将Express应用导出为Serverless Function
 */
import type { VercelRequest, VercelResponse } from '@vercel/node';

// Vercel Serverless Function Handler
export default async (req: VercelRequest, res: VercelResponse): Promise<void> => {
  try {
    console.log('[Serverless] 收到请求:', req.method, req.url);

    // 动态导入以避免顶层错误
    const dotenv = await import('dotenv');
    dotenv.config();

    console.log('[Serverless] 环境变量加载完成');
    console.log('[Serverless] DATABASE_URL存在:', !!process.env.DATABASE_URL);
    console.log('[Serverless] NODE_ENV:', process.env.NODE_ENV);

    // 动态导入应用
    const { default: createApp } = await import('../backend/src/app');
    console.log('[Serverless] 应用模块导入成功');

    // 创建应用实例
    const app = createApp();
    console.log('[Serverless] 应用实例创建成功');

    // 将 Vercel request/response 转换为 Express 兼容格式
    await new Promise<void>((resolve, reject) => {
      app(req as any, res as any, (err?: any) => {
        if (err) {
          console.error('[Serverless] 请求处理错误:', err);
          reject(err);
        } else {
          resolve();
        }
      });
    });
  } catch (error: any) {
    console.error('[Serverless] 函数执行错误:', error);
    console.error('[Serverless] 错误堆栈:', error.stack);

    // 确保响应还没发送
    if (!res.headersSent) {
      res.status(500).json({
        code: 500,
        message: '服务器错误',
        error: error.message || String(error),
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      });
    }
  }
};

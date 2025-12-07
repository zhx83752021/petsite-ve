/**
 * Vercel Serverless Function 入口
 * 将Express应用导出为Serverless Function
 */
import { VercelRequest, VercelResponse } from '@vercel/node';

// 动态导入 CommonJS 模块
const getApp = async () => {
  const createApp = await import('../backend/src/app');
  // @ts-ignore - 处理 CommonJS/ES Module 兼容性
  const createAppFn = createApp.default || createApp;
  return typeof createAppFn === 'function' ? createAppFn() : createAppFn;
};

let appPromise: ReturnType<typeof getApp> | null = null;

// 导出处理函数供Vercel使用
export default async (req: VercelRequest, res: VercelResponse) => {
  try {
    // 缓存 app 实例
    if (!appPromise) {
      appPromise = getApp();
    }

    const app = await appPromise;

    // 将所有请求转发到Express应用
    return app(req as any, res as any);
  } catch (error: any) {
    console.error('Serverless Function Error:', error);
    res.status(500).json({
      code: 500,
      message: '服务器内部错误',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

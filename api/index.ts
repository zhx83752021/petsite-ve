/**
 * Vercel Serverless Function 入口
 * 将Express应用导出为Serverless Function
 */
import { VercelRequest, VercelResponse } from '@vercel/node';
import type { Application } from 'express';

let appInstance: Application | null = null;

// 初始化Express应用
const initApp = async (): Promise<Application> => {
  try {
    // 动态导入 backend/src/app
    const appModule = await import('../backend/src/app');
    const createApp = appModule.default;

    // 调用 createApp 函数创建应用实例
    if (typeof createApp === 'function') {
      return createApp();
    }

    throw new Error('createApp is not a function');
  } catch (error) {
    console.error('Failed to initialize app:', error);
    throw error;
  }
};

// 导出处理函数供Vercel使用
export default async (req: VercelRequest, res: VercelResponse) => {
  try {
    // 缓存 app 实例，避免每次请求都重新创建
    if (!appInstance) {
      appInstance = await initApp();
    }

    // 将请求转发到Express应用
    // @ts-ignore - Express Application 可以作为请求处理器
    return appInstance(req, res);
  } catch (error: any) {
    console.error('Serverless Function Error:', error);

    // 返回错误响应
    if (!res.headersSent) {
      res.status(500).json({
        code: 500,
        message: '服务器内部错误',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
};

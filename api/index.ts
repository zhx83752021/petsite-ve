/**
 * Vercel Serverless Function 入口
 * 将Express应用导出为Serverless Function
 */
import { VercelRequest, VercelResponse } from '@vercel/node';
import createApp from '../backend/src/app';

const app = createApp();

// 导出处理函数供Vercel使用
export default async (req: VercelRequest, res: VercelResponse) => {
  // 将所有请求转发到Express应用
  return app(req as any, res as any);
};

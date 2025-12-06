/**
 * Vercel Serverless Function 入口
 * 将Express应用导出为Serverless Function
 */
import type { VercelRequest, VercelResponse } from '@vercel/node';
import createApp from '../backend/src/app.js';

const app = createApp();

// Vercel Serverless Function Handler
export default async (req: VercelRequest, res: VercelResponse) => {
  // 将 Vercel request/response 转换为 Express 兼容格式
  return new Promise((resolve, reject) => {
    app(req as any, res as any, (err?: any) => {
      if (err) {
        reject(err);
      } else {
        resolve(undefined);
      }
    });
  });
};

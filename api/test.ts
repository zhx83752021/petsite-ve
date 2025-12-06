/**
 * 简单测试端点 - 验证 Serverless Function 基础功能
 */
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async (req: VercelRequest, res: VercelResponse) => {
  res.status(200).json({
    success: true,
    message: 'Serverless Function 工作正常',
    timestamp: new Date().toISOString(),
    env: {
      NODE_ENV: process.env.NODE_ENV,
      DATABASE_URL_EXISTS: !!process.env.DATABASE_URL,
      VERCEL: process.env.VERCEL,
    },
    request: {
      method: req.method,
      url: req.url,
    },
  });
};

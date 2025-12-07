/**
 * 健康检查 API
 */
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(_req: VercelRequest, res: VercelResponse) {
  res.status(200).json({
    code: 200,
    message: 'API is running',
    data: {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    },
  });
}

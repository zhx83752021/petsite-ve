/**
 * 超简单测试端点 - 不依赖任何东西
 */
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(_req: VercelRequest, res: VercelResponse) {
  res.status(200).json({
    status: 'ok',
    message: 'Simple test endpoint works!',
    timestamp: new Date().toISOString(),
  });
}

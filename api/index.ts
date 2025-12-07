/**
 * Vercel Serverless Function 默认入口
 * 仅处理 /api/health 和返回 404
 * 所有具体的 API 端点都应该有独立的 Serverless Function 文件
 */
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const url = req.url || '';
  console.log(`[Serverless] 收到请求: ${req.method} ${url}`);

  // 提取路径（去除查询参数）
  const path = url.split('?')[0];

  // 健康检查端点
  if (path.includes('/health')) {
    return res.status(200).json({
      code: 200,
      message: 'API is running',
      data: {
        status: 'ok',
        timestamp: new Date().toISOString(),
        path: path,
      },
    });
  }

  // 其他所有路由都应该有独立的 Serverless Function
  // 如果到达这里，说明路由未匹配
  return res.status(200).json({
    code: 404,
    message: 'API 端点不存在',
    data: {
      url: url,
      path: path,
      method: req.method,
      tip: '请检查 API 路径是否正确，或该端点是否已实现',
    },
  });
}

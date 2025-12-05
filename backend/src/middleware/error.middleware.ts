import { Request, Response, NextFunction } from 'express';
import { ResponseUtil } from '../utils/response';
import { logger } from '../utils/logger';

/**
 * 错误处理中间件
 */
export const errorMiddleware = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // 记录错误日志
  logger.error(`${req.method} ${req.path}`, {
    error: error.message,
    stack: error.stack,
    body: req.body,
    query: req.query,
  });

  // 返回错误响应
  ResponseUtil.internalError(res, error.message || '服务器内部错误');
};

/**
 * 404 处理中间件
 */
export const notFoundMiddleware = (req: Request, res: Response): void => {
  ResponseUtil.notFound(res, `路由不存在: ${req.method} ${req.path}`);
};

import { Request, Response, NextFunction } from 'express';
import { JWTUtil } from '../config/jwt';
import { ResponseUtil } from '../utils/response';
import { logger } from '../utils/logger';

/**
 * 认证中间件 - 验证用户 Token
 */
export const authMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      ResponseUtil.unauthorized(res, '请提供有效的 Token');
      return;
    }

    const token = authHeader.replace('Bearer ', '');

    try {
      const payload = JWTUtil.verifyToken(token);
      (req as any).user = payload;
      next();
    } catch (error) {
      ResponseUtil.unauthorized(res, 'Token 无效或已过期');
    }
  } catch (error) {
    logger.error('认证中间件错误:', error);
    ResponseUtil.internalError(res);
  }
};

/**
 * 管理员认证中间件 - 验证管理员权限
 */
export const adminAuthMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      ResponseUtil.unauthorized(res, '请提供有效的 Token');
      return;
    }

    const token = authHeader.replace('Bearer ', '');

    try {
      const payload = JWTUtil.verifyToken(token);

      // 检查是否为管理员
      if (payload.role !== 'admin') {
        ResponseUtil.forbidden(res, '需要管理员权限');
        return;
      }

      (req as any).user = payload;
      next();
    } catch (error) {
      ResponseUtil.unauthorized(res, 'Token 无效或已过期');
    }
  } catch (error) {
    logger.error('管理员认证中间件错误:', error);
    ResponseUtil.internalError(res);
  }
};

/**
 * 可选认证中间件 - Token 存在时验证，不存在也允许通过
 */
export const optionalAuthMiddleware = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.replace('Bearer ', '');
      try {
        const payload = JWTUtil.verifyToken(token);
        (req as any).user = payload;
      } catch {
        // Token 无效时不报错，继续执行
      }
    }

    next();
  } catch (error) {
    logger.error('可选认证中间件错误:', error);
    next();
  }
};

/**
 * 用户认证中间件 - 验证普通用户 Token
 */
export const userAuthMiddleware = authMiddleware;

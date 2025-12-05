import { Response } from 'express';
import { ApiResponse, ErrorCode } from '../types';

/**
 * 统一响应工具类
 */
export class ResponseUtil {
  /**
   * 成功响应
   */
  static success<T>(res: Response, data?: T, message = 'success'): Response {
    const response: ApiResponse<T> = {
      code: ErrorCode.SUCCESS,
      message,
      data,
      timestamp: Date.now(),
    };
    return res.status(200).json(response);
  }

  /**
   * 创建成功响应
   */
  static created<T>(res: Response, data?: T, message = '创建成功'): Response {
    const response: ApiResponse<T> = {
      code: ErrorCode.CREATED,
      message,
      data,
      timestamp: Date.now(),
    };
    return res.status(201).json(response);
  }

  /**
   * 错误响应
   */
  static error(
    res: Response,
    code: number,
    message: string,
    errors?: Array<{ field: string; message: string }>
  ): Response {
    const response: ApiResponse = {
      code,
      message,
      errors,
      timestamp: Date.now(),
    };

    // 根据错误码确定 HTTP 状态码
    let statusCode = 500;
    if (code >= 400 && code < 500) {
      statusCode = code;
    } else if (code === ErrorCode.UNAUTHORIZED || code === ErrorCode.TOKEN_INVALID) {
      statusCode = 401;
    } else if (code === ErrorCode.FORBIDDEN || code === ErrorCode.PERMISSION_DENIED) {
      statusCode = 403;
    } else if (
      code === ErrorCode.NOT_FOUND ||
      code === ErrorCode.PRODUCT_NOT_FOUND ||
      code === ErrorCode.ORDER_NOT_FOUND
    ) {
      statusCode = 404;
    } else if (code >= 10000) {
      statusCode = 400;
    }

    return res.status(statusCode).json(response);
  }

  /**
   * 参数错误响应
   */
  static badRequest(
    res: Response,
    message = '参数错误',
    errors?: Array<{ field: string; message: string }>
  ): Response {
    return this.error(res, ErrorCode.BAD_REQUEST, message, errors);
  }

  /**
   * 未授权响应
   */
  static unauthorized(res: Response, message = '未授权访问'): Response {
    return this.error(res, ErrorCode.UNAUTHORIZED, message);
  }

  /**
   * 禁止访问响应
   */
  static forbidden(res: Response, message = '权限不足'): Response {
    return this.error(res, ErrorCode.FORBIDDEN, message);
  }

  /**
   * 资源不存在响应
   */
  static notFound(res: Response, message = '资源不存在'): Response {
    return this.error(res, ErrorCode.NOT_FOUND, message);
  }

  /**
   * 服务器错误响应
   */
  static internalError(res: Response, message = '服务器内部错误'): Response {
    return this.error(res, ErrorCode.INTERNAL_ERROR, message);
  }
}

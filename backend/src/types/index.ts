/**
 * 通用类型定义
 */

// API 响应格式
export interface ApiResponse<T = any> {
  code: number;
  message: string;
  data?: T;
  errors?: Array<{ field: string; message: string }>;
  timestamp: number;
}

// 分页参数
export interface PaginationParams {
  page: number;
  pageSize: number;
}

// 分页响应
export interface PaginatedResponse<T> {
  items: T[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

// JWT Payload
export interface JWTPayload {
  userId: string;
  username: string;
  role?: string;
  timestamp: number;
}

// 错误代码
export enum ErrorCode {
  // 通用错误 1xxxx
  SUCCESS = 200,
  CREATED = 201,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  INTERNAL_ERROR = 500,

  // 用户错误 10xxx
  USERNAME_EXISTS = 10001,
  PHONE_EXISTS = 10002,
  VERIFICATION_CODE_ERROR = 10003,
  LOGIN_ERROR = 10004,
  TOKEN_INVALID = 10005,

  // 商品错误 20xxx
  PRODUCT_NOT_FOUND = 20001,
  STOCK_INSUFFICIENT = 20002,
  PRODUCT_OFF_SHELF = 20003,

  // 订单错误 30xxx
  ORDER_NOT_FOUND = 30001,
  ORDER_STATUS_ERROR = 30002,
  PAYMENT_ERROR = 30003,

  // 文件错误 40xxx
  FILE_TYPE_NOT_SUPPORTED = 40001,
  FILE_SIZE_EXCEEDED = 40002,

  // 权限错误 50xxx
  PERMISSION_DENIED = 50001,
}

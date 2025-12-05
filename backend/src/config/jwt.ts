import jwt from 'jsonwebtoken';
import { JWTPayload } from '../types';

/**
 * JWT 配置
 */
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key_change_in_production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

/**
 * JWT 工具类
 */
export class JWTUtil {
  /**
   * 生成 Token
   */
  static generateToken(payload: Omit<JWTPayload, 'timestamp'>): string {
    const data: JWTPayload = {
      ...payload,
      timestamp: Date.now(),
    };
    // @ts-ignore - jsonwebtoken 类型定义问题
    return jwt.sign(data, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
  }

  /**
   * 验证 Token
   */
  static verifyToken(token: string): JWTPayload {
    try {
      return jwt.verify(token, JWT_SECRET) as JWTPayload;
    } catch (error) {
      throw new Error('Token 无效或已过期');
    }
  }

  /**
   * 解码 Token (不验证)
   */
  static decodeToken(token: string): JWTPayload | null {
    try {
      return jwt.decode(token) as JWTPayload;
    } catch {
      return null;
    }
  }
}

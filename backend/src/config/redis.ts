import Redis from 'ioredis';
import { logger } from '../utils/logger';

/**
 * Redis 配置和连接
 */
const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: Number(process.env.REDIS_PORT) || 6379,
  password: process.env.REDIS_PASSWORD || undefined,
  // 限制重试次数，避免无限重试
  retryStrategy: (times: number) => {
    if (times > 3) {
      logger.warn('Redis 连接失败，已停止重试');
      return null; // 停止重试
    }
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
  // 设置连接超时
  connectTimeout: 5000,
  // 禁用离线队列，避免命令堆积
  enableOfflineQueue: false,
  // 设置为懒连接模式
  lazyConnect: true,
});

// 尝试连接Redis，但不阻塞应用启动
redis.connect().catch((error) => {
  logger.warn('Redis 未启动，缓存功能将被禁用:', error.message);
});

redis.on('connect', () => {
  logger.info('Redis 连接成功');
});

redis.on('error', (error) => {
  // 降低日志级别，避免刷屏
  logger.debug('Redis 连接错误:', error.message);
});

/**
 * Redis 缓存服务
 */
export class CacheService {
  /**
   * 设置缓存
   */
  static async set(key: string, value: any, ttl?: number): Promise<void> {
    const data = JSON.stringify(value);
    if (ttl) {
      await redis.setex(key, ttl, data);
    } else {
      await redis.set(key, data);
    }
  }

  /**
   * 获取缓存
   */
  static async get<T>(key: string): Promise<T | null> {
    const data = await redis.get(key);
    return data ? JSON.parse(data) : null;
  }

  /**
   * 删除缓存
   */
  static async del(key: string): Promise<void> {
    await redis.del(key);
  }

  /**
   * 批量删除缓存
   */
  static async delPattern(pattern: string): Promise<void> {
    const keys = await redis.keys(pattern);
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  }

  /**
   * 检查键是否存在
   */
  static async exists(key: string): Promise<boolean> {
    const result = await redis.exists(key);
    return result === 1;
  }

  /**
   * 设置过期时间
   */
  static async expire(key: string, seconds: number): Promise<void> {
    await redis.expire(key, seconds);
  }
}

export default redis;

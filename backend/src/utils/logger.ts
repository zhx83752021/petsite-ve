import winston from 'winston';
import path from 'path';

const { combine, timestamp, printf, colorize, errors } = winston.format;

/**
 * 自定义日志格式
 */
const customFormat = printf(({ level, message, timestamp, stack }) => {
  return `${timestamp} [${level}]: ${stack || message}`;
});

/**
 * 日志工具类
 */
class Logger {
  private logger: winston.Logger;

  constructor() {
    const logDir = process.env.LOG_DIR || 'logs';
    const logLevel = process.env.LOG_LEVEL || 'info';

    this.logger = winston.createLogger({
      level: logLevel,
      format: combine(errors({ stack: true }), timestamp({ format: 'YYYY-MM-DD HH:mm:ss' })),
      transports: [
        // 错误日志
        new winston.transports.File({
          filename: path.join(logDir, 'error.log'),
          level: 'error',
          format: combine(customFormat),
        }),
        // 综合日志
        new winston.transports.File({
          filename: path.join(logDir, 'combined.log'),
          format: combine(customFormat),
        }),
      ],
    });

    // 开发环境添加控制台输出
    if (process.env.NODE_ENV !== 'production') {
      this.logger.add(
        new winston.transports.Console({
          format: combine(colorize(), customFormat),
        })
      );
    }
  }

  info(message: string, meta?: any): void {
    this.logger.info(message, meta);
  }

  error(message: string, meta?: any): void {
    this.logger.error(message, meta);
  }

  warn(message: string, meta?: any): void {
    this.logger.warn(message, meta);
  }

  debug(message: string, meta?: any): void {
    this.logger.debug(message, meta);
  }
}

export const logger = new Logger();

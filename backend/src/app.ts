import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import routes from './routes';
import { errorMiddleware, notFoundMiddleware } from './middleware/error.middleware';
import { loggerMiddleware } from './middleware/logger.middleware';
import { logger } from './utils/logger';

/**
 * 创建 Express 应用
 */
const createApp = (): Application => {
  const app = express();

  // 安全中间件
  app.use(helmet());

  // CORS 配置
  app.use(
    cors({
      origin: process.env.CORS_ORIGIN || '*',
      credentials: true,
    })
  );

  // 请求解析
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // HTTP 请求日志
  if (process.env.NODE_ENV !== 'production') {
    app.use(morgan('dev'));
  }

  // 自定义日志中间件
  app.use(loggerMiddleware);

  // 限流配置
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15分钟
    max: 100, // 限制100个请求
    message: '请求过于频繁，请稍后再试',
  });
  app.use('/api/', limiter);

  // 静态文件服务
  app.use('/uploads', express.static('uploads'));

  // API 路由
  app.use('/api', routes);

  // 404 处理
  app.use(notFoundMiddleware);

  // 错误处理
  app.use(errorMiddleware);

  logger.info('Express 应用已创建');

  return app;
};

export default createApp;

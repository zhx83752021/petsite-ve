import dotenv from 'dotenv';
import { Server } from 'http';
import createApp from './app';
import { testConnection, syncDatabase } from './config/database';
import { logger } from './utils/logger';

// 加载环境变量
dotenv.config({ path: `.env.${process.env.NODE_ENV || 'development'}` });

let server: Server | null = null;

/**
 * 检测端口是否可用
 */
const isPortAvailable = (port: number): Promise<boolean> => {
  return new Promise((resolve) => {
    const testServer = require('net').createServer();

    testServer.once('error', (err: any) => {
      if (err.code === 'EADDRINUSE') {
        resolve(false);
      } else {
        resolve(false);
      }
    });

    testServer.once('listening', () => {
      testServer.close();
      resolve(true);
    });

    testServer.listen(port);
  });
};

/**
 * 查找可用端口
 */
const findAvailablePort = async (startPort: number, maxAttempts = 10): Promise<number> => {
  for (let i = 0; i < maxAttempts; i++) {
    const port = startPort + i;
    const available = await isPortAvailable(port);
    if (available) {
      return port;
    }
  }
  throw new Error(`无法在 ${startPort}-${startPort + maxAttempts - 1} 范围内找到可用端口`);
};

/**
 * 优雅关闭服务器
 */
const gracefulShutdown = (signal: string): void => {
  logger.info(`收到 ${signal} 信号，开始优雅关闭服务器...`);

  if (server) {
    server.close(() => {
      logger.info('服务器已关闭');
      process.exit(0);
    });

    // 如果10秒内未关闭，强制退出
    setTimeout(() => {
      logger.error('强制关闭服务器');
      process.exit(1);
    }, 10000);
  } else {
    process.exit(0);
  }
};

/**
 * 启动服务器
 */
const startServer = async (): Promise<void> => {
  try {
    // 测试数据库连接
    await testConnection();

    // 同步数据库模型（开发环境）
    if (process.env.NODE_ENV === 'development') {
      await syncDatabase(false);
    }

    // 创建应用
    const app = createApp();

    // 获取配置的端口
    const configPort = Number(process.env.PORT) || 3000;

    // 检查端口是否可用
    const isAvailable = await isPortAvailable(configPort);

    let port: number;
    if (!isAvailable) {
      logger.warn(`端口 ${configPort} 已被占用，正在查找可用端口...`);
      port = await findAvailablePort(configPort);
      logger.info(`使用替代端口: ${port}`);
    } else {
      port = configPort;
    }

    // 启动服务器
    server = app.listen(port, () => {
      logger.info(`服务器运行在端口 ${port}`);
      logger.info(`环境: ${process.env.NODE_ENV || 'development'}`);
      logger.info(`API 地址: http://localhost:${port}/api`);
    });

    // 处理服务器错误
    server.on('error', (error: any) => {
      if (error.code === 'EADDRINUSE') {
        logger.error(`端口 ${port} 被占用`);
        process.exit(1);
      } else {
        logger.error('服务器错误:', error);
        process.exit(1);
      }
    });

  } catch (error) {
    logger.error('服务器启动失败:', error);
    process.exit(1);
  }
};

// 启动服务器
startServer();

// 处理进程信号
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// 处理未捕获的异常
process.on('unhandledRejection', (reason: any) => {
  logger.error('未处理的 Promise 拒绝:', reason);
});

process.on('uncaughtException', (error: Error) => {
  logger.error('未捕获的异常:', error);
  process.exit(1);
});

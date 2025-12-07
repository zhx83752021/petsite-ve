/**
 * 调试端点 - 用于检查 Vercel 环境
 */
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    // 收集环境信息
    const envInfo = {
      // 环境变量检查
      hasPostgresUrl: !!process.env.POSTGRES_URL,
      hasDatabaseUrl: !!process.env.DATABASE_URL,
      hasPrismaUrl: !!process.env.PRISMA_DATABASE_URL,
      hasJwtSecret: !!process.env.JWT_SECRET,
      nodeEnv: process.env.NODE_ENV,
      isVercel: !!process.env.VERCEL,

      // Vercel 环境信息
      vercelEnv: process.env.VERCEL_ENV,
      vercelRegion: process.env.VERCEL_REGION,

      // Node 版本
      nodeVersion: process.version,

      // 时间戳
      timestamp: new Date().toISOString(),
    };

    // 尝试测试数据库连接
    let dbTestResult = 'not-tested';
    try {
      const { Client } = await import('pg');
      const dbUrl = process.env.POSTGRES_URL || process.env.DATABASE_URL;

      if (dbUrl) {
        const client = new Client({
          connectionString: dbUrl,
          ssl: {
            rejectUnauthorized: false,
          },
        });

        await client.connect();
        await client.query('SELECT 1');
        await client.end();
        dbTestResult = 'success';
      } else {
        dbTestResult = 'no-connection-string';
      }
    } catch (dbError: any) {
      dbTestResult = `error: ${dbError.message}`;
    }

    res.status(200).json({
      status: 'ok',
      environment: envInfo,
      databaseTest: dbTestResult,
      message: 'Debug information collected successfully',
    });
  } catch (error: any) {
    res.status(500).json({
      status: 'error',
      error: error.message,
      stack: error.stack,
    });
  }
}

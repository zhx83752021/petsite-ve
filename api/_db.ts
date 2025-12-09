import { Pool } from 'pg';

// 创建数据库连接池（全局复用）
let pool: Pool | null = null;

export const getPool = () => {
  if (!pool) {
    // 支持多种环境变量名称
    // 优先使用 Vercel Postgres 的环境变量
    const connectionString =
      process.env.POSTGRES_URL ||           // Vercel Postgres
      process.env.POSTGRES_PRISMA_URL ||    // Vercel Postgres (Prisma)
      process.env.DATABASE_URL;             // 通用/其他服务

    if (!connectionString) {
      throw new Error('数据库连接字符串未配置。请在 Vercel 中添加 Postgres 数据库或配置 DATABASE_URL 环境变量。');
    }

    // 移除?sslmode参数，因为我们在配置中明确指定SSL
    const cleanConnectionString = connectionString.split('?')[0];

    pool = new Pool({
      connectionString: cleanConnectionString,
      max: 2,
      idleTimeoutMillis: 1000,
      connectionTimeoutMillis: 5000,
      ssl: {
        rejectUnauthorized: false  // Vercel Postgres 和大多数云数据库需要 SSL
      }
    });
  }
  return pool;
};

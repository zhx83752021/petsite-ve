/**
 * 纯 JavaScript 测试端点 - ES 模块版本
 */
export default function handler(req, res) {
  res.status(200).json({
    status: 'ok',
    message: 'Pure JavaScript endpoint works!',
    timestamp: new Date().toISOString(),
    env: {
      hasPostgresUrl: !!process.env.POSTGRES_URL,
      hasDatabaseUrl: !!process.env.DATABASE_URL,
      nodeVersion: process.version,
    },
  });
}

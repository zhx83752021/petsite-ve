/**
 * 纯 JavaScript 测试端点
 */
module.exports = function handler(req, res) {
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
};

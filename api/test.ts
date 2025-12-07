/**
 * 简单测试端点 - 验证 Serverless Function 基础功能
 */
export default async (req: any, res: any) => {
  try {
    res.status(200).json({
      success: true,
      message: 'Serverless Function 工作正常',
      timestamp: new Date().toISOString(),
      env: {
        NODE_ENV: process.env.NODE_ENV,
        DATABASE_URL_EXISTS: !!process.env.DATABASE_URL,
        VERCEL: process.env.VERCEL,
      },
      request: {
        method: req.method,
        url: req.url,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
      stack: error.stack,
    });
  }
};

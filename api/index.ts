/**
 * Vercel Serverless Function 入口
 * 临时简化版本 - 用于诊断问题
 */
export default async (req: any, res: any) => {
  try {
    console.log('[Serverless] 收到请求:', req.method, req.url);

    // 健康检查端点
    if (req.url === '/api/health' || req.url === '/api') {
      return res.status(200).json({
        success: true,
        message: 'API 正常运行',
        timestamp: new Date().toISOString(),
      });
    }

    // 返回临时响应
    res.status(503).json({
      success: false,
      message: 'API 正在维护中',
      info: '后端功能暂时不可用，请稍后再试',
      url: req.url,
    });
  } catch (error: any) {
    console.error('[Serverless] 错误:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      stack: error.stack,
    });
  }
};

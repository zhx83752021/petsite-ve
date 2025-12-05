/**
 * Vercel Serverless Function 入口
 * 将Express应用导出为Serverless Function
 */
import { Request, Response } from 'express';
import createApp from '../src/app';

const app = createApp();

// 导出处理函数供Vercel使用
export default (req: Request, res: Response) => {
  // 将所有请求转发到Express应用
  return app(req, res);
};

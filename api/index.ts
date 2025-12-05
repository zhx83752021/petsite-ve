/**
 * Vercel Serverless Function 入口
 * 将Express应用导出为Serverless Function
 */
import type { Application } from 'express';
import createApp from '../backend/src/app';

const app: Application = createApp();

// 导出Express应用供Vercel使用
export default app;

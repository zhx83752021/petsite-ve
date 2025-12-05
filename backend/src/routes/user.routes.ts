import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

/**
 * 用户相关路由
 */

// 获取当前用户信息
router.get('/me', authMiddleware, AuthController.getCurrentUser);

// 更新用户信息
router.patch('/me', authMiddleware, AuthController.updateUserInfo);

export default router;

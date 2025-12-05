import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

/**
 * 用户认证路由
 */

// 用户注册
router.post('/register', AuthController.register);

// 用户登录
router.post('/login', AuthController.login);

// 发送验证码
router.post('/send-code', AuthController.sendCode);

// 获取当前用户信息（需要登录）
router.get('/me', authMiddleware, AuthController.getCurrentUser);

// 更新用户信息（需要登录）
router.patch('/me', authMiddleware, AuthController.updateUserInfo);

// 修改密码（需要登录）
router.post('/change-password', authMiddleware, AuthController.changePassword);

export default router;

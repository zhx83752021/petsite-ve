import { Router } from 'express';
import { AdminController } from '../controllers/admin.controller';
import { adminAuthMiddleware } from '../middleware/auth.middleware';

const router = Router();

/**
 * 管理员路由
 */

// 管理员登录（无需认证）
router.post('/login', AdminController.login);

// 以下路由需要管理员认证
router.use(adminAuthMiddleware);

// 管理员列表
router.get('/', AdminController.getList);

// 创建管理员
router.post('/', AdminController.create);

// 更新管理员
router.put('/:id', AdminController.update);

// 重置密码
router.post('/:id/reset-password', AdminController.resetPassword);

// 删除管理员
router.delete('/:id', AdminController.delete);

export default router;

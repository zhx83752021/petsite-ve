import { Router } from 'express';
import { OrderController } from '../controllers/order.controller';
import { adminAuthMiddleware } from '../middleware/auth.middleware';

const router = Router();

/**
 * 订单路由（后台管理）
 */

// 所有路由需要管理员认证
router.use(adminAuthMiddleware);

// 订单列表
router.get('/', OrderController.getList);

// 订单详情
router.get('/:id', OrderController.getDetail);

// 更新订单状态
router.patch('/:id/status', OrderController.updateStatus);

// 订单发货
router.post('/:id/ship', OrderController.ship);

// 订单统计
router.get('/statistics/overview', OrderController.getStatistics);

export default router;

import { Router } from 'express';
import { CartController } from '../controllers/cart.controller';
import { userAuthMiddleware } from '../middleware/auth.middleware';

const router = Router();

/**
 * 购物车路由
 * 所有路由需要用户认证
 */

router.use(userAuthMiddleware);

// 获取购物车列表
router.get('/', CartController.getList);

// 添加商品到购物车
router.post('/', CartController.add);

// 更新购物车商品数量
router.put('/:id', CartController.update);

// 清空购物车（必须在 /:id 之前定义）
router.delete('/clear', CartController.clear);

// 删除购物车商品
router.delete('/:id', CartController.delete);

export default router;

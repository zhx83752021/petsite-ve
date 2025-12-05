import { Router } from 'express';
import { ProductController } from '../controllers/product.controller';
import { adminAuthMiddleware } from '../middleware/auth.middleware';

const router = Router();

/**
 * 商品路由（后台管理）
 */

// 所有路由需要管理员认证
router.use(adminAuthMiddleware);

// 商品列表
router.get('/', ProductController.getList);

// 商品详情
router.get('/:id', ProductController.getDetail);

// 创建商品
router.post('/', ProductController.create);

// 更新商品
router.put('/:id', ProductController.update);

// 删除商品
router.delete('/:id', ProductController.delete);

// 更新商品状态（上架/下架）
router.patch('/:id/status', ProductController.updateStatus);

export default router;

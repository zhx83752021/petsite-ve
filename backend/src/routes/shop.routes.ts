import { Router } from 'express';
import { ShopController } from '../controllers/shop.controller';

const router = Router();

/**
 * 前台商城路由（公开访问，不需要认证）
 */

// 获取商品列表
router.get('/products', ShopController.getProductList);

// 获取商品详情
router.get('/products/:id', ShopController.getProductDetail);

export default router;

import { Router } from 'express';
import adminRoutes from './admin.routes';
import productRoutes from './product.routes';
import orderRoutes from './order.routes';
import authRoutes from './auth.routes';
import userRoutes from './user.routes';
import cartRoutes from './cart.routes';
import shopRoutes from './shop.routes';
import initRoutes from './init.routes';

const router = Router();

/**
 * API 路由汇总
 */

// 数据库初始化路由（仅在首次部署时使用）
router.use('/init', initRoutes);

// 用户认证路由
router.use('/auth', authRoutes);

// 用户路由
router.use('/users', userRoutes);

// 购物车路由
router.use('/cart', cartRoutes);

// 前台商城路由（公开访问）
router.use('/shop', shopRoutes);

// 管理员路由
router.use('/admin', adminRoutes);

// 商品路由
router.use('/admin/products', productRoutes);

// 订单路由
router.use('/admin/orders', orderRoutes);

// 健康检查
router.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
  });
});

export default router;

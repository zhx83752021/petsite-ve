import { Request, Response } from 'express';
import { CartItem, Product, ProductSku } from '../models';
import { logger } from '../utils/logger';

/**
 * 购物车控制器
 */
export class CartController {
  /**
   * 获取购物车列表
   */
  static async getList(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.id;

      if (!userId) {
        res.status(401).json({
          code: 401,
          message: '未授权',
        });
        return;
      }

      logger.info(`获取用户 ${userId} 的购物车`);

      // 获取购物车项
      const cartItems = await CartItem.findAll({
        where: { userId },
        order: [['id', 'DESC']], // 使用id排序，避免字段名问题
      });

      logger.info(`找到 ${cartItems.length} 个购物车项`);

      // 获取每个购物车项的详细信息
      const data = await Promise.all(
        cartItems.map(async (item) => {
          // 获取商品信息
          const product = await Product.findByPk(item.productId, {
            attributes: ['id', 'name', 'mainImages'],
          });

          // 获取SKU信息
          let sku = null;
          let price = 0;
          let stock = 0;
          let skuName = '';

          if (item.skuId) {
            sku = await ProductSku.findByPk(item.skuId, {
              attributes: ['id', 'specCombination', 'price', 'stock'],
            });
            if (sku) {
              price = Number(sku.price);
              stock = sku.stock;
              skuName = sku.specCombination;
            }
          }

          return {
            id: item.id,
            product_id: item.productId,
            name: product?.name || '商品',
            image: product?.mainImages?.[0] || '',
            price,
            quantity: item.quantity,
            stock,
            sku: skuName,
          };
        })
      );

      res.json({
        code: 200,
        message: '获取成功',
        data,
      });
    } catch (error: any) {
      logger.error('获取购物车列表失败:', error);
      logger.error('错误堆栈:', error.stack);
      res.status(500).json({
        code: 500,
        message: `服务器错误: ${error.message}`,
      });
    }
  }

  /**
   * 添加商品到购物车
   */
  static async add(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.id;
      const { productId, quantity = 1, skuId } = req.body;

      if (!userId) {
        res.status(401).json({
          code: 401,
          message: '未授权',
        });
        return;
      }

      if (!productId) {
        res.status(400).json({
          code: 400,
          message: '商品ID不能为空',
        });
        return;
      }

      // 检查商品SKU是否存在
      if (skuId) {
        const sku = await ProductSku.findByPk(skuId);
        if (!sku) {
          res.status(404).json({
            code: 404,
            message: '商品规格不存在',
          });
          return;
        }

        // 检查库存
        if (sku.stock < quantity) {
          res.status(400).json({
            code: 400,
            message: '库存不足',
          });
          return;
        }
      } else {
        // 如果没有指定SKU，检查商品是否存在
        const product = await Product.findByPk(productId);
        if (!product) {
          res.status(404).json({
            code: 404,
            message: '商品不存在',
          });
          return;
        }
      }

      // 检查购物车中是否已有该商品
      const existingItem = await CartItem.findOne({
        where: {
          userId,
          productId,
          skuId: skuId || null,
        },
      });

      if (existingItem) {
        // 更新数量
        const newQuantity = existingItem.quantity + quantity;

        // 再次检查库存
        if (skuId) {
          const sku = await ProductSku.findByPk(skuId);
          if (sku && sku.stock < newQuantity) {
            res.status(400).json({
              code: 400,
              message: '库存不足',
            });
            return;
          }
        }

        await existingItem.update({ quantity: newQuantity });
      } else {
        // 添加新商品
        await CartItem.create({
          userId,
          productId,
          skuId,
          quantity,
        });
      }

      res.json({
        code: 200,
        message: '添加成功',
      });
    } catch (error) {
      logger.error('添加购物车失败:', error);
      res.status(500).json({
        code: 500,
        message: '服务器错误',
      });
    }
  }

  /**
   * 更新购物车商品数量
   */
  static async update(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.id;
      const { id } = req.params;
      const { quantity } = req.body;

      if (!userId) {
        res.status(401).json({
          code: 401,
          message: '未授权',
        });
        return;
      }

      if (!quantity || quantity < 1) {
        res.status(400).json({
          code: 400,
          message: '数量必须大于0',
        });
        return;
      }

      // 检查购物车项是否存在
      const cartItem = await CartItem.findOne({
        where: { id, userId },
        include: [
          {
            model: ProductSku,
            as: 'sku',
            attributes: ['stock'],
          },
        ],
      });

      if (!cartItem) {
        res.status(404).json({
          code: 404,
          message: '购物车项不存在',
        });
        return;
      }

      // 检查库存
      if (cartItem.skuId) {
        const sku = cartItem.sku as any;
        if (sku && sku.stock < quantity) {
          res.status(400).json({
            code: 400,
            message: '库存不足',
          });
          return;
        }
      }

      // 更新数量
      await cartItem.update({ quantity });

      res.json({
        code: 200,
        message: '更新成功',
      });
    } catch (error) {
      logger.error('更新购物车失败:', error);
      res.status(500).json({
        code: 500,
        message: '服务器错误',
      });
    }
  }

  /**
   * 删除购物车商品
   */
  static async delete(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.id;
      const { id } = req.params;

      if (!userId) {
        res.status(401).json({
          code: 401,
          message: '未授权',
        });
        return;
      }

      const result = await CartItem.destroy({
        where: { id, userId },
      });

      if (result === 0) {
        res.status(404).json({
          code: 404,
          message: '购物车项不存在',
        });
        return;
      }

      res.json({
        code: 200,
        message: '删除成功',
      });
    } catch (error) {
      logger.error('删除购物车商品失败:', error);
      res.status(500).json({
        code: 500,
        message: '服务器错误',
      });
    }
  }

  /**
   * 清空购物车
   */
  static async clear(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.id;

      if (!userId) {
        res.status(401).json({
          code: 401,
          message: '未授权',
        });
        return;
      }

      await CartItem.destroy({
        where: { userId },
      });

      res.json({
        code: 200,
        message: '清空成功',
      });
    } catch (error) {
      logger.error('清空购物车失败:', error);
      res.status(500).json({
        code: 500,
        message: '服务器错误',
      });
    }
  }
}

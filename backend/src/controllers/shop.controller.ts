import { Request, Response } from 'express';
import { Op } from 'sequelize';
import { Product, ProductSku } from '../models';
import { ResponseUtil } from '../utils/response';
import { logger } from '../utils/logger';

/**
 * 前台商城控制器
 */
export class ShopController {
  /**
   * 获取商品列表（前台）
   */
  static async getProductList(req: Request, res: Response): Promise<void> {
    try {
      const { page = 1, pageSize = 20, keyword, categoryId, brandId } = req.query;
      const offset = (Number(page) - 1) * Number(pageSize);

      const where: any = { status: 1 }; // 只返回已上架的商品

      if (keyword) {
        where.name = { [Op.like]: `%${keyword}%` };
      }

      if (categoryId) {
        where.categoryId = Number(categoryId);
      }

      if (brandId) {
        where.brandId = Number(brandId);
      }

      const { count, rows } = await Product.findAndCountAll({
        where,
        attributes: ['id', 'name', 'mainImages', 'subtitle', 'sales', 'views'],
        offset,
        limit: Number(pageSize),
        order: [['id', 'DESC']], // 使用id排序，避免字段名问题
      });

      // 获取每个商品的价格信息（从SKU）
      const items = await Promise.all(
        rows.map(async (product) => {
          const skus = await ProductSku.findAll({
            where: { productId: product.id, status: 1 },
            attributes: ['price', 'stock'],
          });

          const minPrice = skus.length > 0 ? Math.min(...skus.map((s) => Number(s.price))) : 0;
          const totalStock = skus.reduce((sum, s) => sum + s.stock, 0);

          return {
            id: product.id,
            name: product.name,
            image: product.mainImages?.[0] || '',
            images: product.mainImages,
            description: product.subtitle || '',
            price: minPrice,
            sales: product.sales,
            stock: totalStock,
          };
        })
      );

      ResponseUtil.success(res, {
        items,
        pagination: {
          page: Number(page),
          pageSize: Number(pageSize),
          total: count,
          totalPages: Math.ceil(count / Number(pageSize)),
        },
      });
    } catch (error: any) {
      logger.error('获取商品列表失败:', error);
      ResponseUtil.internalError(res);
    }
  }

  /**
   * 获取商品详情（前台）
   */
  static async getProductDetail(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      // 获取商品详情
      const product = await Product.findOne({
        where: {
          id: Number(id),
          status: 1, // 只返回已上架的商品
        },
      });

      if (!product) {
        ResponseUtil.notFound(res, '商品不存在');
        return;
      }

      // 获取商品的SKU列表
      const skus = await ProductSku.findAll({
        where: {
          productId: Number(id),
          status: 1,
        },
        attributes: ['id', 'skuCode', 'specCombination', 'price', 'originalPrice', 'stock'],
      });

      // 计算最低价格
      const minPrice = skus.length > 0 ? Math.min(...skus.map((sku) => Number(sku.price))) : 0;
      const maxOriginalPrice = skus.length > 0 ? Math.max(...skus.map((sku) => Number(sku.originalPrice || 0))) : 0;
      const totalStock = skus.reduce((sum, sku) => sum + sku.stock, 0);

      // 格式化返回数据
      const result = {
        id: product.id,
        name: product.name,
        images: product.mainImages,
        description: product.subtitle || '',
        details: product.detail,
        price: minPrice,
        originalPrice: maxOriginalPrice > 0 ? maxOriginalPrice : undefined,
        stock: totalStock,
        sales: product.sales,
        rating: 4.9, // 暂时固定值，后续可以从评价系统获取
        skus: skus.map((sku) => ({
          id: sku.id,
          name: sku.specCombination,
          value: sku.specCombination,
          price: Number(sku.price),
          originalPrice: sku.originalPrice ? Number(sku.originalPrice) : undefined,
          stock: sku.stock,
        })),
      };

      ResponseUtil.success(res, result);
    } catch (error: any) {
      logger.error('获取商品详情失败:', error);
      ResponseUtil.internalError(res);
    }
  }
}

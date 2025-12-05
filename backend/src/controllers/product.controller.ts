import { Request, Response } from 'express';
import { ProductService } from '../services/product.service';
import { ResponseUtil } from '../utils/response';
import { logger } from '../utils/logger';

/**
 * 商品控制器
 */
export class ProductController {
  /**
   * 获取商品列表
   */
  static async getList(req: Request, res: Response): Promise<void> {
    try {
      const { page, pageSize, keyword, categoryId, brandId, status } = req.query;

      const result = await ProductService.getList({
        page: page ? Number(page) : 1,
        pageSize: pageSize ? Number(pageSize) : 20,
        keyword: keyword as string,
        categoryId: categoryId ? Number(categoryId) : undefined,
        brandId: brandId ? Number(brandId) : undefined,
        status: status ? Number(status) : undefined,
      });

      ResponseUtil.success(res, result);
    } catch (error: any) {
      logger.error('获取商品列表失败:', error);
      ResponseUtil.internalError(res);
    }
  }

  /**
   * 获取商品详情
   */
  static async getDetail(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const product = await ProductService.getDetail(Number(id));

      ResponseUtil.success(res, product);
    } catch (error: any) {
      logger.error('获取商品详情失败:', error);
      ResponseUtil.notFound(res, error.message);
    }
  }

  /**
   * 创建商品
   */
  static async create(req: Request, res: Response): Promise<void> {
    try {
      const data = req.body;

      const product = await ProductService.create(data);

      ResponseUtil.created(res, product);
    } catch (error: any) {
      logger.error('创建商品失败:', error);
      ResponseUtil.badRequest(res, error.message);
    }
  }

  /**
   * 更新商品
   */
  static async update(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const data = req.body;

      const product = await ProductService.update(Number(id), data);

      ResponseUtil.success(res, product, '更新成功');
    } catch (error: any) {
      logger.error('更新商品失败:', error);
      ResponseUtil.badRequest(res, error.message);
    }
  }

  /**
   * 删除商品
   */
  static async delete(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      await ProductService.delete(Number(id));

      ResponseUtil.success(res, null, '删除成功');
    } catch (error: any) {
      logger.error('删除商品失败:', error);
      ResponseUtil.badRequest(res, error.message);
    }
  }

  /**
   * 上架/下架商品
   */
  static async updateStatus(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { status } = req.body;

      await ProductService.updateStatus(Number(id), status);

      ResponseUtil.success(res, null, '操作成功');
    } catch (error: any) {
      logger.error('更新商品状态失败:', error);
      ResponseUtil.badRequest(res, error.message);
    }
  }
}

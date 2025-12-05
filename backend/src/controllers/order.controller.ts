import { Request, Response } from 'express';
import { OrderService } from '../services/order.service';
import { ResponseUtil } from '../utils/response';
import { logger } from '../utils/logger';

/**
 * 订单控制器
 */
export class OrderController {
  /**
   * 获取订单列表
   */
  static async getList(req: Request, res: Response): Promise<void> {
    try {
      const { page, pageSize, keyword, orderStatus, payStatus, startDate, endDate } = req.query;

      const result = await OrderService.getList({
        page: page ? Number(page) : 1,
        pageSize: pageSize ? Number(pageSize) : 20,
        keyword: keyword as string,
        orderStatus: orderStatus ? Number(orderStatus) : undefined,
        payStatus: payStatus ? Number(payStatus) : undefined,
        startDate: startDate as string,
        endDate: endDate as string,
      });

      ResponseUtil.success(res, result);
    } catch (error: any) {
      logger.error('获取订单列表失败:', error);
      ResponseUtil.internalError(res);
    }
  }

  /**
   * 获取订单详情
   */
  static async getDetail(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const order = await OrderService.getDetail(Number(id));

      ResponseUtil.success(res, order);
    } catch (error: any) {
      logger.error('获取订单详情失败:', error);
      ResponseUtil.notFound(res, error.message);
    }
  }

  /**
   * 更新订单状态
   */
  static async updateStatus(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { orderStatus } = req.body;

      const order = await OrderService.updateStatus(Number(id), orderStatus);

      ResponseUtil.success(res, order, '操作成功');
    } catch (error: any) {
      logger.error('更新订单状态失败:', error);
      ResponseUtil.badRequest(res, error.message);
    }
  }

  /**
   * 订单发货
   */
  static async ship(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const data = req.body;

      const order = await OrderService.ship(Number(id), data);

      ResponseUtil.success(res, order, '发货成功');
    } catch (error: any) {
      logger.error('订单发货失败:', error);
      ResponseUtil.badRequest(res, error.message);
    }
  }

  /**
   * 获取订单统计
   */
  static async getStatistics(req: Request, res: Response): Promise<void> {
    try {
      const { startDate, endDate } = req.query;

      const statistics = await OrderService.getStatistics({
        startDate: startDate as string,
        endDate: endDate as string,
      });

      ResponseUtil.success(res, statistics);
    } catch (error: any) {
      logger.error('获取订单统计失败:', error);
      ResponseUtil.internalError(res);
    }
  }
}

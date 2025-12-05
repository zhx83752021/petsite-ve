import { Op } from 'sequelize';
import { Order, User } from '../models';
import { PaginationParams, PaginatedResponse } from '../types';

/**
 * 订单服务层
 */
export class OrderService {
  /**
   * 获取订单列表
   */
  static async getList(
    params: PaginationParams & {
      keyword?: string;
      orderStatus?: number;
      payStatus?: number;
      startDate?: string;
      endDate?: string;
    }
  ): Promise<PaginatedResponse<any>> {
    const { page = 1, pageSize = 20, keyword, orderStatus, payStatus, startDate, endDate } =
      params;
    const offset = (page - 1) * pageSize;

    const where: any = {};

    if (keyword) {
      where.orderNo = { [Op.like]: `%${keyword}%` };
    }

    if (orderStatus !== undefined) {
      where.orderStatus = orderStatus;
    }

    if (payStatus !== undefined) {
      where.payStatus = payStatus;
    }

    if (startDate && endDate) {
      where.createdAt = {
        [Op.between]: [new Date(startDate), new Date(endDate)],
      };
    }

    const { count, rows } = await Order.findAndCountAll({
      where,
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'nickname', 'phone', 'avatar'],
        },
      ],
      offset,
      limit: pageSize,
      order: [['createdAt', 'DESC']],
    });

    return {
      items: rows.map((order) => order.toJSON()),
      pagination: {
        page,
        pageSize,
        total: count,
        totalPages: Math.ceil(count / pageSize),
      },
    };
  }

  /**
   * 获取订单详情
   */
  static async getDetail(id: number): Promise<any> {
    const order = await Order.findByPk(id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'nickname', 'phone', 'avatar'],
        },
      ],
    });

    if (!order) {
      throw new Error('订单不存在');
    }

    return order.toJSON();
  }

  /**
   * 更新订单状态
   */
  static async updateStatus(id: number, orderStatus: number): Promise<any> {
    const order = await Order.findByPk(id);

    if (!order) {
      throw new Error('订单不存在');
    }

    await order.update({ orderStatus });

    return this.getDetail(id);
  }

  /**
   * 订单发货
   */
  static async ship(
    id: number,
    data: {
      expressCompany: string;
      trackingNumber: string;
      remark?: string;
    }
  ): Promise<any> {
    const order = await Order.findByPk(id);

    if (!order) {
      throw new Error('订单不存在');
    }

    if (order.orderStatus !== 2) {
      throw new Error('订单状态不允许发货');
    }

    // 更新订单状态为已发货
    await order.update({
      orderStatus: 3,
      remark: data.remark,
    });

    // 这里应该创建物流记录，为了简化先省略

    return this.getDetail(id);
  }

  /**
   * 获取订单统计
   */
  static async getStatistics(params: {
    startDate?: string;
    endDate?: string;
  }): Promise<any> {
    const where: any = {};

    if (params.startDate && params.endDate) {
      where.createdAt = {
        [Op.between]: [new Date(params.startDate), new Date(params.endDate)],
      };
    }

    // 统计各状态订单数量
    const statusCounts = await Order.findAll({
      where,
      attributes: [
        'orderStatus',
        [Order.sequelize!.fn('COUNT', '*'), 'count'],
        [Order.sequelize!.fn('SUM', Order.sequelize!.col('payAmount')), 'totalAmount'],
      ],
      group: ['orderStatus'],
    });

    return statusCounts;
  }
}

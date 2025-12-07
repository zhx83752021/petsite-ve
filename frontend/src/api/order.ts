/**
 * 订单 API
 */
import request from './request'

/**
 * 创建订单参数
 */
export interface CreateOrderParams {
  items: Array<{
    skuId: number
    quantity: number
  }>
  address: {
    name: string
    phone: string
    province: string
    city: string
    district: string
    detail: string
  }
}

/**
 * 订单列表查询参数
 */
export interface OrderListParams {
  page?: number
  pageSize?: number
  status?: string
}

/**
 * 订单信息
 */
export interface OrderInfo {
  id: number
  orderNo: string
  totalAmount: number
  status: string
  receiverName: string
  receiverPhone: string
  receiverAddress: string
  remark?: string
  createdAt: string
  paidAt?: string
  shippedAt?: string
  completedAt?: string
  cancelledAt?: string
}

/**
 * 订单 API
 */
export const orderApi = {
  /**
   * 创建订单
   */
  create(data: CreateOrderParams) {
    return request.post('/orders/create', data)
  },

  /**
   * 获取我的订单列表
   */
  getMyOrders(params: OrderListParams) {
    return request.get('/user/orders', { params })
  },

  /**
   * 获取订单详情
   */
  getDetail(id: number) {
    return request.get<OrderInfo>(`/user/orders/${id}`)
  },

  /**
   * 取消订单
   */
  cancel(id: number) {
    return request.put(`/user/orders/${id}`, { action: 'cancel' })
  },
}

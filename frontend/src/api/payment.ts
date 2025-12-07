/**
 * 支付 API
 */
import request from './request'

/**
 * 创建支付参数
 */
export interface CreatePaymentParams {
  orderId: number
  paymentMethod?: 'alipay' | 'wechat'
}

/**
 * 支付信息
 */
export interface PaymentInfo {
  paymentNo: string
  paymentMethod: string
  amount: number
  paymentUrl: string
  qrCode: string
  expireTime: string
}

/**
 * 支付 API
 */
export const paymentApi = {
  /**
   * 创建支付订单
   */
  create(data: CreatePaymentParams) {
    return request.post<PaymentInfo>('/payment/create', data)
  },

  /**
   * 支付回调（仅用于测试）
   */
  callback(data: any) {
    return request.post('/payment/callback', data)
  },
}

import request from './request'

/**
 * 商品 API（前台）
 */
export const productApi = {
  /**
   * 获取商品列表
   */
  getList(params?: {
    page?: number
    pageSize?: number
    keyword?: string
    categoryId?: number
    brandId?: number
  }) {
    return request({
      url: '/shop/products',
      method: 'get',
      params,
    })
  },

  /**
   * 获取商品详情
   */
  getDetail(id: string | number) {
    return request({
      url: `/api/shop/products/${id}`,
      method: 'get',
    })
  },
}

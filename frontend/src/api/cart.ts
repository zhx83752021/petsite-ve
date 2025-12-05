import request from './request'

/**
 * 购物车 API
 */
export const cartApi = {
  /**
   * 获取购物车列表
   */
  getList() {
    return request({
      url: '/cart',
      method: 'get',
    })
  },

  /**
   * 添加商品到购物车
   */
  add(data: { productId: string | number; quantity?: number; skuId?: string | number }) {
    return request({
      url: '/cart',
      method: 'post',
      data,
    })
  },

  /**
   * 更新购物车商品数量
   */
  update(id: string | number, data: { quantity: number }) {
    return request({
      url: `/cart/${id}`,
      method: 'put',
      data,
    })
  },

  /**
   * 删除购物车商品
   */
  delete(id: string | number) {
    return request({
      url: `/cart/${id}`,
      method: 'delete',
    })
  },

  /**
   * 清空购物车
   */
  clear() {
    return request({
      url: '/cart',
      method: 'delete',
    })
  },
}

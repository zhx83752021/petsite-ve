/**
 * 分类 API
 */
import request from './request'

/**
 * 分类信息
 */
export interface CategoryInfo {
  id: number
  name: string
  parentId?: number
  icon?: string
  sort: number
  children?: CategoryInfo[]
}

/**
 * 分类 API
 */
export const categoryApi = {
  /**
   * 获取分类列表（前台）
   */
  getList() {
    return request.get<{ list: CategoryInfo[]; total: number }>('/shop/categories')
  },
}

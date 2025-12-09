import adminRequest from './adminRequest'

/**
 * 管理员登录请求参数
 */
export interface AdminLoginParams {
  username: string
  password: string
}

/**
 * 管理员登录响应
 */
export interface AdminLoginResponse {
  token: string
  admin: {
    id: number
    username: string
    realName: string
    email?: string
    phone?: string
    avatar?: string
    status: number
  }
}

/**
 * 管理员信息
 */
export interface AdminInfo {
  id: number
  username: string
  realName: string
  email?: string
  phone?: string
  avatar?: string
  status: number
  lastLoginAt?: string
  createdAt: string
  updatedAt: string
}

/**
 * 管理员列表查询参数
 */
export interface AdminListParams {
  page?: number
  pageSize?: number
  keyword?: string
  status?: number
}

/**
 * 管理员列表响应
 */
export interface AdminListResponse {
  list: AdminInfo[]
  total: number
  page: number
  pageSize: number
}

/**
 * 创建管理员参数
 */
export interface CreateAdminParams {
  username: string
  password: string
  realName: string
  email?: string
  phone?: string
  status?: number
}

/**
 * 更新管理员参数
 */
export interface UpdateAdminParams {
  realName?: string
  email?: string
  phone?: string
  avatar?: string
  status?: number
}

/**
 * 管理员API
 */
export const adminApi = {
  /**
   * 管理员登录
   */
  login(data: AdminLoginParams) {
    return adminRequest.post<AdminLoginResponse>('/admin/login', data)
  },

  /**
   * 获取管理员列表
   */
  getList(params: AdminListParams) {
    return adminRequest.get<AdminListResponse>('/admin', { params })
  },

  /**
   * 创建管理员
   */
  create(data: CreateAdminParams) {
    return adminRequest.post<AdminInfo>('/admin', data)
  },

  /**
   * 更新管理员
   */
  update(id: number, data: UpdateAdminParams) {
    return adminRequest.put<AdminInfo>(`/admin/${id}`, data)
  },

  /**
   * 重置密码
   */
  resetPassword(id: number, password: string) {
    return adminRequest.post(`/admin/${id}/reset-password`, { password })
  },

  /**
   * 删除管理员
   */
  delete(id: number) {
    return adminRequest.delete(`/admin/${id}`)
  },

  // ==================== 商品管理 ====================
  /**
   * 获取商品列表（管理后台）
   */
  getProducts(params: {
    page?: number
    pageSize?: number
    keyword?: string
    categoryId?: number
    status?: number
  }) {
    return adminRequest.get('/admin/products', { params })
  },

  /**
   * 获取商品详情（管理后台）
   */
  getProduct(id: number) {
    return adminRequest.get(`/admin/products/${id}`)
  },

  /**
   * 创建商品
   */
  createProduct(data: any) {
    return adminRequest.post('/admin/products', data)
  },

  /**
   * 更新商品
   */
  updateProduct(id: number, data: any) {
    return adminRequest.put(`/admin/products/${id}`, data)
  },

  /**
   * 删除商品
   */
  deleteProduct(id: number) {
    return adminRequest.delete(`/admin/products/${id}`)
  },

  // ==================== 分类管理 ====================
  /**
   * 获取分类列表（管理后台）
   */
  getCategories(params?: { includeDisabled?: boolean }) {
    return adminRequest.get('/admin/categories', { params })
  },

  /**
   * 获取分类详情
   */
  getCategory(id: number) {
    return adminRequest.get(`/admin/categories/${id}`)
  },

  /**
   * 创建分类
   */
  createCategory(data: {
    name: string
    parentId?: number
    icon?: string
    sort?: number
    status?: number
  }) {
    return adminRequest.post('/admin/categories', data)
  },

  /**
   * 更新分类
   */
  updateCategory(id: number, data: any) {
    return adminRequest.put(`/admin/categories/${id}`, data)
  },

  /**
   * 删除分类
   */
  deleteCategory(id: number) {
    return adminRequest.delete(`/admin/categories/${id}`)
  },

  // ==================== 订单管理 ====================
  /**
   * 获取订单列表（管理后台）
   */
  getOrders(params: {
    page?: number
    pageSize?: number
    orderNo?: string
    status?: string
    startDate?: string
    endDate?: string
  }) {
    return adminRequest.get('/admin/orders', { params })
  },

  /**
   * 获取订单详情（管理后台）
   */
  getOrder(id: number) {
    return adminRequest.get(`/admin/orders/${id}`)
  },

  /**
   * 更新订单状态
   */
  updateOrderStatus(id: number, data: { status: string; remark?: string }) {
    return adminRequest.put(`/admin/orders/${id}`, data)
  },

  // ==================== 数据导出 ====================
  /**
   * 导出订单数据
   */
  exportOrders(params?: {
    startDate?: string
    endDate?: string
    status?: string
  }) {
    return adminRequest.get('/admin/export/orders', { params, responseType: 'blob' })
  },

  /**
   * 导出商品数据
   */
  exportProducts(params?: { categoryId?: number; status?: number }) {
    return adminRequest.get('/admin/export/products', { params, responseType: 'blob' })
  },
}

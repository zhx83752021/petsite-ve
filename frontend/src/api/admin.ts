import request from './request'

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
    return request.post<AdminLoginResponse>('/admin/login', data)
  },

  /**
   * 获取管理员列表
   */
  getList(params: AdminListParams) {
    return request.get<AdminListResponse>('/admin', { params })
  },

  /**
   * 创建管理员
   */
  create(data: CreateAdminParams) {
    return request.post<AdminInfo>('/admin', data)
  },

  /**
   * 更新管理员
   */
  update(id: number, data: UpdateAdminParams) {
    return request.put<AdminInfo>(`/admin/${id}`, data)
  },

  /**
   * 重置密码
   */
  resetPassword(id: number, password: string) {
    return request.post(`/admin/${id}/reset-password`, { password })
  },

  /**
   * 删除管理员
   */
  delete(id: number) {
    return request.delete(`/admin/${id}`)
  },
}

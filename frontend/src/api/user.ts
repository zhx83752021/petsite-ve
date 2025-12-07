/**
 * 用户 API
 */
import request from './request'

/**
 * 用户信息
 */
export interface UserInfo {
  id: number
  username: string
  email?: string
  phone?: string
  avatar?: string
  role: string
  status: string
  createdAt: string
}

/**
 * 更新用户信息参数
 */
export interface UpdateProfileParams {
  email?: string
  phone?: string
  avatar?: string
  oldPassword?: string
  newPassword?: string
}

/**
 * 地址信息
 */
export interface AddressInfo {
  id: number
  name: string
  phone: string
  province: string
  city: string
  district: string
  detail: string
  postalCode?: string
  isDefault: boolean
  createdAt: string
}

/**
 * 添加/更新地址参数
 */
export interface AddressParams {
  id?: number
  name: string
  phone: string
  province: string
  city: string
  district: string
  detail: string
  postalCode?: string
  isDefault?: boolean
}

/**
 * 用户 API
 */
export const userApi = {
  /**
   * 获取用户信息
   */
  getProfile() {
    return request.get<UserInfo>('/user/profile')
  },

  /**
   * 更新用户信息
   */
  updateProfile(data: UpdateProfileParams) {
    return request.put('/user/profile', data)
  },

  /**
   * 获取地址列表
   */
  getAddresses() {
    return request.get<AddressInfo[]>('/user/addresses')
  },

  /**
   * 添加地址
   */
  addAddress(data: AddressParams) {
    return request.post('/user/addresses', data)
  },

  /**
   * 更新地址
   */
  updateAddress(data: AddressParams) {
    return request.put('/user/addresses', data)
  },

  /**
   * 删除地址
   */
  deleteAddress(id: number) {
    return request.delete(`/user/addresses?id=${id}`)
  },
}

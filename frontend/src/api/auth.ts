import request from './request'

export const authApi = {
  // 用户登录
  login(data: { username: string; password: string }) {
    return request({
      url: '/auth/login',
      method: 'post',
      data,
    })
  },

  // 用户注册
  register(data: { username: string; password: string; phone: string; code: string }) {
    return request({
      url: '/auth/register',
      method: 'post',
      data,
    })
  },

  // 获取用户信息
  getUserInfo() {
    return request({
      url: '/users/me',
      method: 'get',
    })
  },

  // 更新用户信息
  updateUserInfo(data: any) {
    return request({
      url: '/users/me',
      method: 'patch',
      data,
    })
  },

  // 发送验证码
  sendCode(phone: string) {
    return request({
      url: '/auth/send-code',
      method: 'post',
      data: { phone },
    })
  },
}

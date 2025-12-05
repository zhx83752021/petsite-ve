import { defineStore } from 'pinia'
import { ref } from 'vue'
import { authApi } from '@/api/auth'

interface UserInfo {
  id: string
  username: string
  nickname: string
  avatar: string
  phone?: string
  email?: string
}

export const useUserStore = defineStore('user', () => {
  const token = ref<string>(localStorage.getItem('token') || '')
  const userInfo = ref<UserInfo | null>(null)
  const isLogin = ref<boolean>(!!token.value)

  // 初始化应用
  const initApp = async () => {
    if (token.value) {
      try {
        await getUserInfo()
      } catch (error) {
        console.error('获取用户信息失败:', error)
        logout()
      }
    }
  }

  // 登录
  const login = async (username: string, password: string) => {
    try {
      const res = await authApi.login({ username, password })
      token.value = res.data.token
      userInfo.value = res.data
      isLogin.value = true
      localStorage.setItem('token', res.data.token)
      return res
    } catch (error) {
      throw error
    }
  }

  // 注册
  const register = async (data: any) => {
    try {
      const res = await authApi.register(data)
      token.value = res.data.token
      userInfo.value = res.data
      isLogin.value = true
      localStorage.setItem('token', res.data.token)
      return res
    } catch (error) {
      throw error
    }
  }

  // 获取用户信息
  const getUserInfo = async () => {
    try {
      const res = await authApi.getUserInfo()
      userInfo.value = res.data
      return res
    } catch (error) {
      throw error
    }
  }

  // 登出
  const logout = () => {
    token.value = ''
    userInfo.value = null
    isLogin.value = false
    localStorage.removeItem('token')
  }

  // 更新用户信息
  const updateUserInfo = async (data: Partial<UserInfo>) => {
    try {
      const res = await authApi.updateUserInfo(data)
      userInfo.value = { ...userInfo.value, ...res.data }
      return res
    } catch (error) {
      throw error
    }
  }

  return {
    token,
    userInfo,
    isLogin,
    initApp,
    login,
    register,
    getUserInfo,
    logout,
    updateUserInfo,
  }
})

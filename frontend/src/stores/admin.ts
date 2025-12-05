import { defineStore } from 'pinia'
import { adminApi, type AdminLoginResponse } from '@/api/admin'

interface AdminState {
  token: string
  adminInfo: AdminLoginResponse['admin'] | null
}

/**
 * 管理员Store
 */
export const useAdminStore = defineStore('admin', {
  state: (): AdminState => ({
    token: localStorage.getItem('admin_token') || '',
    adminInfo: localStorage.getItem('admin_info')
      ? JSON.parse(localStorage.getItem('admin_info')!)
      : null,
  }),

  getters: {
    /**
     * 是否已登录
     */
    isLoggedIn: (state) => !!state.token,

    /**
     * 管理员名称
     */
    adminName: (state) => state.adminInfo?.realName || state.adminInfo?.username || '',
  },

  actions: {
    /**
     * 登录
     */
    async login(username: string, password: string) {
      try {
        const res = await adminApi.login({ username, password })
        this.token = res.data.token
        this.adminInfo = res.data.admin

        // 保存到本地存储
        localStorage.setItem('admin_token', this.token)
        localStorage.setItem('admin_info', JSON.stringify(this.adminInfo))

        return res
      } catch (error) {
        throw error
      }
    },

    /**
     * 退出登录
     */
    logout() {
      this.token = ''
      this.adminInfo = null
      localStorage.removeItem('admin_token')
      localStorage.removeItem('admin_info')
    },

    /**
     * 更新管理员信息
     */
    updateAdminInfo(info: Partial<AdminLoginResponse['admin']>) {
      if (this.adminInfo) {
        this.adminInfo = { ...this.adminInfo, ...info }
        localStorage.setItem('admin_info', JSON.stringify(this.adminInfo))
      }
    },
  },
})

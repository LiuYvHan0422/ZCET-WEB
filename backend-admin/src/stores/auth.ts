import { defineStore } from 'pinia'
import { api } from '@/utils/request'

interface User {
  id: number
  username: string
  nickname?: string
  avatar?: string
  role: string
}

interface AuthState {
  token: string | null
  user: User | null
  isLoggedIn: boolean
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    token: localStorage.getItem('admin_token') || null,
    user: null,
    isLoggedIn: !!localStorage.getItem('admin_token')
  }),

  getters: {
    getUser: (state) => state.user,
    getToken: (state) => state.token
  },

  actions: {
    async login(username: string, password: string) {
      try {
        const response = await api.post<{
          code: number
          data: {
            token: string
            user: User
          }
          message: string
        }>('/auth/login', {
          username,
          password
        })

        if (response.code === 200 && response.data) {
          const { token, user } = response.data
          
          this.token = token
          this.user = user
          this.isLoggedIn = true
          
          localStorage.setItem('admin_token', token)
          localStorage.setItem('admin_user', JSON.stringify(user))
          
          return { success: true }
        } else {
          return { success: false, message: response.message || '登录失败' }
        }
      } catch (error: any) {
        return {
          success: false,
          message: error.response?.data?.message || '登录失败，请检查网络'
        }
      }
    },

    async logout() {
      // JWT 退出只需要清除本地 token，不需要调用后端接口
      this.token = null
      this.user = null
      this.isLoggedIn = false
      
      localStorage.removeItem('admin_token')
      localStorage.removeItem('admin_user')
    },

    async getProfile() {
      try {
        const response = await api.get<{
          code: number
          data: User
        }>('/auth/profile')

        if (response.code === 200 && response.data) {
          this.user = response.data
          return { success: true, data: response.data }
        }
        return { success: false }
      } catch (error) {
        return { success: false }
      }
    },

    initAuth() {
      const token = localStorage.getItem('admin_token')
      const userStr = localStorage.getItem('admin_user')
      
      if (token && userStr) {
        this.token = token
        this.user = JSON.parse(userStr)
        this.isLoggedIn = true
      }
    }
  }
})

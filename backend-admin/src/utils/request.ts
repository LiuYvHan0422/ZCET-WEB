import axios, { AxiosInstance, AxiosRequestConfig } from 'axios'

// API 配置 - 开发环境使用代理，生产环境需要配置实际地址
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'

// 创建 Axios 实例
const request: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器
request.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('admin_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 响应拦截器
request.interceptors.response.use(
  (response) => {
    return response.data
  },
  (error) => {
    if (error.response) {
      const { status, data } = error.response

      switch (status) {
        case 401:
          // token 过期或无效，跳转登录
          localStorage.removeItem('admin_token')
          localStorage.removeItem('admin_user')
          window.location.href = '/login'
          break
        case 403:
          alert('没有权限访问')
          break
        case 404:
          alert('请求的资源不存在')
          break
        case 500:
          // 服务器错误，只在控制台输出，不弹窗打扰用户
          console.error('服务器错误:', data?.message || error.message)
          break
        default:
          console.error('请求失败:', data?.message || error.message)
      }
    } else if (error.request) {
      console.error('网络连接失败:', error.message)
    }
    return Promise.reject(error)
  }
)

// 封装请求方法
export const api = {
  get: <T>(url: string, params?: Record<string, any>): Promise<T> => {
    return request.get(url, { params })
  },
  
  post: <T>(url: string, data?: any): Promise<T> => {
    return request.post(url, data)
  },
  
  put: <T>(url: string, data?: any): Promise<T> => {
    return request.put(url, data)
  },
  
  patch: <T>(url: string, data?: any): Promise<T> => {
    return request.patch(url, data)
  },
  
  delete: <T>(url: string): Promise<T> => {
    return request.delete(url)
  },
  
  upload: <T>(url: string, formData: FormData): Promise<T> => {
    return request.post(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  }
}

export default request

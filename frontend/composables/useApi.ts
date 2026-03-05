// API 基础配置 - 在函数内部获取 config
const getApiBase = () => {
  const config = useRuntimeConfig()
  return config.public.apiBase
}

// 通用请求方法
async function request<T>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  const API_BASE = getApiBase()
  const fullUrl = `${API_BASE}${url}`
  
  const defaultHeaders: HeadersInit = {
    'Content-Type': 'application/json',
  }
  
  const response = await fetch(fullUrl, {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  })
  
  if (!response.ok) {
    let errorMessage = `HTTP error! status: ${response.status}`
    try {
      const errorBody = await response.json()
      if (Array.isArray(errorBody?.message) && errorBody.message.length > 0) {
        errorMessage = String(errorBody.message[0])
      } else if (typeof errorBody?.message === 'string' && errorBody.message.trim()) {
        errorMessage = errorBody.message
      }
    } catch {
      // ignore parse errors and keep fallback error message
    }
    throw new Error(errorMessage)
  }
  
  return response.json()
}

// GET 请求
export const apiGet = <T>(url: string, params?: Record<string, any>): Promise<T> => {
  const queryString = params ? '?' + new URLSearchParams(params).toString() : ''
  return request<T>(url + queryString, { method: 'GET' })
}

// POST 请求
export const apiPost = <T>(url: string, data: any): Promise<T> => {
  return request<T>(url, {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

// PUT 请求
export const apiPut = <T>(url: string, data: any): Promise<T> => {
  return request<T>(url, {
    method: 'PUT',
    body: JSON.stringify(data),
  })
}

// DELETE 请求
export const apiDelete = <T>(url: string): Promise<T> => {
  return request<T>(url, { method: 'DELETE' })
}

// 日期格式化
export function formatDate(date: Date | string, format: string = 'YYYY-MM-DD'): string {
  const d = new Date(date)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const hours = String(d.getHours()).padStart(2, '0')
  const minutes = String(d.getMinutes()).padStart(2, '0')
  const seconds = String(d.getSeconds()).padStart(2, '0')
  
  return format
    .replace('YYYY', String(year))
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hours)
    .replace('mm', minutes)
    .replace('ss', seconds)
}

// 日期时间格式化
export function formatDateTime(date: Date | string): string {
  return formatDate(date, 'YYYY-MM-DD HH:mm:ss')
}

// 格式化金额
export function formatPrice(price: number): string {
  return '¥' + price.toLocaleString('zh-CN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })
}

// 格式化文件大小
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// 生成随机ID
export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9)
}

// 防抖函数
export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timer: ReturnType<typeof setTimeout> | null = null
  
  return function (this: any, ...args: Parameters<T>) {
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => {
      fn.apply(this, args)
    }, delay)
  }
}

// 节流函数
export function throttle<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let lastTime = 0
  
  return function (this: any, ...args: Parameters<T>) {
    const now = Date.now()
    if (now - lastTime >= delay) {
      lastTime = now
      fn.apply(this, args)
    }
  }
}

// 对象深拷贝
export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') return obj
  
  const clone = Array.isArray(obj) ? [] : {}
  
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const value = obj[key]
      clone[key] = typeof value === 'object' ? deepClone(value) : value
    }
  }
  
  return clone as T
}

// URL 参数拼接
export function buildQueryString(params: Record<string, any>): string {
  const query = new URLSearchParams()
  
  Object.keys(params).forEach(key => {
    const value = params[key]
    if (value !== null && value !== undefined && value !== '') {
      query.append(key, String(value))
    }
  })
  
  return query.toString() ? '?' + query.toString() : ''
}

// 状态文本映射
export const statusMap: Record<string, { text: string; type: string }> = {
  active: { text: '已上架', type: 'active' },
  inactive: { text: '已下架', type: 'inactive' },
  published: { text: '已发布', type: 'published' },
  draft: { text: '草稿', type: 'draft' },
  archived: { text: '已归档', type: 'archived' },
  pending: { text: '待处理', type: 'pending' },
  replied: { text: '已回复', type: 'replied' },
  closed: { text: '已关闭', type: 'closed' }
}

// 获取状态文本
export function getStatusText(status: string): string {
  return statusMap[status]?.text || status
}

// 获取状态类型
export function getStatusType(status: string): string {
  return statusMap[status]?.type || 'default'
}

// 验证手机号
export function isValidPhone(phone: string): boolean {
  return /^1[3-9]\d{9}$/.test(phone)
}

// 验证邮箱
export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

// 去除 HTML 标签
export function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '')
}

// 截取文本（带省略号）
export function truncate(text: string, length: number): string {
  if (text.length <= length) return text
  return text.slice(0, length) + '...'
}

// SEO 设置类型定义
export interface SeoSettings {
  siteTitle: string
  siteDescription: string
  keywords: string
}

// 默认SEO设置
const defaultSeo: SeoSettings = {
  siteTitle: '精品独立站',
  siteDescription: '专业品质，值得信赖。我们提供优质的产品和服务，致力于为客户创造最大价值',
  keywords: ''
}

// 全局状态
let seoCache: SeoSettings | null = null
let isFetching = false

// 获取SEO设置的Composable
export const useSeo = () => {
  const seo = useState<SeoSettings>('seo-settings', () => defaultSeo)
  const loading = useState<boolean>('seo-loading', () => false)
  const error = useState<string | null>('seo-error', () => null)

  // 从后端获取SEO设置
  const fetchSeo = async () => {
    // 如果已经有缓存，直接返回
    if (seoCache) {
      seo.value = seoCache
      return seoCache
    }

    // 防止重复请求
    if (isFetching) {
      return seo.value
    }

    isFetching = true
    loading.value = true
    error.value = null

    try {
      const config = useRuntimeConfig()
      const API_BASE = config.public.apiBase
      const response = await fetch(`${API_BASE}/settings/seo`)
      
      if (response.ok) {
        const res = await response.json()
        
        // 后端返回格式: { code: 200, data: {...} }
        const data = res.data
        
        // 合并后端返回的数据和默认值
        const fetchedSeo: SeoSettings = {
          siteTitle: data?.siteTitle || defaultSeo.siteTitle,
          siteDescription: data?.siteDescription || defaultSeo.siteDescription,
          keywords: data?.keywords || defaultSeo.keywords
        }
        
        // 更新缓存和状态
        seoCache = fetchedSeo
        seo.value = fetchedSeo
        
        return fetchedSeo
      } else {
        throw new Error('Failed to fetch SEO settings')
      }
    } catch (err) {
      console.error('获取SEO设置失败:', err)
      error.value = err instanceof Error ? err.message : '获取SEO设置失败'
      // 使用默认设置
      seo.value = defaultSeo
      return defaultSeo
    } finally {
      loading.value = false
      isFetching = false
    }
  }

  // 获取网站标题（用于Logo显示）
  const getSiteTitle = () => {
    return seo.value.siteTitle || '精品独立站'
  }

  // 获取完整标题（用于页面title）
  const getFullTitle = (suffix: string = ' - 您的优质选择') => {
    return `${seo.value.siteTitle}${suffix}`
  }

  // 获取网站描述
  const getSiteDescription = () => {
    return seo.value.siteDescription || defaultSeo.siteDescription
  }

  // 获取关键词
  const getKeywords = () => {
    return seo.value.keywords || defaultSeo.keywords
  }

  return {
    seo: readonly(seo),
    loading: readonly(loading),
    error: readonly(error),
    fetchSeo,
    getSiteTitle,
    getFullTitle,
    getSiteDescription,
    getKeywords
  }
}

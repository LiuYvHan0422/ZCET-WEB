export interface SeoSettings {
  siteTitle: string
  siteDescription: string
  keywords: string
}

const defaultSeo: SeoSettings = {
  siteTitle: '沈阳振昌能源科技有限公司',
  siteDescription: '专业品质，值得信赖。我们提供优质的产品和服务，致力于为客户创造最大价值。',
  keywords: '',
}

let seoCache: SeoSettings | null = null
let isFetching = false

const resolveApiBase = (rawApiBase: unknown): string => {
  const apiBase = String(rawApiBase || '').trim()
  if (!apiBase) return ''

  if (/^https?:\/\//i.test(apiBase)) {
    return apiBase.replace(/\/+$/, '')
  }

  const requestUrl = useRequestURL()
  const origin = requestUrl.origin.replace(/\/+$/, '')
  const normalizedPath = apiBase.startsWith('/') ? apiBase : `/${apiBase}`
  return `${origin}${normalizedPath}`.replace(/\/+$/, '')
}

export const useSeo = () => {
  const seo = useState<SeoSettings>('seo-settings', () => defaultSeo)
  const loading = useState<boolean>('seo-loading', () => false)
  const error = useState<string | null>('seo-error', () => null)

  const fetchSeo = async (): Promise<SeoSettings> => {
    if (seoCache) {
      seo.value = seoCache
      return seoCache
    }

    if (isFetching) return seo.value

    isFetching = true
    loading.value = true
    error.value = null

    try {
      const config = useRuntimeConfig()
      const apiBase = resolveApiBase(config.public.apiBase)
      if (!apiBase) {
        throw new Error('API base is empty')
      }
      const response = await fetch(`${apiBase}/settings/seo`)

      if (!response.ok) {
        throw new Error(`Failed to fetch SEO settings: ${response.status}`)
      }

      const res = await response.json()
      const data = res?.data || {}

      const fetchedSeo: SeoSettings = {
        siteTitle: data.siteTitle || defaultSeo.siteTitle,
        siteDescription: data.siteDescription || defaultSeo.siteDescription,
        keywords: data.keywords || defaultSeo.keywords,
      }

      seoCache = fetchedSeo
      seo.value = fetchedSeo
      return fetchedSeo
    } catch (err) {
      console.error('获取 SEO 设置失败:', err)
      error.value = err instanceof Error ? err.message : '获取 SEO 设置失败'
      seo.value = defaultSeo
      return defaultSeo
    } finally {
      loading.value = false
      isFetching = false
    }
  }

  const getSiteTitle = () => seo.value.siteTitle || defaultSeo.siteTitle
  const getFullTitle = (suffix = ' - 您的优质选择') => `${getSiteTitle()}${suffix}`
  const getSiteDescription = () => seo.value.siteDescription || defaultSeo.siteDescription
  const getKeywords = () => seo.value.keywords || defaultSeo.keywords

  return {
    seo: readonly(seo),
    loading: readonly(loading),
    error: readonly(error),
    fetchSeo,
    getSiteTitle,
    getFullTitle,
    getSiteDescription,
    getKeywords,
  }
}

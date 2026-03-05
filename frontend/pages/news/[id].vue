<template>
  <div>
    <!-- 面包屑导航 -->
    <div class="breadcrumb">
      <div class="container">
        <div class="breadcrumb-list">
          <NuxtLink to="/">首页</NuxtLink>
          <span>/</span>
          <NuxtLink to="/news">新闻动态</NuxtLink>
          <span>/</span>
          <span class="current">{{ news.title }}</span>
        </div>
      </div>
    </div>

    <!-- 新闻详情 -->
    <section class="section-news-detail">
      <div class="container">
        <article class="news-article">
          <!-- 加载中 -->
          <div v-if="loading" class="loading">
            <p>加载中...</p>
          </div>
          
          <!-- 错误提示 -->
          <div v-else-if="error" class="error">
            <p>{{ error }}</p>
          </div>
          
          <template v-else>
            <header class="article-header">
              <img
                v-if="getNewsImage(news)"
                class="article-cover"
                :src="getNewsImage(news)"
                :alt="news.title"
              >
              <div v-else class="article-icon">{{ news.icon || '📰' }}</div>
              <h1 class="article-title">{{ news.title }}</h1>
              <time class="article-date">{{ news.date }}</time>
            </header>
            
            <div class="article-content">
              <p v-if="news.content" v-html="news.content.replace(/\n/g, '<br>')"></p>
            </div>
          </template>
          
          <div class="article-footer">
            <NuxtLink to="/news" class="btn btn-outline">
              返回列表
            </NuxtLink>
          </div>
        </article>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { apiGet } from '~/composables/useApi'
import { useSeo } from '~/composables/useSeo'
import { useMediaUrl } from '~/composables/useMediaUrl'

// 使用 SEO 配置
const { seo, fetchSeo } = useSeo()
const { normalizeMediaUrl } = useMediaUrl()

const route = useRoute()
const newsId = route.params.id

// 新闻数据类型
interface News {
  id: number
  title: string
  excerpt?: string
  content?: string
  date: string
  icon: string
  category?: string
  coverImage?: string
  image?: string
}

const news = ref<News>({
  id: 0,
  title: '加载中...',
  date: '',
  icon: '📰',
  content: ''
})

const loading = ref(true)
const error = ref('')

const getNewsImage = (item: News): string => {
  return normalizeMediaUrl(item.coverImage || item.image)
}

// 获取新闻详情
const fetchNews = async () => {
  try {
    loading.value = true
    const res = await apiGet<any>(`/news/${newsId}`)
    
    // 兼容两种返回格式：
    // 1. { code: 200, data: NewsEntity } - 包装格式
    // 2. NewsEntity - 直接返回
    if (res.code === 200 || res.code === 0) {
      news.value = res.data || {}
    } else if (res.id) {
      // 直接返回的格式
      news.value = res
    }
  } catch (e: any) {
    error.value = e.message || '获取新闻详情失败'
    console.error('获取新闻详情失败:', e)
    // 如果API失败，使用静态数据作为后备
    news.value = getStaticNews(Number(newsId)) || news.value
  } finally {
    loading.value = false
  }
}

// 静态数据后备
const getStaticNews = (id: number): News | undefined => {
  const staticData: Record<number, News> = {
    1: {
      id: 1,
      title: '公司荣获行业最佳服务奖',
      date: '2024-12-15',
      icon: '🏆',
      content: '近日，在年度行业评选中，我公司凭借优质的服务和良好的口碑，在众多竞争者中脱颖而出，荣获"最佳服务奖"这一殊荣。',
      excerpt: '凭借优质的服务和良好的口碑，我们在年度行业评选中脱颖而出。'
    },
    2: {
      id: 2,
      title: '新品发布会圆满成功',
      date: '2024-12-01',
      icon: '📢',
      content: '2024年新品发布会在北京成功举办，现场展示了多款创新产品，受到客户广泛好评。',
      excerpt: '新品发布会在北京成功举办，现场展示了多款创新产品。'
    },
    3: {
      id: 3,
      title: '公司成立十周年庆典',
      date: '2024-11-20',
      icon: '🎉',
      content: '时光荏苒，岁月如梭，转眼间公司已成立十周年。',
      excerpt: '庆祝公司成立十周年，感谢所有客户和合作伙伴的支持与信任。'
    }
  }
  return staticData[id]
}

onMounted(async () => {
  await Promise.all([fetchSeo(), fetchNews()])
})

// SEO 配置
useHead({
  title: computed(() => `${news.value.title} - ${seo.value.siteTitle}`),
  meta: [
    { name: 'description', content: news.value.excerpt || news.value.title }
  ]
})
</script>

<style scoped>
.section-news-detail {
  padding: 60px 0;
  background: var(--bg-color);
}

.loading, .error {
  text-align: center;
  padding: 60px;
  background: var(--white);
  border-radius: 12px;
  color: var(--text-secondary);
}

.error {
  color: var(--danger);
}

.news-article {
  background: var(--white);
  border-radius: 12px;
  box-shadow: var(--shadow);
  overflow: hidden;
}

.article-header {
  text-align: center;
  padding: 40px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: var(--white);
}

.article-icon {
  font-size: 64px;
  margin-bottom: 20px;
}

.article-cover {
  width: 100%;
  max-height: 360px;
  object-fit: cover;
  border-radius: 12px;
  margin-bottom: 20px;
}

.article-title {
  font-size: 32px;
  margin-bottom: 15px;
  line-height: 1.4;
}

.article-date {
  font-size: 14px;
  opacity: 0.9;
}

.article-content {
  padding: 40px;
  line-height: 2;
  color: var(--text-regular);
}

.article-content p {
  margin-bottom: 20px;
  text-indent: 2em;
}

.article-footer {
  padding: 20px 40px;
  border-top: 1px solid var(--border-color);
  text-align: center;
}

@media (max-width: 768px) {
  .section-news-detail {
    padding: 40px 0;
  }

  .article-header {
    padding: 30px 20px;
  }

  .article-title {
    font-size: 24px;
  }

  .article-content {
    padding: 20px;
  }

  .article-content p {
    text-indent: 0;
  }
}
</style>

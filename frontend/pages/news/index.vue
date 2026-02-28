<template>
  <div>
    <!-- 面包屑导航 -->
    <div class="breadcrumb">
      <div class="container">
        <div class="breadcrumb-list">
          <NuxtLink to="/">首页</NuxtLink>
          <span>/</span>
          <span class="current">新闻动态</span>
        </div>
      </div>
    </div>

    <!-- 新闻列表 -->
    <section class="section-news">
      <div class="container">
        <div class="section-title">
          <h2>新闻动态</h2>
          <p>了解我们的最新资讯</p>
        </div>
        
        <!-- 加载中 -->
        <div v-if="loading" class="loading">
          <p>加载中...</p>
        </div>
        
        <!-- 错误提示 -->
        <div v-else-if="error" class="error">
          <p>{{ error }}</p>
        </div>
        
        <!-- 新闻列表 -->
        <div v-else class="news-grid">
          <article
            v-for="news in paginatedNews"
            :key="news.id"
            class="news-card"
          >
            <NuxtLink :to="`/news/${news.id}`">
              <div class="news-card-image">
                {{ news.icon || '📰' }}
              </div>
              <div class="news-card-body">
                <time class="news-card-date">{{ news.date }}</time>
                <h3 class="news-card-title">{{ news.title }}</h3>
                <p class="news-card-excerpt">{{ news.excerpt }}</p>
              </div>
            </NuxtLink>
          </article>
        </div>

        <!-- 无数据提示 -->
        <div v-if="!loading && !error && newsList.length === 0" class="no-results">
          <p>暂无新闻</p>
        </div>

        <!-- 分页 -->
        <div v-if="!loading && !error && totalPages > 1" class="pagination">
          <button
            class="pagination-btn"
            :disabled="currentPage === 1"
            @click="changePage(currentPage - 1)"
          >
            ‹
          </button>
          
          <button
            v-for="page in totalPages"
            :key="page"
            class="pagination-btn"
            :class="{ active: page === currentPage }"
            @click="changePage(page)"
          >
            {{ page }}
          </button>
          
          <button
            class="pagination-btn"
            :disabled="currentPage === totalPages"
            @click="changePage(currentPage + 1)"
          >
            ›
          </button>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { apiGet } from '~/composables/useApi'
import { useSeo } from '~/composables/useSeo'

// 使用 SEO 配置
const { seo, fetchSeo } = useSeo()

// 新闻数据类型
interface News {
  id: number
  title: string
  excerpt?: string
  content?: string
  date: string
  icon: string
  category?: string
}

const newsList = ref<News[]>([])
const loading = ref(true)
const error = ref('')

// 获取新闻列表
const fetchNews = async () => {
  try {
    loading.value = true
    // 后端返回格式: { code: 200, data: [...], pagination: {...} }
    // data 直接是数组，不是 { items: [...] }
    const res = await apiGet<{ code: number; data: News[] }>('/news', {
      page: 1,
      pageSize: 100,
      status: 'published'
    })
    console.log('新闻接口返回:', res)
    if (res.code === 200 || res.code === 0) {
      // 直接使用 res.data，因为后端返回的是数组不是 { items: [...] }
      newsList.value = res.data || []
      console.log('新闻列表数据:', newsList.value)
    }
  } catch (e: any) {
    error.value = e.message || '获取新闻失败'
    console.error('获取新闻失败:', e)
  } finally {
    loading.value = false
  }
}

// 分页状态
const currentPage = ref(1)
const itemsPerPage = 6

const totalPages = computed(() => Math.ceil(newsList.value.length / itemsPerPage))

// 当前页数据
const paginatedNews = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  return newsList.value.slice(start, start + itemsPerPage)
})

// 切换页面
const changePage = (page: number) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

// 页面加载时获取数据
onMounted(async () => {
  await fetchSeo()
  await fetchNews()
})

// SEO 配置
useHead({
  title: computed(() => `新闻动态 - ${seo.value.siteTitle}`),
  meta: [
    { name: 'description', content: '了解我们的最新资讯，包括公司新闻、行业动态等。' }
  ]
})
</script>

<style scoped>
.news-card a {
  display: block;
}

.loading, .error, .no-results {
  text-align: center;
  padding: 60px;
  color: var(--text-secondary);
}

.error {
  color: var(--danger);
}

@media (max-width: 1024px) {
  .news-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .news-grid {
    grid-template-columns: 1fr;
  }
}
</style>

<template>
  <div>
    <!-- 面包屑导航 -->
    <div class="breadcrumb">
      <div class="container">
        <div class="breadcrumb-list">
          <NuxtLink to="/">首页</NuxtLink>
          <span>/</span>
          <span class="current">全部商品</span>
        </div>
      </div>
    </div>

    <!-- 商品列表 -->
    <section class="section-products-full">
      <div class="container">
        <div class="section-title">
          <h2>全部商品</h2>
          <p>精选优质产品，满足您的各种需求</p>
        </div>

        <!-- 筛选栏 -->
        <div class="product-filter">
          <div class="filter-group">
            <label>分类：</label>
            <select v-model="selectedCategory" class="form-control">
              <option value="">全部</option>
              <option v-for="cat in categories" :key="cat" :value="cat">
                {{ cat }}
              </option>
            </select>
          </div>
          <div class="filter-group">
            <label>排序：</label>
            <select v-model="sortBy" class="form-control">
              <option value="default">默认排序</option>
              <option value="price-asc">价格从低到高</option>
              <option value="price-desc">价格从高到低</option>
              <option value="name">名称排序</option>
            </select>
          </div>
        </div>

        <!-- 商品网格 -->
        <div v-if="loading" class="loading">
          <p>加载中...</p>
        </div>
        <div v-else-if="error" class="error">
          <p>{{ error }}</p>
        </div>
        <div v-else class="products-grid">
          <div
            v-for="product in paginatedProducts"
            :key="product.id"
            class="product-card"
          >
            <NuxtLink :to="`/product/${product.id}`">
              <div class="product-card-image">
                {{ product.icon || '📦' }}
              </div>
              <div class="product-card-body">
                <h3 class="product-card-name">{{ product.name }}</h3>
                <p class="product-card-desc">{{ formatText(product.description) }}</p>
                <p class="product-card-price">
                  ¥{{ formatPrice(product.price) }}
                </p>
              </div>
            </NuxtLink>
          </div>
        </div>

        <!-- 无结果提示 -->
        <div v-if="filteredProducts.length === 0" class="no-results">
          <p>暂无符合条件的商品</p>
        </div>

        <!-- 分页 -->
        <div class="pagination">
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

// 商品数据 - 从 API 获取
interface Product {
  id: number
  name: string
  description: string
  shortDescription?: string
  price: number
  category: string
  icon: string
  image?: string
}

const products = ref<Product[]>([])
const loading = ref(true)
const error = ref('')

// 格式化价格
const formatPrice = (price: any): string => {
  const num = typeof price === 'number' ? price : parseFloat(price) || 0
  return num.toLocaleString()
}

// 格式化文本，移除 HTML 标签
const formatText = (text: any): string => {
  if (!text) return ''
  return text.replace(/<[^>]*>/g, '').trim()
}

// 获取商品列表
const fetchProducts = async () => {
  try {
    loading.value = true
    const res = await apiGet<{ code: number; data: any }>('/products', {
      page: 1,
      pageSize: 100,
      status: 'active'
    })
    console.log('商品列表响应:', res)
    if (res.code === 200 || res.code === 0) {
      // 后端返回的分页格式: { code, message, data: [...items], pagination, timestamp }
      // data 本身就是数组
      if (Array.isArray(res.data)) {
        products.value = res.data
      } else if (res.data && Array.isArray(res.data.items)) {
        products.value = res.data.items
      } else {
        products.value = []
      }
      console.log('商品列表数据:', products.value)
    }
  } catch (e: any) {
    error.value = e.message || '获取商品失败'
    console.error('获取商品失败:', e)
  } finally {
    loading.value = false
  }
}

// 分类列表 - 从商品数据中提取
const categories = computed(() => {
  const cats = new Set(products.value.map(p => p.category).filter(Boolean))
  return Array.from(cats)
})

// 筛选和排序
const selectedCategory = ref('')
const sortBy = ref('default')
const currentPage = ref(1)
const itemsPerPage = 8

// 过滤和排序后的商品
const filteredProducts = computed(() => {
  let result = [...products.value]

  // 分类筛选
  if (selectedCategory.value) {
    result = result.filter(p => p.category === selectedCategory.value)
  }

  // 排序
  switch (sortBy.value) {
    case 'price-asc':
      result.sort((a, b) => a.price - b.price)
      break
    case 'price-desc':
      result.sort((a, b) => b.price - a.price)
      break
    case 'name':
      result.sort((a, b) => a.name.localeCompare(b.name))
      break
  }

  return result
})

// 总页数
const totalPages = computed(() => Math.ceil(filteredProducts.value.length / itemsPerPage))

// 当前页的商品
const paginatedProducts = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  return filteredProducts.value.slice(start, start + itemsPerPage)
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
  await fetchProducts()
})

// SEO 配置
useHead({
  title: computed(() => `全部商品 - ${seo.value.siteTitle}`),
  meta: [
    { name: 'description', content: '精选优质产品，满足您的各种需求。' }
  ]
})
</script>

<style scoped>
.section-products-full {
  padding: 60px 0;
  background: var(--bg-color);
}

.product-filter {
  display: flex;
  gap: 30px;
  margin-bottom: 30px;
  padding: 20px;
  background: var(--white);
  border-radius: 8px;
  box-shadow: var(--shadow);
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 10px;
}

.filter-group label {
  font-size: 14px;
  color: var(--text-secondary);
}

.filter-group select {
  width: 150px;
}

.no-results {
  text-align: center;
  padding: 60px;
  color: var(--text-secondary);
}

.loading, .error {
  text-align: center;
  padding: 60px;
  color: var(--text-secondary);
}

.error {
  color: var(--danger);
}

@media (max-width: 768px) {
  .product-filter {
    flex-direction: column;
    gap: 15px;
  }

  .filter-group {
    width: 100%;
  }

  .filter-group select {
    flex: 1;
  }
}
</style>

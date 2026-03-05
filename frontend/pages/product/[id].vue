<template>
  <div>
    <!-- 面包屑导航 -->
    <div class="breadcrumb">
      <div class="container">
        <div class="breadcrumb-list">
          <NuxtLink to="/">首页</NuxtLink>
          <span>/</span>
          <span class="current">{{ product.name }}</span>
        </div>
      </div>
    </div>

    <!-- 商品详情 -->
    <section class="section-product-detail">
      <div class="container">
        <div v-if="loading" class="loading">
          <p>加载中...</p>
        </div>
        <div v-else-if="error" class="error">
          <p>{{ error }}</p>
        </div>
        <template v-else>
          <div class="product-detail-grid">
            <!-- 商品图片 -->
            <div class="product-gallery">
              <div class="product-main-image">
                <img
                  v-if="activeImage"
                  :src="activeImage"
                  :alt="product.name || '商品图片'"
                >
                <span v-else>{{ product.icon || '📦' }}</span>
              </div>
              <div v-if="productThumbnails.length > 0" class="product-thumbnails">
                <div
                  v-for="(thumb, index) in productThumbnails"
                  :key="index"
                  class="product-thumbnail"
                  :class="{ active: activeThumbnail === index }"
                  @click="activeThumbnail = index"
                >
                  <img :src="thumb" :alt="`${product.name || '商品'}-${index + 1}`">
                </div>
              </div>
            </div>

            <!-- 商品信息 -->
            <div class="product-info-section">
              <h1 class="product-title">{{ product.name || '商品详情' }}</h1>
              <p class="product-subtitle">{{ formatSummary(product.shortDescription, 120) || '暂无简短描述' }}</p>
              
              <div class="product-price-section">
                <span class="price-label">价格</span>
                <span class="product-price">¥{{ formatPrice(product.price) }}</span>
              </div>

              <div class="product-meta">
                <div class="meta-item">
                  <span class="meta-label">编号</span>
                  <span class="meta-value">{{ product.sku || '-' }}</span>
                </div>
                <div class="meta-item">
                  <span class="meta-label">分类</span>
                  <span class="meta-value">{{ product.category || '-' }}</span>
                </div>
                <div class="meta-item">
                  <span class="meta-label">库存</span>
                  <span class="meta-value">{{ product.stock || 0 }}件</span>
                </div>
              </div>

              <div class="product-actions">
                <button class="btn btn-primary btn-lg" @click="handleGetQuote">
                  获取报价
                </button>
                <button class="btn btn-outline btn-lg" @click="handleContact">
                  联系我们
                </button>
              </div>

              <div v-if="parseJson(product.features).length > 0" class="product-features">
                <h3>产品特点</h3>
                <ul>
                  <li v-for="(feature, index) in parseJson(product.features)" :key="index">
                    {{ feature }}
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <!-- 商品详情描述 -->
          <div class="product-description-section">
            <div class="section-title">
              <h2>商品详情</h2>
            </div>
            
            <div class="product-description">
              <!-- 优先使用 details，如果为空则使用 description -->
              <template v-if="product.details && parseJson(product.details).length > 0">
                <p v-for="(detail, index) in parseJson(product.details)" :key="index">
                  {{ detail }}
                </p>
              </template>
              <template v-else-if="product.description">
                <p v-html="formatHtml(product.description)"></p>
              </template>
              <p v-else>暂无详情描述</p>
            </div>
          </div>

          <!-- 相关商品 -->
          <div class="related-products-section">
            <div class="section-title">
              <h2>相关商品</h2>
            </div>
            
            <div class="products-grid">
              <div
                v-for="relatedProduct in relatedProducts"
                :key="relatedProduct.id"
                class="product-card"
              >
                <NuxtLink :to="`/product/${relatedProduct.id}`">
                  <div class="product-card-image">
                    <img
                      v-if="getProductImage(relatedProduct)"
                      :src="getProductImage(relatedProduct)"
                      :alt="relatedProduct.name"
                      loading="lazy"
                    >
                    <span v-else>{{ relatedProduct.icon || '📦' }}</span>
                  </div>
                  <div class="product-card-body">
                    <h3 class="product-card-name">{{ relatedProduct.name }}</h3>
                    <p class="product-card-desc">{{ formatSummary(relatedProduct.shortDescription, 72) || '暂无简短描述' }}</p>
                    <p class="product-card-price">
                      ¥{{ formatPrice(relatedProduct.price) }}
                    </p>
                  </div>
                </NuxtLink>
              </div>
            </div>
          </div>
        </template>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useModal } from '~/composables/useModal'
import { apiGet } from '~/composables/useApi'
import { useSeo } from '~/composables/useSeo'
import { useMediaUrl } from '~/composables/useMediaUrl'

// 使用 SEO 配置
const { seo, fetchSeo } = useSeo()

const route = useRoute()
const { openModal } = useModal()
const { normalizeMediaUrl, normalizeMediaList } = useMediaUrl()

// 商品ID
const productId = Number(route.params.id) || 1

// 商品数据
interface Product {
  id: number
  name: string
  description: string
  shortDescription?: string
  price: number
  sku: string
  category: string
  stock: number
  icon: string
  image?: string
  features?: string[]
  details?: string[]
}

const product = ref<Product>({
  id: 0,
  name: '',
  description: '',
  price: 0,
  sku: '',
  category: '',
  stock: 0,
  icon: ''
})

const relatedProducts = ref<Product[]>([])
const loading = ref(true)
const error = ref('')

const activeThumbnail = ref(0)
const productThumbnails = computed(() => normalizeMediaList(product.value.image))
const activeImage = computed(() => productThumbnails.value[activeThumbnail.value] || '')

watch(productThumbnails, (images) => {
  if (images.length === 0) {
    activeThumbnail.value = 0
    return
  }
  if (activeThumbnail.value >= images.length) {
    activeThumbnail.value = 0
  }
})

const getProductImage = (item: Product): string => {
  return normalizeMediaUrl(item.image)
}

// 获取商品详情
const fetchProduct = async () => {
  try {
    loading.value = true
    error.value = ''
    
    // 获取当前商品
    console.log('=== 开始获取商品详情 ===')
    console.log('请求商品详情 API:', `/products/${productId}`)
    const res = await apiGet<{ code: number; data: any }>(`/products/${productId}`)
    console.log('商品详情响应:', res)
    console.log('res.data:', res.data)
    
    if (res.code === 200 || res.code === 0) {
      product.value = res.data || {}
      console.log('商品数据:', product.value)
    } else {
      error.value = res.message || '获取商品详情失败'
    }
    
    // 获取相关商品（同分类）
    if (product.value.category) {
      const listRes = await apiGet<{ code: number; data: any }>('/products', {
        page: 1,
        pageSize: 4,
        category: product.value.category,
        status: 'active'
      })
      console.log('相关商品响应:', listRes)
      if (listRes.code === 200 || listRes.code === 0) {
        // 处理分页数据格式 - data 本身就是数组
        let productsData = []
        if (Array.isArray(listRes.data)) {
          productsData = listRes.data
        } else if (listRes.data && Array.isArray(listRes.data.items)) {
          productsData = listRes.data.items
        }
        relatedProducts.value = productsData.filter((p: any) => p.id !== productId).slice(0, 4)
        console.log('相关商品数据:', relatedProducts.value)
      }
    }
  } catch (e: any) {
    error.value = e.message || '获取商品详情失败'
    console.error('获取商品详情失败:', e)
  } finally {
    loading.value = false
  }
}

// 获取报价
const handleGetQuote = () => {
  openModal(product.value.name)
}

// 联系我们
const handleContact = () => {
  openModal('')
}

// 格式化价格，确保是数字类型
const formatPrice = (price: any): string => {
  const num = typeof price === 'number' ? price : parseFloat(price) || 0
  return num.toLocaleString()
}

// 格式化描述，处理 HTML 标签
const formatDescription = (desc: any): string => {
  if (!desc) return '暂无描述'
  // 移除 HTML 标签，只保留文本
  return desc.replace(/<[^>]*>/g, '').trim() || '暂无描述'
}

const formatSummary = (desc: any, maxLength = 120): string => {
  const plain = formatDescription(desc)
  if (!plain || plain === '暂无描述') return plain
  return plain.length > maxLength ? `${plain.slice(0, maxLength)}...` : plain
}

// 格式化描述，保留 HTML 标签
const formatHtml = (desc: any): string => {
  if (!desc) return '暂无描述'
  return desc
}

// 解析 JSON 字段
const parseJson = (data: any): string[] => {
  if (!data) return []
  if (Array.isArray(data)) return data
  try {
    return JSON.parse(data)
  } catch {
    return []
  }
}

// 页面加载时获取数据
onMounted(async () => {
  await fetchSeo()
  await fetchProduct()
})

// SEO 配置
useHead({
  title: computed(() => `${product.value.name || '商品详情'} - ${seo.value.siteTitle}`),
  meta: [
    { name: 'description', content: computed(() => product.value.shortDescription || product.value.description || '') }
  ]
})
</script>

<style scoped>
.section-product-detail {
  padding: 60px 0;
  background: var(--bg-color);
}

.loading, .error {
  text-align: center;
  padding: 60px;
  background: var(--white);
  border-radius: 12px;
}

.error {
  color: var(--danger);
}

.product-detail-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 40px;
  background: var(--white);
  padding: 40px;
  border-radius: 12px;
  box-shadow: var(--shadow);
  margin-bottom: 40px;
}

.product-gallery {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.product-main-image {
  height: 400px;
  background: linear-gradient(45deg, #e0e0e0, #f5f5f5);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 120px;
  overflow: hidden;
}

.product-main-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.product-thumbnails {
  display: flex;
  gap: 10px;
}

.product-thumbnail {
  width: 80px;
  height: 80px;
  background: var(--bg-color);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  cursor: pointer;
  border: 2px solid transparent;
  transition: all 0.3s;
  overflow: hidden;
}

.product-thumbnail img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.product-thumbnail:hover,
.product-thumbnail.active {
  border-color: var(--primary);
}

.product-info-section {
  display: flex;
  flex-direction: column;
}

.product-title {
  font-size: 28px;
  margin-bottom: 10px;
}

.product-subtitle {
  color: var(--text-secondary);
  margin-bottom: 30px;
}

.product-price-section {
  display: flex;
  align-items: baseline;
  gap: 15px;
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 1px solid var(--border-color);
}

.price-label {
  color: var(--text-secondary);
}

.product-price {
  font-size: 36px;
  font-weight: bold;
  color: var(--primary);
}

.product-meta {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  margin-bottom: 30px;
}

.meta-item {
  text-align: center;
}

.meta-label {
  display: block;
  font-size: 12px;
  color: var(--text-secondary);
  margin-bottom: 5px;
}

.meta-value {
  font-weight: 500;
}

.product-actions {
  display: flex;
  gap: 15px;
  margin-bottom: 30px;
}

.product-features h3 {
  font-size: 16px;
  margin-bottom: 15px;
}

.product-features ul {
  list-style: disc;
  padding-left: 20px;
}

.product-features li {
  color: var(--text-regular);
  margin-bottom: 8px;
}

.product-description-section {
  background: var(--white);
  padding: 40px;
  border-radius: 12px;
  box-shadow: var(--shadow);
  margin-bottom: 40px;
}

.product-description {
  line-height: 2;
  color: var(--text-regular);
}

.product-description p {
  margin-bottom: 15px;
}

.related-products-section {
  background: var(--white);
  padding: 40px;
  border-radius: 12px;
  box-shadow: var(--shadow);
}

@media (max-width: 1024px) {
  .product-detail-grid {
    grid-template-columns: 1fr;
    padding: 20px;
  }

  .product-main-image {
    height: 300px;
    font-size: 80px;
  }
}

@media (max-width: 768px) {
  .section-product-detail {
    padding: 40px 0;
  }

  .product-meta {
    grid-template-columns: 1fr;
    gap: 10px;
  }

  .product-actions {
    flex-direction: column;
  }

  .product-description-section,
  .related-products-section {
    padding: 20px;
  }
}
</style>

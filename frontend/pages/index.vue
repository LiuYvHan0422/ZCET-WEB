<template>
  <div>
    <!-- 首页 Banner -->
    <section class="hero">
      <div class="container">
        <h1 class="hero-title">专业品质，值得信赖</h1>
        <p class="hero-subtitle">
          我们提供优质的产品和服务，致力于为客户创造最大价值
        </p>
        <div class="hero-buttons">
          <a href="#products" class="btn btn-white">浏览商品</a>
          <a href="#contact" class="btn btn-outline-white">联系我们</a>
        </div>
      </div>
    </section>

    <!-- 特色区域 -->
    <section class="section-features" id="features">
      <div class="container">
        <div class="section-title">
          <h2>为什么选择我们</h2>
          <p>专业团队，优质服务，只为您的满意</p>
        </div>
        
        <div class="features-grid">
          <div class="feature-card">
            <div class="feature-card-icon">🚚</div>
            <h3 class="feature-card-title">快速发货</h3>
            <p class="feature-card-text">48小时内发货，确保您尽快收到商品</p>
          </div>
          
          <div class="feature-card">
            <div class="feature-card-icon">💎</div>
            <h3 class="feature-card-title">品质保证</h3>
            <p class="feature-card-text">严格质量把控，每件产品都经过检验</p>
          </div>
          
          <div class="feature-card">
            <div class="feature-card-icon">🔒</div>
            <h3 class="feature-card-title">安全支付</h3>
            <p class="feature-card-text">多种支付方式，安全便捷有保障</p>
          </div>
          
          <div class="feature-card">
            <div class="feature-card-icon">🎧</div>
            <h3 class="feature-card-title">专业服务</h3>
            <p class="feature-card-text">7×24小时客服，随时为您解答疑问</p>
          </div>
        </div>
      </div>
    </section>

    <!-- 商品展示 -->
    <section class="section-products" id="products">
      <div class="container">
        <div class="section-title">
          <h2>热门商品</h2>
          <p>精选优质产品，满足您的各种需求</p>
        </div>
        
        <div class="products-grid">
          <div v-if="loading" class="loading">
            <p>加载中...</p>
          </div>
          <!-- 调试信息：显示数据状态 -->
          <div v-if="!loading && products.length === 0" class="loading">
            <p>暂无商品数据</p>
            <p style="font-size: 12px; color: #999; margin-top: 10px;">(API 可能返回空数据，请检查控制台)</p>
          </div>
          <template v-else>
            <div
              v-for="product in products"
              :key="product.id"
              class="product-card"
            >
              <NuxtLink :to="`/product/${product.id}`">
                <div class="product-card-image">
                  {{ product.icon || '📦' }}
                </div>
                <div class="product-card-body">
                  <h3 class="product-card-name">{{ product.name }}</h3>
                  <p class="product-card-desc">{{ formatText(product.shortDescription || product.description) }}</p>
                  <p class="product-card-price">¥{{ formatPrice(product.price) }}</p>
                  <button
                    class="btn btn-primary product-card-btn"
                    @click.prevent="handleGetQuote(product.name)"
                  >
                    获取报价
                  </button>
                </div>
              </NuxtLink>
            </div>
          </template>
        </div>
        
        <div class="products-more">
          <NuxtLink to="/product" class="btn btn-outline">
            查看更多商品
          </NuxtLink>
        </div>
      </div>
    </section>

    <!-- 关于我们 -->
    <section class="section-about" id="about">
      <div class="container">
        <div class="about-content">
          <div class="about-image">🏢</div>
          <div class="about-text">
            <h2>关于我们</h2>
            <p v-if="company?.aboutContent">
              {{ company.aboutContent }}
            </p>
            <p v-else-if="company?.shortDescription">
              {{ company.shortDescription }}
            </p>
            <p v-else>
              我们是一家专注于品质与服务的专业公司，拥有多年的行业经验和专业团队。
            </p>
            
            <div class="about-stats">
              <div class="stat-item">
                <div class="stat-number">{{ company?.foundedYear ? new Date().getFullYear() - parseInt(company.foundedYear) + '+' : '10+' }}</div>
                <div class="stat-label">年行业经验</div>
              </div>
              <div class="stat-item">
                <div class="stat-number">5000+</div>
                <div class="stat-label">服务客户</div>
              </div>
              <div class="stat-item">
                <div class="stat-number">99%</div>
                <div class="stat-label">客户满意度</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 联系信息 -->
    <section class="section-contact" id="contact">
      <div class="container">
        <div class="section-title">
          <h2>联系我们</h2>
          <p>有任何问题，欢迎随时与我们联系</p>
        </div>
        
        <div class="contact-grid">
          <div class="contact-card">
            <div class="contact-card-icon">📞</div>
            <h3 class="contact-card-title">电话咨询</h3>
            <p class="contact-card-text">{{ company?.phone || '400-888-8888' }}</p>
            <p class="contact-card-text">工作日 9:00-18:00</p>
          </div>
          
          <div class="contact-card">
            <div class="contact-card-icon">✉️</div>
            <h3 class="contact-card-title">邮件联系</h3>
            <p class="contact-card-text">{{ company?.email || 'info@example.com' }}</p>
            <p class="contact-card-text">24小时内回复</p>
          </div>
          
          <div class="contact-card">
            <div class="contact-card-icon">📍</div>
            <h3 class="contact-card-title">公司地址</h3>
            <p class="contact-card-text">{{ company?.address || '某某省某某市某某区' }}</p>
            <p v-if="company?.address" class="contact-card-text"></p>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useModal } from '~/composables/useModal'
import { apiGet } from '~/composables/useApi'
import { useSeo } from '~/composables/useSeo'

// 使用 SEO 配置
const { seo, fetchSeo } = useSeo()

// 使用弹窗
const { openModal } = useModal()

// 公司信息
interface Company {
  id: number
  name: string
  shortDescription: string
  aboutContent: string
  phone: string
  email: string
  address: string
  foundedYear: string
}

const company = ref<Company | null>(null)

// 商品数据 - 从 API 获取
interface Product {
  id: number
  name: string
  description: string
  shortDescription?: string
  price: number
  icon: string
  image?: string
}

const products = ref<Product[]>([])
const loading = ref(true)

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

// 获取公司信息
const fetchCompany = async () => {
  try {
    const res = await apiGet<{ code: number; data: Company }>('/company')
    if (res.code === 200 || res.code === 0) {
      company.value = res.data
      console.log('公司信息:', company.value)
    }
  } catch (e) {
    console.error('获取公司信息失败:', e)
  }
}

// 获取热门商品
const fetchProducts = async () => {
  try {
    loading.value = true
    console.log('=== 开始获取商品列表 ===')
    const res = await apiGet<{ code: number; data: any }>('/products', {
      page: 1,
      pageSize: 4,
      status: 'active'
    })
    console.log('API 原始响应:', res)
    
    if (res.code === 200 || res.code === 0) {
      // 后端返回的分页格式: { code, message, data: [...items], pagination, timestamp }
      // data 本身就是数组
      if (Array.isArray(res.data)) {
        products.value = res.data.slice(0, 4)
      } else if (res.data && Array.isArray(res.data.items)) {
        // 备用格式
        products.value = res.data.items.slice(0, 4)
      } else {
        products.value = []
      }
      console.log('商品数据:', products.value)
    }
  } catch (e) {
    console.error('获取商品失败:', e)
  } finally {
    loading.value = false
  }
}

// 获取报价
const handleGetQuote = (productName: string) => {
  openModal(productName)
}

// 页面加载时获取数据
onMounted(async () => {
  await fetchSeo()
  await fetchCompany()
  await fetchProducts()
})

// SEO 配置
useHead({
  title: computed(() => `首页 - ${seo.value.siteTitle}`),
  meta: [
    { name: 'description', content: seo.value.siteDescription || '专业品质，值得信赖。我们提供优质的产品和服务，致力于为客户创造最大价值。' }
  ]
})
</script>

<style scoped>
.product-card-btn {
  width: 100%;
}

.product-card a {
  display: block;
}
</style>

<template>
  <div>
    <!-- 首页 Banner -->
    <section class="hero">
      <div class="container">
        <div class="hero-content">
          <h1 class="hero-title">专业品质，值得信赖</h1>
          <p class="hero-subtitle">
            我们提供优质的产品和服务，致力于为客户创造最大价值
          </p>
          <div class="hero-buttons">
            <a href="#products" class="btn btn-white">浏览商品</a>
            <a href="#contact" class="btn btn-outline-white">联系我们</a>
          </div>
        </div>
      </div>
    </section>

    <!-- 特色区域 -->
    <section class="section-features" id="features">
      <div class="container">
        <div class="section-title">
          <h2>为什么选择我们</h2>
          <p>革新变压器干燥模式，告别高能耗、低效率的传统工艺，引领行业技术升级。</p>
        </div>
        
        <div class="features-grid">
          <div class="feature-card">
            <div class="feature-card-icon">⚡</div>
            <h3 class="feature-card-title">颠覆传统</h3>
            <p class="feature-card-text">革新变压器干燥模式，告别高能耗、低效率的传统工艺，引领行业技术升级。</p>
          </div>
          
          <div class="feature-card">
            <div class="feature-card-icon">📈</div>
            <h3 class="feature-card-title">降本增效</h3>
            <p class="feature-card-text">大幅缩短干燥周期，降低人力与能源成本，显著提升生产效率与投资回报。</p>
          </div>
          
          <div class="feature-card">
            <div class="feature-card-icon">🛡️</div>
            <h3 class="feature-card-title">品质升级</h3>
            <p class="feature-card-text">精准控温、均匀干燥，有效提升变压器绝缘性能与使用寿命，保障设备长期稳定运行。</p>
          </div>
          
          <div class="feature-card">
            <div class="feature-card-icon">🌿</div>
            <h3 class="feature-card-title">绿色节能</h3>
            <p class="feature-card-text">相比传统方式能耗降低显著，助力企业实现低碳生产，践行可持续发展理念。</p>
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
                  <img
                    v-if="getProductImage(product)"
                    :src="getProductImage(product)"
                    :alt="product.name"
                    loading="lazy"
                  >
                  <span v-else>{{ product.icon || '📦' }}</span>
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
          <div class="about-image">
            <img
              v-if="companyLogoUrl"
              :src="companyLogoUrl"
              :alt="company?.name || 'Company Logo'"
              loading="lazy"
            >
            <span v-else>🏢</span>
          </div>
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
        
        <div class="contact-grid" :class="{ 'contact-grid-has-qrcode': !!companyQrcodeUrl }">
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
            <p v-if="!company?.address" class="contact-card-text">某某路88号</p>
          </div>

          <div v-if="companyQrcodeUrl" class="contact-card contact-card-qrcode">
            <div class="contact-card-icon">微</div>
            <h3 class="contact-card-title">官方二维码</h3>
            <img
              :src="companyQrcodeUrl"
              alt="公司二维码"
              class="company-qrcode"
              loading="lazy"
            />
            <p class="contact-card-text qrcode-tip">微信扫码咨询</p>
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
import { useMediaUrl } from '~/composables/useMediaUrl'

// 使用 SEO 配置
const { seo, fetchSeo } = useSeo()

// 使用弹窗
const { openModal } = useModal()
const { normalizeMediaUrl } = useMediaUrl()

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
  logo?: string
  qrcode?: string
}

const company = ref<Company | null>(null)
const companyLogoUrl = computed(() => normalizeMediaUrl(company.value?.logo))
const companyQrcodeUrl = computed(() => normalizeMediaUrl(company.value?.qrcode))

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

const getProductImage = (product: Product): string => {
  return normalizeMediaUrl(product.image)
}

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

.section-about .about-image {
  overflow: hidden;
}

.section-about .about-image img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  display: block;
  background: var(--white);
}

.section-about .about-image span {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  color: var(--white);
  font-size: 64px;
}

.section-contact {
  padding: 48px 0 50px;
  background: linear-gradient(180deg, #f8fbff 0%, #f5f7fb 100%);
}

.section-contact .contact-grid.contact-grid-has-qrcode {
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 20px;
}

.section-contact .contact-card {
  padding: 24px 18px;
  min-height: 216px;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border: 1px solid #e6edf7;
  box-shadow: 0 10px 24px rgba(17, 39, 83, 0.06);
  transition: transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease;
}

.section-contact .contact-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 16px 32px rgba(17, 39, 83, 0.1);
  border-color: #d7e5f8;
}

.contact-card-qrcode {
  text-align: center;
}

.company-qrcode {
  width: 92px;
  height: 92px;
  object-fit: contain;
  margin: 10px auto 0;
  border-radius: 8px;
  background: var(--white);
  padding: 4px;
  display: block;
}

.qrcode-tip {
  margin-top: 8px;
  font-size: 12px;
}

.section-contact .section-title {
  margin-bottom: 34px;
}

.section-contact .contact-card-icon {
  width: 56px;
  height: 56px;
  margin-bottom: 14px;
  font-size: 24px;
}

.section-contact .contact-card-title {
  margin-bottom: 8px;
}

.section-contact .contact-card-text {
  margin-bottom: 2px;
  line-height: 1.55;
}

@media (max-width: 1024px) {
  .section-contact .contact-grid.contact-grid-has-qrcode {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 768px) {
  .section-contact .contact-grid.contact-grid-has-qrcode {
    grid-template-columns: 1fr;
  }
}
</style>

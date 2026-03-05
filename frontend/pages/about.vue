<template>
  <div>
    <!-- 面包屑导航 -->
    <div class="breadcrumb">
      <div class="container">
        <div class="breadcrumb-list">
          <NuxtLink to="/">首页</NuxtLink>
          <span>/</span>
          <span class="current">关于我们</span>
        </div>
      </div>
    </div>

    <!-- 关于我们内容 -->
    <section class="section-about-detail">
      <div class="container">
        <!-- 加载中 -->
        <div v-if="loading" class="loading">
          <p>加载中...</p>
        </div>
        
        <!-- 错误提示 -->
        <div v-else-if="error" class="error">
          <p>{{ error }}</p>
        </div>
        
        <template v-else-if="company">
          <div class="about-content">
            <div class="about-image">
              <img
                v-if="companyLogoUrl"
                :src="companyLogoUrl"
                :alt="company.name || 'Company Logo'"
                loading="lazy"
              />
              <span v-else>{{ company.name?.charAt(0) || 'C' }}</span>
            </div>
            <div class="about-text">
              <h2>{{ company.name || '关于我们' }}</h2>
              <p v-if="company.shortDescription">{{ company.shortDescription }}</p>
              <p v-else>
                我们是一家专注于品质与服务的专业公司，拥有多年的行业经验和专业团队。
                我们始终坚持以客户为中心，致力于为客户提供最优质的产品和最满意的服务。
              </p>
              <p v-if="company.aboutContent">{{ company.aboutContent.substring(0, 200) }}...</p>
              <p v-else>
                我们的团队由一群充满激情和创造力的专业人士组成，我们不断追求卓越，
                努力为客户创造最大的价值。
              </p>
              
              <div class="about-stats">
                <div class="stat-item">
                  <div class="stat-number">{{ company.statistics?.years || '10+' }}</div>
                  <div class="stat-label">年行业经验</div>
                </div>
                <div class="stat-item">
                  <div class="stat-number">{{ company.statistics?.customers || '5000+' }}</div>
                  <div class="stat-label">服务客户</div>
                </div>
                <div class="stat-item">
                  <div class="stat-number">{{ company.statistics?.satisfaction || '99%' }}</div>
                  <div class="stat-label">客户满意度</div>
                </div>
              </div>
            </div>
          </div>

          <!-- 发展历程 -->
          <div class="timeline-section">
            <div class="section-title">
              <h2>发展历程</h2>
              <p>十余年发展，见证我们的成长</p>
            </div>
            
            <div class="timeline">
              <template v-if="company.timeline && company.timeline.length > 0">
                <div
                  v-for="(item, index) in company.timeline"
                  :key="index"
                  class="timeline-item"
                >
                  <div class="timeline-year">{{ item.year }}</div>
                  <div class="timeline-content">
                    <h3>{{ item.title }}</h3>
                    <p>{{ item.description }}</p>
                  </div>
                </div>
              </template>
              <template v-else>
                <div class="timeline-item">
                  <div class="timeline-year">{{ company.foundedYear || '2014' }}</div>
                  <div class="timeline-content">
                    <h3>公司成立</h3>
                    <p>我们正式成立，开始了创业之旅</p>
                  </div>
                </div>
              </template>
            </div>
          </div>

          <!-- 核心价值观 -->
          <div class="values-section">
            <div class="section-title">
              <h2>核心价值观</h2>
              <p>我们坚持的经营理念</p>
            </div>
            
            <div class="values-grid">
              <template v-if="company.values && company.values.length > 0">
                <div
                  v-for="(value, index) in company.values"
                  :key="index"
                  class="value-card"
                >
                  <div class="value-icon">{{ value.icon }}</div>
                  <h3>{{ value.title }}</h3>
                  <p>{{ value.description }}</p>
                </div>
              </template>
                            <template v-else>
                <div class="value-card">
                  <div class="value-icon">💼</div>
                  <h3>诚信经营</h3>
                  <p>诚实守信是我们的立业之本，以透明合规的合作赢得客户长期信赖。</p>
                </div>
                <div class="value-card">
                  <div class="value-icon">🎯</div>
                  <h3>品质至上</h3>
                  <p>严格把控每一个细节，确保真空辐射干燥系统稳定可靠、性能卓越，为变压器提质保驾护航。</p>
                </div>
                <div class="value-card">
                  <div class="value-icon">🤝</div>
                  <h3>客户为先</h3>
                  <p>客户的需求是我们的追求，提供定制化干燥解决方案，助力企业降本增效。</p>
                </div>
                <div class="value-card">
                  <div class="value-icon">💡</div>
                  <h3>创新驱动</h3>
                  <p>不断创新，引领行业发展，颠覆传统变压器干燥模式，实现高效节能的绿色生产。</p>
                </div>
              </template>
            </div>
          </div>
        </template>
        
        <!-- 无数据后备 -->
        <template v-else>
          <div class="about-content">
            <div class="about-image"><span>C</span></div>
            <div class="about-text">
              <h2>关于我们</h2>
              <p>
                我们是一家专注于品质与服务的专业公司，拥有多年的行业经验和专业团队。
                我们始终坚持以客户为中心，致力于为客户提供最优质的产品和最满意的服务。
              </p>
              <p>
                我们的团队由一群充满激情和创造力的专业人士组成，我们不断追求卓越，
                努力为客户创造最大的价值。
              </p>
              
              <div class="about-stats">
                <div class="stat-item">
                  <div class="stat-number">10+</div>
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
        </template>
      </div>
    </section>

    <!-- 联系信息 -->
    <section class="section-contact">
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
import { ref, computed, onMounted } from 'vue'
import { apiGet } from '~/composables/useApi'
import { useMediaUrl } from '~/composables/useMediaUrl'
import { useSeo } from '~/composables/useSeo'

// 使用 SEO 配置
const { seo, fetchSeo } = useSeo()

// 公司数据类型
interface Company {
  id: number
  name: string
  companyNameEn: string
  foundedYear: string
  shortDescription: string
  aboutContent: string
  phone: string
  email: string
  address: string
  logo?: string
  qrcode?: string
  statistics: { years: string; customers: string; satisfaction: string }
  timeline: { year: string; title: string; description: string }[]
  values: { icon: string; title: string; description: string }[]
}

const company = ref<Company | null>(null)
const loading = ref(true)
const error = ref('')
const { normalizeMediaUrl } = useMediaUrl()

const companyLogoUrl = computed(() => normalizeMediaUrl(company.value?.logo))
const companyQrcodeUrl = computed(() => normalizeMediaUrl(company.value?.qrcode))

// 获取公司信息
const fetchCompany = async () => {
  try {
    loading.value = true
    const res = await apiGet<{ code: number; data: Company }>('/company')
    if (res.code === 200 || res.code === 0) {
      company.value = res.data
    }
  } catch (e: any) {
    error.value = e.message || '获取公司信息失败'
    console.error('获取公司信息失败:', e)
  } finally {
    loading.value = false
  }
}

// 页面加载时获取数据
onMounted(async () => {
  await fetchSeo()
  await fetchCompany()
})

// SEO 配置
useHead({
  title: computed(() => `关于我们 - ${seo.value.siteTitle}`),
  meta: [
    { name: 'description', content: '我们是一家专注于品质与服务的专业公司，拥有多年的行业经验和专业团队。' }
  ]
})
</script>

<style scoped>
.section-about-detail {
  padding: 60px 0;
  background: var(--bg-color);
}

.section-contact {
  padding: 48px 0 50px;
  background: linear-gradient(180deg, #f8fbff 0%, #f5f7fb 100%);
}

.loading, .error {
  text-align: center;
  padding: 60px;
  background: var(--white);
  border-radius: 12px;
  margin-bottom: 60px;
}

.loading {
  color: var(--text-secondary);
}

.error {
  color: var(--danger);
}

.about-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 60px;
  align-items: center;
  background: var(--white);
  padding: 40px;
  border-radius: 12px;
  box-shadow: var(--shadow);
  margin-bottom: 60px;
}

.about-image {
  height: 350px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.about-image img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  display: block;
  background: var(--white);
}

.about-image span {
  color: var(--white);
  font-size: 100px;
  line-height: 1;
}

.about-text h2 {
  font-size: 32px;
  margin-bottom: 20px;
}

.about-text p {
  color: var(--text-regular);
  margin-bottom: 15px;
  line-height: 1.8;
}

.timeline-section {
  margin-bottom: 60px;
}

.timeline {
  position: relative;
  max-width: 800px;
  margin: 0 auto;
}

.timeline::before {
  content: '';
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  width: 2px;
  height: 100%;
  background: var(--primary);
}

.timeline-item {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 30px;
  position: relative;
}

.timeline-year {
  width: 80px;
  height: 80px;
  background: var(--primary);
  color: var(--white);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  font-weight: bold;
  z-index: 1;
}

.timeline-content {
  width: 45%;
  background: var(--white);
  padding: 20px;
  border-radius: 8px;
  box-shadow: var(--shadow);
  margin-left: 20px;
}

.timeline-content h3 {
  margin-bottom: 10px;
  color: var(--text-primary);
}

.timeline-content p {
  color: var(--text-secondary);
}

.values-section {
  margin-bottom: 60px;
}

.values-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 30px;
}

.value-card {
  background: var(--white);
  padding: 30px;
  border-radius: 12px;
  text-align: center;
  box-shadow: var(--shadow);
  transition: all 0.3s;
}

.value-card:hover {
  transform: translateY(-5px);
  box-shadow: var(--shadow-hover);
}

.value-icon {
  font-size: 48px;
  margin-bottom: 15px;
}

.value-card h3 {
  margin-bottom: 10px;
  font-size: 18px;
}

.value-card p {
  color: var(--text-secondary);
  font-size: 14px;
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
  .about-content {
    grid-template-columns: 1fr;
    gap: 30px;
  }

  .about-image {
    height: 250px;
    order: -1;
  }

  .values-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .section-contact .contact-grid.contact-grid-has-qrcode {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 768px) {
  .section-about-detail {
    padding: 40px 0;
  }

  .about-content {
    padding: 20px;
  }

  .timeline::before {
    left: 40px;
  }

  .timeline-item {
    flex-direction: column;
    align-items: flex-start;
    padding-left: 80px;
  }

  .timeline-year {
    position: absolute;
    left: 0;
  }

  .timeline-content {
    width: 100%;
    margin-left: 0;
    margin-top: 10px;
  }

  .values-grid {
    grid-template-columns: 1fr;
  }

  .section-contact .contact-grid.contact-grid-has-qrcode {
    grid-template-columns: 1fr;
  }
}
</style>

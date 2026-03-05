<template>
  <div>
    <!-- 面包屑导航 -->
    <div class="breadcrumb">
      <div class="container">
        <div class="breadcrumb-list">
          <NuxtLink to="/">首页</NuxtLink>
          <span>/</span>
          <span class="current">荣誉资质</span>
        </div>
      </div>
    </div>

    <!-- 荣誉资质 -->
    <section class="section-certificates">
      <div class="container">
        <div class="section-title">
          <h2>荣誉资质</h2>
          <p>我们的资质认证和荣誉证书</p>
        </div>
        
        <!-- 加载中 -->
        <div v-if="loading" class="loading">
          <p>加载中...</p>
        </div>
        
        <!-- 错误提示 -->
        <div v-else-if="error" class="error">
          <p>{{ error }}</p>
        </div>
        
        <!-- 证书列表 -->
        <div v-else class="certificates-grid">
          <template v-if="honorCertificates.length > 0">
            <div
              v-for="cert in honorCertificates"
              :key="cert.id"
              class="certificate-card"
            >
              <div class="certificate-card-image">
                <img
                  v-if="getCertImage(cert)"
                  :src="getCertImage(cert)"
                  :alt="cert.title"
                  loading="lazy"
                >
                <span v-else>{{ cert.icon || '🏆' }}</span>
              </div>
              <div class="certificate-card-body">
                <h3 class="certificate-card-title">{{ cert.title }}</h3>
                <p class="certificate-card-desc">{{ cert.description }}</p>
              </div>
            </div>
          </template>
          <div v-else class="no-results">
            <p>暂无证书数据</p>
          </div>
        </div>

        <!-- 企业资质 -->
        <div class="qualifications-section">
          <div class="section-title">
            <h3>企业资质</h3>
          </div>
          
          <div class="qualifications-grid">
            <template v-if="qualificationCertificates.length > 0">
              <div
                v-for="cert in qualificationCertificates"
                :key="cert.id"
                class="certificate-card qualification-card"
              >
                <div class="certificate-card-image">
                  <img
                    v-if="getCertImage(cert)"
                    :src="getCertImage(cert)"
                    :alt="cert.title"
                    loading="lazy"
                  >
                  <span v-else>{{ cert.icon || '📜' }}</span>
                </div>
                <div class="certificate-card-body">
                  <h3 class="certificate-card-title">{{ cert.title }}</h3>
                  <p class="certificate-card-desc">{{ cert.number || cert.description }}</p>
                </div>
              </div>
            </template>
            <div v-else class="no-results qualification-empty">
              <p>暂无企业资质数据</p>
            </div>
          </div>
        </div>
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
import { useSeo } from '~/composables/useSeo'
import { useMediaUrl } from '~/composables/useMediaUrl'

// 使用 SEO 配置
const { seo, fetchSeo } = useSeo()
const { normalizeMediaUrl } = useMediaUrl()

// 证书数据类型
interface Certificate {
  id: number
  title: string
  type: string
  description: string
  image: string
  icon: string
  sortOrder: number
  isActive: boolean
  date: string
  number: string
}

interface Company {
  id: number
  phone: string
  email: string
  address: string
  qrcode?: string
}

const certificates = ref<Certificate[]>([])
const company = ref<Company | null>(null)
const loading = ref(true)
const error = ref('')
const honorCertificates = computed(() => certificates.value.filter((item) => item.type !== 'qualification'))
const qualificationCertificates = computed(() => certificates.value.filter((item) => item.type === 'qualification'))
const companyQrcodeUrl = computed(() => normalizeMediaUrl(company.value?.qrcode))

const getCertImage = (item: Certificate): string => {
  return normalizeMediaUrl(item.image)
}

// 获取证书列表
const fetchCertificates = async () => {
  try {
    loading.value = true
    const res = await apiGet<{ code: number; data: Certificate[] }>('/certificates/all')
    if (res.code === 200 || res.code === 0) {
      certificates.value = res.data || []
    }
  } catch (e: any) {
    error.value = e.message || '获取证书失败'
    console.error('获取证书失败:', e)
  } finally {
    loading.value = false
  }
}

const fetchCompany = async () => {
  try {
    const res = await apiGet<{ code: number; data: Company }>('/company')
    if (res.code === 200 || res.code === 0) {
      company.value = res.data
    }
  } catch (e) {
    console.error('获取公司信息失败:', e)
  }
}

// 页面加载时获取数据
onMounted(async () => {
  await Promise.all([fetchSeo(), fetchCompany(), fetchCertificates()])
})

// SEO 配置
useHead({
  title: computed(() => `荣誉资质 - ${seo.value.siteTitle}`),
  meta: [
    { name: 'description', content: '我们的资质认证和荣誉证书，展示公司的实力和信誉。' }
  ]
})
</script>

<style scoped>
.loading, .error, .no-results {
  text-align: center;
  padding: 60px;
  color: var(--text-secondary);
}

.error {
  color: var(--danger);
}

.qualifications-section {
  margin-top: 60px;
  padding-top: 40px;
  border-top: 1px solid var(--border-color);
}

.qualifications-section .section-title {
  margin-bottom: 30px;
}

.qualifications-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
}

.qualification-card {
  min-height: 100%;
}

@media (max-width: 1200px) {
  .qualifications-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 768px) {
  .qualifications-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 576px) {
  .qualifications-grid {
    grid-template-columns: 1fr;
  }
}

.qualification-empty {
  grid-column: 1 / -1;
  padding: 20px 0;
}

.section-contact {
  padding: 48px 0 50px;
  background: linear-gradient(180deg, #f8fbff 0%, #f5f7fb 100%);
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

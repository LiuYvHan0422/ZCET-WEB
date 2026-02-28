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
          <template v-if="certificates.length > 0">
            <div
              v-for="cert in certificates"
              :key="cert.id"
              class="certificate-card"
            >
              <div class="certificate-card-image">
                {{ cert.icon || '🏆' }}
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
            <div
              v-for="cert in certificates.filter(c => c.type === 'qualification')"
              :key="cert.id"
              class="qualification-item"
            >
              <div class="qualification-icon">{{ cert.icon || '📜' }}</div>
              <div class="qualification-info">
                <h4>{{ cert.title }}</h4>
                <p>{{ cert.number || cert.description }}</p>
              </div>
            </div>
            <!-- 后备静态数据 -->
            <div v-if="certificates.filter(c => c.type === 'qualification').length === 0" class="qualification-item">
              <div class="qualification-icon">📜</div>
              <div class="qualification-info">
                <h4>营业执照</h4>
                <p>统一社会信用代码：91310000XXXXXXXX</p>
              </div>
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
        
        <div class="contact-grid">
          <div class="contact-card">
            <div class="contact-card-icon">📞</div>
            <h3 class="contact-card-title">电话咨询</h3>
            <p class="contact-card-text">400-888-8888</p>
            <p class="contact-card-text">工作日 9:00-18:00</p>
          </div>
          
          <div class="contact-card">
            <div class="contact-card-icon">✉️</div>
            <h3 class="contact-card-title">邮件联系</h3>
            <p class="contact-card-text">info@example.com</p>
            <p class="contact-card-text">24小时内回复</p>
          </div>
          
          <div class="contact-card">
            <div class="contact-card-icon">📍</div>
            <h3 class="contact-card-title">公司地址</h3>
            <p class="contact-card-text">某某省某某市某某区</p>
            <p class="contact-card-text">某某路88号</p>
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

// 使用 SEO 配置
const { seo, fetchSeo } = useSeo()

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

const certificates = ref<Certificate[]>([])
const loading = ref(true)
const error = ref('')

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

// 页面加载时获取数据
onMounted(async () => {
  await fetchSeo()
  await fetchCertificates()
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
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}

.qualification-item {
  display: flex;
  align-items: center;
  gap: 20px;
  background: var(--white);
  padding: 20px;
  border-radius: 8px;
  box-shadow: var(--shadow);
}

.qualification-icon {
  font-size: 40px;
}

.qualification-info h4 {
  margin-bottom: 5px;
  color: var(--text-primary);
}

.qualification-info p {
  font-size: 14px;
  color: var(--text-secondary);
}

@media (max-width: 768px) {
  .qualifications-grid {
    grid-template-columns: 1fr;
  }
}
</style>

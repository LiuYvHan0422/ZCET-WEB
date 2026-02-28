<template>
  <div class="dashboard-page">
    <div class="page-header">
      <div>
        <h1 class="page-title">仪表盘</h1>
        <p class="page-subtitle">欢迎回来，{{ username }}！这是您的数据概览。</p>
      </div>
      <div style="display: flex; gap: 10px;">
        <button class="btn btn-outline" @click="exportData">📥 导出数据</button>
        <button class="btn btn-primary" @click="refreshData">🔄 刷新</button>
      </div>
    </div>

    <!-- 统计卡片 -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon blue">📦</div>
        <div class="stat-number">{{ stats.productCount }}</div>
        <div class="stat-label">商品总数</div>
        <div class="stat-trend up" v-if="stats.productTrend > 0">
          ↑ {{ stats.productTrend }}% 较上月
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon green">📰</div>
        <div class="stat-number">{{ stats.newsCount }}</div>
        <div class="stat-label">新闻文章</div>
        <div class="stat-trend up" v-if="stats.newsTrend > 0">
          ↑ {{ stats.newsTrend }}% 较上月
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon orange">📬</div>
        <div class="stat-number">{{ stats.inquiryCount }}</div>
        <div class="stat-label">询盘总数</div>
        <div class="stat-trend up" v-if="stats.inquiryTrend > 0">
          ↑ {{ stats.inquiryTrend }}% 较上月
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon purple">🏆</div>
        <div class="stat-number">{{ stats.certificateCount }}</div>
        <div class="stat-label">荣誉资质</div>
        <div class="stat-trend up" v-if="stats.certificateTrend > 0">
          ↑ {{ stats.certificateTrend }}% 较上月
        </div>
      </div>
    </div>

    <!-- 快捷操作 -->
    <div class="quick-actions">
      <h3>🚀 快捷操作</h3>
      <div class="actions-grid">
        <router-link to="/products/add" class="action-btn">
          <span class="icon">➕</span>
          <span>添加商品</span>
        </router-link>
        <router-link to="/news/add" class="action-btn">
          <span class="icon">📝</span>
          <span>发布新闻</span>
        </router-link>
        <router-link to="/certificates/add" class="action-btn">
          <span class="icon">🏅</span>
          <span>添加资质</span>
        </router-link>
        <router-link to="/inquiries" class="action-btn">
          <span class="icon">📧</span>
          <span>回复询盘</span>
        </router-link>
        <router-link to="/settings" class="action-btn">
          <span class="icon">⚙️</span>
          <span>系统设置</span>
        </router-link>
      </div>
    </div>

    <!-- 最近询盘 -->
    <div class="data-table-container">
      <div class="table-header">
        <div class="table-title">📬 最近询盘</div>
        <div class="table-actions">
          <router-link to="/inquiries" class="btn btn-outline btn-sm">
            查看全部
          </router-link>
        </div>
      </div>
      <table>
        <thead>
          <tr>
            <th>询盘ID</th>
            <th>客户姓名</th>
            <th>联系电话</th>
            <th>意向商品</th>
            <th>状态</th>
            <th>提交时间</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="inquiry in recentInquiries" :key="inquiry.id">
            <td>#INQ{{ String(inquiry.id).padStart(3, '0') }}</td>
            <td>{{ inquiry.customerName }}</td>
            <td>{{ inquiry.customerPhone }}</td>
            <td>{{ inquiry.productName }}</td>
            <td>
              <StatusBadge :status="inquiry.status" />
            </td>
            <td>{{ formatDate(inquiry.createdAt) }}</td>
            <td>
              <div class="action-btns">
                <router-link
                  :to="`/inquiries/${inquiry.id}`"
                  class="view"
                  title="查看"
                >👁️</router-link>
                <button class="reply" title="回复" @click="replyInquiry(inquiry)">📧</button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
      <div class="pagination">
        <span class="info">共 {{ stats.inquiryCount }} 条询盘</span>
        <template v-if="stats.inquiryCount > 0">
          <router-link to="/inquiries">&lt;</router-link>
          <router-link to="/inquiries" class="active">1</router-link>
          <router-link to="/inquiries" v-if="stats.inquiryCount > 5">2</router-link>
          <router-link to="/inquiries" v-if="stats.inquiryCount > 10">3</router-link>
          <router-link to="/inquiries">&gt;</router-link>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useAuth } from '@/composables/useAuth'
import { api } from '@/utils/request'
import { formatDate } from '@/utils/helpers'
import StatusBadge from '@/components/StatusBadge.vue'

const { user } = useAuth()

const username = computed(() => user.value?.nickname || user.value?.username || '管理员')

const stats = reactive({
  productCount: 0,
  productTrend: 0,
  newsCount: 0,
  newsTrend: 0,
  inquiryCount: 0,
  inquiryTrend: 0,
  certificateCount: 0,
  certificateTrend: 0,
  recentInquiries: 0,
  pendingInquiries: 0,
  repliedInquiries: 0
})

const recentInquiries = ref<any[]>([])

const fetchStats = async () => {
  try {
    const response = await api.get<any>('/dashboard/stats')

    // 后端返回格式: { code: 200, data: {...}, message: '获取成功' }
    if (response && response.code === 200 && response.data) {
      Object.assign(stats, response.data)
    }
  } catch (error) {
    console.error('获取统计数据失败:', error)
  }
}

const fetchRecentInquiries = async () => {
  try {
    const response = await api.get<any>('/dashboard/recent-inquiries?limit=5')

    // 后端返回格式: { code: 200, data: [...], message: '获取成功' }
    if (response && response.code === 200 && response.data) {
      recentInquiries.value = response.data
    }
  } catch (error) {
    console.error('获取最近询盘失败:', error)
  }
}

const refreshData = () => {
  fetchStats()
  fetchRecentInquiries()
}

const exportData = () => {
  alert('导出功能将在正式开发中实现')
}

const replyInquiry = (inquiry: any) => {
  alert(`回复询盘 #INQ${String(inquiry.id).padStart(3, '0')}`)
}

onMounted(() => {
  fetchStats()
  fetchRecentInquiries()
})
</script>

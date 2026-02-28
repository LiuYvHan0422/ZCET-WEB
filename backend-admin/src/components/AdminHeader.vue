<template>
  <header class="admin-header">
    <div class="header-left">
      <div class="breadcrumb">
        <router-link to="/">首页</router-link>
        <span>/</span>
        <span class="current">{{ currentTitle }}</span>
      </div>
    </div>
    <div class="header-right">
      <div class="notification-wrapper">
        <button class="header-icon" title="消息" @click="toggleNotifications">
          🔔
          <span class="badge" v-if="unreadCount > 0">{{ unreadCount > 99 ? '99+' : unreadCount }}</span>
        </button>
        <!-- 通知面板 -->
        <div class="notification-panel" v-if="showNotifications">
          <div class="panel-header">
            <h4>通知消息</h4>
            <button class="mark-read-btn" @click="markAllAsRead" v-if="notifications.length > 0">
              全部已读
            </button>
          </div>
          <div class="notification-list">
            <div v-if="loading" class="loading">加载中...</div>
            <div v-else-if="notifications.length === 0" class="empty">
              暂无通知
            </div>
            <div
              v-for="notification in notifications"
              :key="notification.id"
              class="notification-item"
              :class="{ unread: !notification.isRead }"
              @click="handleNotificationClick(notification)"
            >
              <div class="notification-icon" :class="notification.type">
                {{ getNotificationIcon(notification.type) }}
              </div>
              <div class="notification-content">
                <div class="notification-title">{{ notification.title }}</div>
                <div class="notification-text">{{ notification.content }}</div>
                <div class="notification-time">{{ formatTime(notification.createdAt) }}</div>
              </div>
              <button class="delete-btn" @click.stop="deleteNotification(notification.id)" title="删除">
                ✕
              </button>
            </div>
          </div>
          <div class="panel-footer" v-if="notifications.length > 0">
            <router-link to="/inquiries" @click="showNotifications = false">
              查看全部询盘
            </router-link>
          </div>
        </div>
      </div>
      <button class="header-icon" title="刷新" @click="refreshPage">
        🔄
      </button>
      <div class="user-info">
        <div class="user-avatar">{{ userInitial }}</div>
        <span class="user-name">{{ username }}</span>
        <div class="dropdown-menu">
          <a href="javascript:;" @click="goToProfile">👤 个人资料</a>
          <a href="javascript:;" @click="goToPassword">🔑 修改密码</a>
          <a href="javascript:;" @click="handleLogout">🚪 退出登录</a>
        </div>
      </div>
    </div>
    <!-- 点击其他地方关闭通知面板 -->
    <div class="overlay" v-if="showNotifications" @click="showNotifications = false"></div>
  </header>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { api } from '@/utils/request'
import { formatDate } from '@/utils/helpers'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const showNotifications = ref(false)
const unreadCount = ref(0)
const notifications = ref<any[]>([])
const loading = ref(false)

// 类型定义
interface Notification {
  id: number
  title: string
  content: string
  type: string
  link: string
  isRead: boolean
  relatedId: string
  createdAt: string
}

const username = computed(() => authStore.user?.nickname || authStore.user?.username || '管理员')
const userInitial = computed(() => username.value.charAt(0).toUpperCase())

const currentTitle = computed(() => {
  const titles: Record<string, string> = {
    Dashboard: '仪表盘',
    Products: '商品管理',
    ProductAdd: '添加商品',
    ProductEdit: '编辑商品',
    News: '新闻动态',
    NewsAdd: '发布新闻',
    NewsEdit: '编辑新闻',
    Certificates: '荣誉资质',
    CertificateAdd: '添加资质',
    CertificateEdit: '编辑资质',
    Inquiries: '询盘管理',
    InquiryDetail: '询盘详情',
    Company: '公司信息',
    Settings: '系统设置'
  }
  return titles[route.name as string] || ''
})

// 获取通知图标
const getNotificationIcon = (type: string) => {
  const icons: Record<string, string> = {
    inquiry: '📬',
    info: 'ℹ️',
    warning: '⚠️',
    success: '✅',
  }
  return icons[type] || '🔔'
}

// 格式化时间
const formatTime = (dateStr: string) => {
  const date = new Date(dateStr)
  const now = new Date()
  const diff = now.getTime() - date.getTime()

  if (diff < 60000) {
    return '刚刚'
  } else if (diff < 3600000) {
    return `${Math.floor(diff / 60000)} 分钟前`
  } else if (diff < 86400000) {
    return `${Math.floor(diff / 3600000)} 小时前`
  } else {
    return formatDate(dateStr)
  }
}

// 获取通知列表
const fetchNotifications = async () => {
  loading.value = true
  try {
    const response = await api.get<any>('/notifications')
    if (response && response.code === 200 && response.data) {
      notifications.value = response.data
    }
  } catch (error) {
    console.error('获取通知失败:', error)
  } finally {
    loading.value = false
  }
}

// 获取未读数量
const fetchUnreadCount = async () => {
  try {
    const response = await api.get<any>('/notifications/count')
    if (response && response.code === 200 && response.data) {
      unreadCount.value = response.data.count
    }
  } catch (error) {
    console.error('获取未读数量失败:', error)
  }
}

// 标记单个通知已读
const markAsRead = async (id: number) => {
  try {
    await api.put(`/notifications/${id}/read`)
    const notification = notifications.value.find(n => n.id === id)
    if (notification) {
      notification.isRead = true
      unreadCount.value = Math.max(0, unreadCount.value - 1)
    }
  } catch (error) {
    console.error('标记已读失败:', error)
  }
}

// 标记全部已读
const markAllAsRead = async () => {
  try {
    await api.put('/notifications/read-all')
    notifications.value.forEach(n => n.isRead = true)
    unreadCount.value = 0
  } catch (error) {
    console.error('标记全部已读失败:', error)
  }
}

// 删除通知
const deleteNotification = async (id: number) => {
  try {
    await api.delete(`/notifications/${id}`)
    const index = notifications.value.findIndex(n => n.id === id)
    if (index > -1) {
      if (!notifications.value[index].isRead) {
        unreadCount.value = Math.max(0, unreadCount.value - 1)
      }
      notifications.value.splice(index, 1)
    }
  } catch (error) {
    console.error('删除通知失败:', error)
  }
}

// 点击通知
const handleNotificationClick = (notification: Notification) => {
  if (!notification.isRead) {
    markAsRead(notification.id)
  }
  if (notification.link) {
    router.push(notification.link)
    showNotifications.value = false
  }
}

// 切换通知面板
const toggleNotifications = () => {
  showNotifications.value = !showNotifications.value
  if (showNotifications.value) {
    fetchNotifications()
  }
}

// 点击其他地方关闭
const handleClickOutside = (e: MouseEvent) => {
  const target = e.target as HTMLElement
  if (!target.closest('.notification-wrapper')) {
    showNotifications.value = false
  }
}

// 刷新页面
const refreshPage = () => {
  window.location.reload()
}

// 跳转到个人资料
const goToProfile = () => {
  router.push({ path: '/settings', query: { tab: 'profile' } })
}

// 跳转到修改密码
const goToPassword = () => {
  router.push({ path: '/settings', query: { tab: 'password' } })
}

// 退出登录
const handleLogout = async () => {
  if (confirm('确定要退出登录吗？')) {
    await authStore.logout()
    router.push('/login')
  }
}

// 轮询获取未读数量
let pollInterval: number | null = null

onMounted(() => {
  fetchUnreadCount()
  document.addEventListener('click', handleClickOutside)
  // 每 30 秒轮询一次未读数量
  pollInterval = window.setInterval(fetchUnreadCount, 30000)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
  if (pollInterval) {
    clearInterval(pollInterval)
  }
})
</script>

<style scoped>
.notification-wrapper {
  position: relative;
}

.notification-panel {
  position: absolute;
  top: 100%;
  right: 0;
  width: 380px;
  max-height: 500px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  overflow: hidden;
  margin-top: 10px;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #eee;
}

.panel-header h4 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.mark-read-btn {
  background: none;
  border: none;
  color: #667eea;
  font-size: 13px;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
}

.mark-read-btn:hover {
  background: #f0f4ff;
}

.notification-list {
  max-height: 380px;
  overflow-y: auto;
}

.loading,
.empty {
  padding: 40px 20px;
  text-align: center;
  color: #999;
}

.notification-item {
  display: flex;
  align-items: flex-start;
  padding: 14px 20px;
  border-bottom: 1px solid #f5f5f5;
  cursor: pointer;
  transition: background 0.2s;
  position: relative;
}

.notification-item:hover {
  background: #fafafa;
}

.notification-item.unread {
  background: #f0f4ff;
}

.notification-item.unread:hover {
  background: #e6ebff;
}

.notification-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  margin-right: 12px;
  flex-shrink: 0;
}

.notification-icon.inquiry {
  background: #e3f2fd;
}

.notification-icon.info {
  background: #e8f5e9;
}

.notification-icon.warning {
  background: #fff3e0;
}

.notification-icon.success {
  background: #e8f5e9;
}

.notification-content {
  flex: 1;
  min-width: 0;
}

.notification-title {
  font-size: 14px;
  font-weight: 600;
  color: #333;
  margin-bottom: 4px;
}

.notification-text {
  font-size: 13px;
  color: #666;
  line-height: 1.4;
  margin-bottom: 6px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.notification-time {
  font-size: 12px;
  color: #999;
}

.delete-btn {
  position: absolute;
  top: 10px;
  right: 10px;
  background: none;
  border: none;
  color: #ccc;
  cursor: pointer;
  font-size: 14px;
  opacity: 0;
  transition: all 0.2s;
  padding: 4px;
  border-radius: 4px;
}

.notification-item:hover .delete-btn {
  opacity: 1;
}

.delete-btn:hover {
  color: #f44336;
  background: #ffebee;
}

.panel-footer {
  padding: 12px 20px;
  border-top: 1px solid #eee;
  text-align: center;
}

.panel-footer a {
  color: #667eea;
  text-decoration: none;
  font-size: 13px;
}

.panel-footer a:hover {
  text-decoration: underline;
}

.overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 999;
}
</style>

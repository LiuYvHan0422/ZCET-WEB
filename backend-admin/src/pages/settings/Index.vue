<template>
  <div class="settings-page">
    <div class="page-header">
      <div>
        <h1 class="page-title">系统设置</h1>
        <p class="page-subtitle">管理后台系统设置，包括管理员账号、SEO 设置、安全设置等。</p>
      </div>
    </div>
    <div class="settings-container">
      <div class="settings-nav">
        <div class="nav-item" :class="{ active: activeTab === 'profile' }" @click="switchTab('profile')">👤 管理员资料</div>
        <div class="nav-item" :class="{ active: activeTab === 'password' }" @click="switchTab('password')">🔑 修改密码</div>
        <div class="nav-item" :class="{ active: activeTab === 'seo' }" @click="switchTab('seo')">🔍 SEO 设置</div>
        <div class="nav-item" :class="{ active: activeTab === 'security' }" @click="switchTab('security')">🛡️ 安全设置</div>
        <div class="nav-item" :class="{ active: activeTab === 'database' }" @click="switchTab('database')">🗄️ 数据库设置</div>
        <div class="nav-item" :class="{ active: activeTab === 'backup' }" @click="switchTab('backup')">💾 数据备份</div>
      </div>
      <div class="settings-content">
        <div class="card" v-if="activeTab === 'profile'">
          <div class="card-header">👤 管理员资料</div>
          <div class="card-body">
            <div class="form-group">
              <label>用户名</label>
              <input type="text" class="form-control" v-model="profile.username" disabled />
            </div>
            <div class="form-group">
              <label>昵称</label>
              <input type="text" class="form-control" v-model="profile.nickname" placeholder="请输入昵称" />
            </div>
            <div class="form-group">
              <label>电子邮箱</label>
              <input type="email" class="form-control" v-model="profile.email" placeholder="请输入电子邮箱" />
            </div>
            <div class="form-group">
              <label>手机号码</label>
              <input type="tel" class="form-control" v-model="profile.phone" placeholder="请输入手机号码" />
            </div>
            <div class="form-actions">
              <button class="btn btn-primary" @click="saveProfile">💾 保存资料</button>
            </div>
          </div>
        </div>
        <div class="card" v-if="activeTab === 'password'">
          <div class="card-header">🔑 修改密码</div>
          <div class="card-body">
            <div class="form-group">
              <label>当前密码</label>
              <input type="password" class="form-control" v-model="passwordForm.currentPassword" placeholder="请输入当前密码" />
            </div>
            <div class="form-group">
              <label>新密码</label>
              <input type="password" class="form-control" v-model="passwordForm.newPassword" placeholder="请输入新密码" />
            </div>
            <div class="form-group">
              <label>确认新密码</label>
              <input type="password" class="form-control" v-model="passwordForm.confirmPassword" placeholder="请再次输入新密码" />
            </div>
            <div class="form-actions">
              <button class="btn btn-primary" @click="changePassword">🔐 修改密码</button>
            </div>
          </div>
        </div>
        <div class="card" v-if="activeTab === 'seo'">
          <div class="card-header">🔍 SEO 设置</div>
          <div class="card-body">
            <div class="form-group">
              <label>网站标题</label>
              <input type="text" class="form-control" v-model="seo.siteTitle" placeholder="请输入网站标题" />
            </div>
            <div class="form-group">
              <label>网站描述</label>
              <textarea class="form-control" v-model="seo.siteDescription" rows="3" placeholder="请输入网站描述"></textarea>
            </div>
            <div class="form-group">
              <label>关键词</label>
              <input type="text" class="form-control" v-model="seo.keywords" placeholder="关键词1, 关键词2, 关键词3" />
            </div>
            <div class="form-actions">
              <button class="btn btn-primary" @click="saveSeo">💾 保存设置</button>
            </div>
          </div>
        </div>
        <div class="card" v-if="activeTab === 'security'">
          <div class="card-header">🛡️ 安全设置</div>
          <div class="card-body">
            <div class="form-group">
              <label class="switch-label">
                <input type="checkbox" v-model="security.twoFactorAuth" />
                <span class="switch-slider"></span>
                <span class="switch-text">启用两步验证</span>
              </label>
              <p class="hint">启用后登录时需要输入验证码</p>
            </div>
            <div class="form-group">
              <label class="switch-label">
                <input type="checkbox" v-model="security.loginAlert" />
                <span class="switch-slider"></span>
                <span class="switch-text">登录提醒</span>
              </label>
              <p class="hint">新设备登录时发送邮件提醒</p>
            </div>
            <div class="form-actions">
              <button class="btn btn-primary" @click="saveSecurity">💾 保存设置</button>
            </div>
          </div>
        </div>
        <div class="card" v-if="activeTab === 'database'">
          <div class="card-header">🗄️ 数据库设置</div>
          <div class="card-body">
            <div class="form-group">
              <label>数据库类型</label>
              <select class="form-control" v-model="database.dbType">
                <option value="mysql">MySQL</option>
                <option value="postgresql">PostgreSQL</option>
                <option value="sqlite">SQLite</option>
              </select>
            </div>
            <div class="form-group">
              <label>主机地址</label>
              <input type="text" class="form-control" v-model="database.dbHost" placeholder="请输入数据库主机地址" />
            </div>
            <div class="form-group">
              <label>端口</label>
              <input type="number" class="form-control" v-model="database.dbPort" placeholder="请输入数据库端口" />
            </div>
            <div class="form-group">
              <label>数据库名称</label>
              <input type="text" class="form-control" v-model="database.dbName" placeholder="请输入数据库名称" />
            </div>
            <div class="form-group">
              <label>用户名</label>
              <input type="text" class="form-control" v-model="database.dbUsername" placeholder="请输入数据库用户名" />
            </div>
            <div class="form-group">
              <label>密码</label>
              <input type="password" class="form-control" v-model="database.dbPassword" placeholder="请输入数据库密码" />
            </div>
            <div class="form-actions">
              <button class="btn btn-primary" @click="saveDatabase">💾 保存设置</button>
            </div>
          </div>
        </div>
        <div class="card" v-if="activeTab === 'backup'">
          <div class="card-header">💾 数据备份</div>
          <div class="card-body">
            <div class="backup-info">
              <div class="info-item">
                <span class="label">最近备份时间</span>
                <span class="value">{{ backup.lastBackup || '暂无备份' }}</span>
              </div>
              <div class="info-item">
                <span class="label">备份状态</span>
                <span class="value status" :class="backup.status">{{ backup.status || '未备份' }}</span>
              </div>
            </div>
            <div class="backup-actions">
              <button class="btn btn-primary" @click="createBackup" :disabled="backingUp">📦 {{ backingUp ? '备份中...' : '立即备份' }}</button>
              <button class="btn btn-outline" @click="restoreBackup" :disabled="restoring">♻️ {{ restoring ? '恢复中...' : '恢复数据' }}</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, reactive, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth'
import { api } from '@/utils/request'

const route = useRoute()
const router = useRouter()
const { user } = useAuth()
const activeTab = ref('profile')
const saving = ref(false)

// 类型定义
interface Profile {
  username: string
  nickname: string
  email: string
  phone: string
}

interface PasswordForm {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

interface SeoSettings {
  siteTitle: string
  siteDescription: string
  keywords: string
}

interface SecuritySettings {
  twoFactorAuth: boolean
  loginAlert: boolean
}

interface BackupInfo {
  lastBackup: string
  status: string
}

interface DatabaseSettings {
  dbHost: string
  dbPort: number
  dbUsername: string
  dbPassword: string
  dbName: string
  dbType: string
}

const profile = reactive<Profile>({ username: '', nickname: '', email: '', phone: '' })
const passwordForm = reactive<PasswordForm>({ currentPassword: '', newPassword: '', confirmPassword: '' })
const seo = reactive<SeoSettings>({ siteTitle: '', siteDescription: '', keywords: '' })
const security = reactive<SecuritySettings>({ twoFactorAuth: false, loginAlert: true })
const backup = reactive<BackupInfo>({ lastBackup: '', status: '' })
const database = reactive<DatabaseSettings>({ dbHost: '', dbPort: 3306, dbUsername: '', dbPassword: '', dbName: '', dbType: 'mysql' })
const backingUp = ref(false)
const restoring = ref(false)

// 获取管理员资料
const fetchProfile = async () => {
  try {
    const res = await api.get('/admins/profile')
    if (res.data) {
      Object.assign(profile, {
        username: res.data.username || user.value?.username || '',
        nickname: res.data.nickname || '',
        email: res.data.email || '',
        phone: res.data.phone || ''
      })
    }
  } catch (error) {
    console.error('获取管理员资料失败:', error)
  }
}

// 获取 SEO 设置
const fetchSeo = async () => {
  try {
    const res = await api.get('/settings/seo')
    if (res.data) {
      Object.assign(seo, {
        siteTitle: res.data.siteTitle || '',
        siteDescription: res.data.siteDescription || '',
        keywords: res.data.keywords || ''
      })
    }
  } catch (error) {
    console.error('获取 SEO 设置失败:', error)
  }
}

// 获取安全设置
const fetchSecurity = async () => {
  try {
    const res = await api.get('/settings/security')
    if (res.data) {
      Object.assign(security, {
        twoFactorAuth: res.data.twoFactorAuth || false,
        loginAlert: res.data.loginAlert !== false
      })
    }
  } catch (error) {
    console.error('获取安全设置失败:', error)
  }
}

// 获取备份信息
const fetchBackup = async () => {
  try {
    const res = await api.get('/settings/backup')
    if (res.data) {
      backup.lastBackup = res.data.lastBackupAt ? new Date(res.data.lastBackupAt).toLocaleString() : ''
      backup.status = res.data.lastBackupAt ? 'success' : ''
    }
  } catch (error) {
    console.error('获取备份信息失败:', error)
  }
}

// 获取数据库设置
const fetchDatabase = async () => {
  try {
    const res = await api.get('/settings/database')
    if (res.data) {
      Object.assign(database, {
        dbHost: res.data.dbHost || '',
        dbPort: res.data.dbPort || 3306,
        dbUsername: res.data.dbUsername || '',
        dbName: res.data.dbName || '',
        dbType: res.data.dbType || 'mysql'
      })
    }
  } catch (error) {
    console.error('获取数据库设置失败:', error)
  }
}

// 切换 tab 时获取对应数据
const switchTab = (tab: string) => {
  activeTab.value = tab
  router.replace({ query: { tab } })
}

watch(activeTab, (tab) => {
  switch (tab) {
    case 'profile':
      fetchProfile()
      break
    case 'seo':
      fetchSeo()
      break
    case 'security':
      fetchSecurity()
      break
    case 'database':
      fetchDatabase()
      break
    case 'backup':
      fetchBackup()
      break
  }
})

// 监听路由 query 参数变化
watch(() => route.query.tab, (newTab) => {
  if (newTab && typeof newTab === 'string' && ['profile', 'password', 'seo', 'security', 'database', 'backup'].includes(newTab)) {
    activeTab.value = newTab
  }
}, { immediate: true })

// 保存管理员资料
const saveProfile = async () => {
  saving.value = true
  try {
    await api.put('/admins/profile', profile)
    alert('资料保存成功！')
  } catch (error) {
    alert('保存失败')
  } finally {
    saving.value = false
  }
}

// 修改密码
const changePassword = async () => {
  if (passwordForm.newPassword !== passwordForm.confirmPassword) {
    alert('两次输入的密码不一致')
    return
  }
  saving.value = true
  try {
    const res = await api.put<{ code: number; message: string }>('/admin/password', {
      oldPassword: passwordForm.currentPassword,
      newPassword: passwordForm.newPassword
    })
    if (res.code === 200) {
      alert('密码修改成功！')
      Object.assign(passwordForm, { currentPassword: '', newPassword: '', confirmPassword: '' })
    } else {
      alert(res.message || '修改失败')
    }
  } catch (error: any) {
    const message = error.response?.data?.message || error.message || '修改失败'
    alert(message)
  } finally {
    saving.value = false
  }
}

// 保存 SEO 设置
const saveSeo = async () => {
  saving.value = true
  try {
    await api.put('/settings/seo', seo)
    alert('SEO 设置保存成功！')
  } catch (error) {
    alert('保存失败')
  } finally {
    saving.value = false
  }
}

// 保存安全设置
const saveSecurity = async () => {
  saving.value = true
  try {
    await api.put('/settings/security', security)
    alert('安全设置保存成功！')
  } catch (error) {
    alert('保存失败')
  } finally {
    saving.value = false
  }
}

// 保存数据库设置
const saveDatabase = async () => {
  saving.value = true
  try {
    await api.put('/settings/database', database)
    alert('数据库设置保存成功！')
  } catch (error) {
    alert('保存失败')
  } finally {
    saving.value = false
  }
}

// 创建备份
const createBackup = async () => {
  backingUp.value = true
  try {
    await api.post('/backup/create')
    alert('备份创建成功！')
    backup.lastBackup = new Date().toLocaleString()
    backup.status = 'success'
  } catch (error) {
    alert('备份失败')
    backup.status = 'failed'
  } finally {
    backingUp.value = false
  }
}

// 恢复备份
const restoreBackup = async () => {
  if (!confirm('确定要恢复数据吗？这将覆盖当前数据！')) return
  restoring.value = true
  try {
    await api.post('/backup/restore')
    alert('数据恢复成功！')
  } catch (error) {
    alert('恢复失败')
  } finally {
    restoring.value = false
  }
}

// 初始化
onMounted(() => {
  profile.username = user.value?.username || ''
  fetchProfile()
})
</script>

<style scoped>
.settings-container { display: grid; grid-template-columns: 220px 1fr; gap: 24px; }
.settings-nav { background: var(--white); border-radius: var(--radius-lg); box-shadow: var(--shadow); padding: 10px; height: fit-content; }
.nav-item { padding: 12px 16px; border-radius: var(--radius-md); cursor: pointer; transition: all 0.3s; font-size: 14px; color: var(--text-primary); }
.nav-item:hover { background: var(--bg-color); }
.nav-item.active { background: var(--primary); color: white; }
.card { background: var(--white); border-radius: var(--radius-lg); box-shadow: var(--shadow); }
.card-header { padding: 20px 24px; border-bottom: 1px solid var(--border-color); font-size: 16px; font-weight: 600; }
.card-body { padding: 24px; }
.form-actions { margin-top: 24px; padding-top: 20px; border-top: 1px solid var(--border-color); }
.switch-label { display: flex; align-items: center; gap: 12px; cursor: pointer; }
.switch-label input { display: none; }
.switch-slider { width: 44px; height: 24px; background: #ccc; border-radius: 24px; position: relative; transition: all 0.3s; }
.switch-slider::before { content: ''; position: absolute; width: 20px; height: 20px; background: white; border-radius: 50%; top: 2px; left: 2px; transition: all 0.3s; }
.switch-label input:checked + .switch-slider { background: var(--primary); }
.switch-label input:checked + .switch-slider::before { transform: translateX(20px); }
.switch-text { font-size: 14px; color: var(--text-primary); }
.hint { font-size: 12px; color: var(--text-secondary); margin-top: 6px; }
.backup-info { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; margin-bottom: 24px; }
.info-item { padding: 16px; background: var(--bg-color); border-radius: var(--radius-md); }
.info-item .label { display: block; font-size: 12px; color: var(--text-secondary); margin-bottom: 8px; }
.info-item .value { font-size: 16px; font-weight: 600; color: var(--text-primary); }
.info-item .value.status.success { color: var(--success); }
.backup-actions { display: flex; gap: 10px; }
@media (max-width: 768px) { .settings-container { grid-template-columns: 1fr; } }
</style>

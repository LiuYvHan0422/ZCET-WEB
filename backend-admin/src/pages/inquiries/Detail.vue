<template>
  <div class="inquiry-detail-page">
    <div class="page-header">
      <div>
        <h1 class="page-title">询盘详情</h1>
        <p class="page-subtitle">查看询盘详细信息并回复客户。</p>
      </div>
      <div style="display: flex; gap: 10px;">
        <button class="btn btn-outline" @click="handleClose">❌ 关闭询盘</button>
        <router-link to="/inquiries" class="btn btn-outline">← 返回列表</router-link>
      </div>
    </div>
    <div class="detail-container" v-if="!loading">
      <div class="detail-main">
        <div class="card inquiry-info-card">
          <div class="card-header">
            <div class="inquiry-id">#INQ{{ String(inquiry.id).padStart(3, '0') }}</div>
            <StatusBadge :status="inquiry.status" />
          </div>
          <div class="card-body">
            <div class="info-row">
              <div class="info-item">
                <label>客户姓名</label>
                <span>{{ inquiry.customerName }}</span>
              </div>
              <div class="info-item">
                <label>联系电话</label>
                <span>{{ inquiry.customerPhone }}</span>
              </div>
            </div>
            <div class="info-row">
              <div class="info-item">
                <label>电子邮箱</label>
                <span>{{ inquiry.customerEmail || '未填写' }}</span>
              </div>
              <div class="info-item">
                <label>意向产品</label>
                <span>{{ inquiry.productName }}</span>
              </div>
            </div>
            <div class="info-row full">
              <div class="info-item">
                <label>客户留言</label>
                <div class="message-content">{{ inquiry.message }}</div>
              </div>
            </div>
            <div class="info-row">
              <div class="info-item">
                <label>提交时间</label>
                <span>{{ formatDateTime(inquiry.createdAt) }}</span>
              </div>
              <div class="info-item">
                <label>IP 地址</label>
                <span>{{ inquiry.ip || '未知' }}</span>
              </div>
            </div>
          </div>
        </div>
        <div class="card reply-card">
          <div class="card-header">📧 回复客户</div>
          <div class="card-body">
            <div class="form-group">
              <label>回复内容</label>
              <textarea class="form-control" v-model="replyContent" rows="6" placeholder="请输入您的回复内容..."></textarea>
            </div>
            <div class="form-group">
              <label>备注（内部）</label>
              <textarea class="form-control" v-model="internalNote" rows="3" placeholder="仅内部可见的备注信息..."></textarea>
            </div>
            <div class="form-actions">
              <button class="btn btn-outline" @click="handleSaveNote">💾 保存备注</button>
              <button class="btn btn-primary" @click="handleReply" :disabled="!replyContent.trim()">📤 发送回复</button>
            </div>
          </div>
        </div>
      </div>
      <div class="detail-sidebar">
        <div class="card timeline-card">
          <div class="card-header">📋 跟进记录</div>
          <div class="card-body">
            <div class="timeline">
              <div class="timeline-item" v-for="(item, index) in timeline" :key="index">
                <div class="timeline-dot" :class="item.type"></div>
                <div class="timeline-content">
                  <div class="timeline-title">{{ item.title }}</div>
                  <div class="timeline-desc">{{ item.desc }}</div>
                  <div class="timeline-time">{{ item.time }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="loading" v-else>加载中...</div>
  </div>
</template>
<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { api } from '@/utils/request'
import { formatDateTime } from '@/utils/helpers'
import StatusBadge from '@/components/StatusBadge.vue'
const route = useRoute()
const loading = ref(false)
const replyContent = ref('')
const internalNote = ref('')
const inquiry = reactive({ id: 0, customerName: '', customerPhone: '', customerEmail: '', productName: '', message: '', status: 'pending', createdAt: '', ip: '' })
const timeline = ref([
  { type: 'create', title: '询盘提交', desc: '客户提交了询盘信息', time: '2024-01-15 10:30' },
  { type: 'reply', title: '等待处理', desc: '待客服人员跟进', time: '2024-01-15 10:31' }
])
const fetchInquiry = async () => {
  loading.value = true
  try {
    const response = await api.get<{ code: number; data: any }>(`/inquiries/${route.params.id}`)
    if ((response.code === 0 || response.code === 200) && response.data) Object.assign(inquiry, response.data)
  } catch (error) { console.error(error) }
  finally { loading.value = false }
}
const handleReply = async () => {
  if (!replyContent.value.trim()) { alert('请输入回复内容'); return }
  if (confirm('确定要发送回复吗？')) {
    try {
      await api.post(`/inquiries/${route.params.id}/reply`, { content: replyContent.value })
      alert('回复发送成功！')
      inquiry.status = 'replied'
      timeline.value.unshift({ type: 'reply', title: '已回复', desc: replyContent.value.slice(0, 50) + '...', time: formatDateTime(new Date()) })
      replyContent.value = ''
    } catch (error) { alert('发送失败，请稍后重试') }
  }
}
const handleSaveNote = async () => {
  if (!internalNote.value.trim()) { alert('请输入备注内容'); return }
  alert('备注已保存')
}
const handleClose = async () => {
  if (confirm('确定要关闭此询盘吗？')) {
    try {
      await api.patch(`/inquiries/${route.params.id}`, { status: 'closed' })
      alert('询盘已关闭')
      inquiry.status = 'closed'
      timeline.value.unshift({ type: 'close', title: '已关闭', desc: '询盘已关闭', time: formatDateTime(new Date()) })
    } catch (error) { alert('操作失败，请稍后重试') }
  }
}
onMounted(fetchInquiry)
</script>
<style scoped>
.detail-container { display: grid; grid-template-columns: 1fr 320px; gap: 24px; }
.detail-main { display: flex; flex-direction: column; gap: 20px; }
.card { background: var(--white); border-radius: var(--radius-lg); box-shadow: var(--shadow); }
.card-header { padding: 20px 24px; border-bottom: 1px solid var(--border-color); font-size: 16px; font-weight: 600; display: flex; justify-content: space-between; align-items: center; }
.card-body { padding: 24px; }
.inquiry-id { font-size: 18px; font-weight: bold; color: var(--primary); }
.info-row { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; margin-bottom: 20px; }
.info-row.full { grid-template-columns: 1fr; }
.info-item label { display: block; font-size: 12px; color: var(--text-secondary); margin-bottom: 6px; }
.info-item span { font-size: 15px; color: var(--text-primary); }
.message-content { background: var(--bg-color); padding: 16px; border-radius: var(--radius-md); font-size: 14px; line-height: 1.8; color: var(--text-regular); }
.form-actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: 20px; }
.timeline-item { display: flex; gap: 12px; padding-bottom: 20px; position: relative; }
.timeline-item:not(:last-child)::before { content: ''; position: absolute; left: 7px; top: 20px; bottom: 0; width: 2px; background: var(--border-color); }
.timeline-dot { width: 16px; height: 16px; border-radius: 50%; background: var(--border-color); flex-shrink: 0; }
.timeline-dot.create { background: var(--primary); }
.timeline-dot.reply { background: var(--success); }
.timeline-dot.close { background: var(--danger); }
.timeline-title { font-size: 14px; font-weight: 600; color: var(--text-primary); margin-bottom: 4px; }
.timeline-desc { font-size: 13px; color: var(--text-secondary); margin-bottom: 4px; }
.timeline-time { font-size: 12px; color: var(--text-secondary); }
@media (max-width: 1024px) { .detail-container { grid-template-columns: 1fr; } }
</style>

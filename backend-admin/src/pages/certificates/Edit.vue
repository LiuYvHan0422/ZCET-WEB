<template>
  <div class="certificate-edit-page">
    <div class="page-header">
      <div>
        <h1 class="page-title">编辑资质</h1>
        <p class="page-subtitle">编辑资质信息。</p>
      </div>
    </div>
    <div class="form-container" v-if="!loading">
      <form @submit.prevent="handleSubmit">
        <div class="form-section">
          <div class="section-title">📋 基本信息</div>
          <div class="form-group">
            <label>资质名称 <span class="required">*</span></label>
            <input type="text" class="form-control" v-model="form.name" placeholder="请输入资质名称" required />
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>类型 <span class="required">*</span></label>
              <select class="form-control" v-model="form.type" required>
                <option value="">请选择类型</option>
                <option value="patent">专利证书</option>
                <option value="iso">体系认证</option>
                <option value="award">获奖荣誉</option>
                <option value="other">其他资质</option>
              </select>
            </div>
            <div class="form-group">
              <label>颁发/到期日期</label>
              <input type="date" class="form-control" v-model="form.date" />
            </div>
          </div>
          <div class="form-group">
            <label>编号/专利号</label>
            <input type="text" class="form-control" v-model="form.number" placeholder="如：ZL202410123456" />
          </div>
        </div>
        <div class="form-section">
          <div class="section-title">🖼️ 资质图片</div>
          <Upload v-model="form.image" type="certificates" hint="建议尺寸：800x600像素" />
        </div>
        <div class="form-section">
          <div class="section-title">📝 详细说明</div>
          <textarea class="form-control" v-model="form.description" rows="4" placeholder="请输入资质详细说明"></textarea>
        </div>
        <div class="form-section">
          <div class="section-title">⚙️ 状态设置</div>
          <div class="form-group">
            <label class="switch-label">
              <input type="checkbox" v-model="form.isActive" />
              <span class="switch-slider"></span>
              <span class="switch-text">展示该资质</span>
            </label>
          </div>
        </div>
        <div class="form-actions">
          <button type="button" class="btn btn-outline" @click="handleReset">重置</button>
          <button type="submit" class="btn btn-primary" :disabled="submitting">{{ submitting ? '保存中...' : '保存修改' }}</button>
        </div>
      </form>
    </div>
    <div class="loading" v-else>加载中...</div>
  </div>
</template>
<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { api } from '@/utils/request'
import Upload from '@/components/Upload.vue'
const route = useRoute()
const router = useRouter()
const loading = ref(false)
const submitting = ref(false)
const form = reactive({ name: '', type: '', date: '', number: '', image: '', description: '', isActive: true })
const fetchCert = async () => {
  loading.value = true
  try {
    const response = await api.get<any>(`/certificates/${route.params.id}`)
    // 兼容两种响应格式：1. { code: 200, data: {...} }  2. 直接返回 {...}
    const data = response?.data || response
    
    if (data && data.id) {
      // 字段映射：将后端字段转换为前端表单字段
      form.name = data.title || data.name || ''
      form.type = data.type || ''
      form.date = data.date || ''
      form.number = data.number || ''
      form.image = data.image || ''
      form.description = data.description || ''
      form.isActive = data.isActive !== undefined ? data.isActive : true
    }
  } catch (error) { console.error(error) }
  finally { loading.value = false }
}
const handleSubmit = async () => {
  if (!form.name || !form.type) { alert('请填写必填字段'); return }
  submitting.value = true
  try {
    // 字段映射：将前端表单字段转换为后端 DTO 字段
    const submitData = {
      // 前端 name -> 后端 title
      title: form.name,
      type: form.type,
      date: form.date || '',
      number: form.number || '',
      description: form.description || '',
      image: form.image || '',
      isActive: form.isActive
    }
    
    const response = await api.patch<{ code: number; message: string }>(`/certificates/${route.params.id}`, submitData)
    if (response.code === 0 || response.code === 200) { alert('资质更新成功！'); router.push('/certificates') }
    else { alert(response.message || '更新失败') }
  } catch (error) { alert('更新失败，请稍后重试') }
  finally { submitting.value = false }
}
const handleReset = () => { if (confirm('确定要重置吗？')) fetchCert() }
onMounted(fetchCert)
</script>
<style scoped>
.form-container { background: var(--white); border-radius: var(--radius-lg); box-shadow: var(--shadow); }
.form-section { padding: 24px; border-bottom: 1px solid var(--border-color); }
.form-section:last-child { border-bottom: none; }
.section-title { font-size: 16px; font-weight: 600; color: var(--text-primary); margin-bottom: 20px; }
.form-row { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; }
.required { color: var(--danger); }
.switch-label { display: flex; align-items: center; gap: 12px; cursor: pointer; }
.switch-label input { display: none; }
.switch-slider { width: 44px; height: 24px; background: #ccc; border-radius: 24px; position: relative; transition: all 0.3s; }
.switch-slider::before { content: ''; position: absolute; width: 20px; height: 20px; background: white; border-radius: 50%; top: 2px; left: 2px; transition: all 0.3s; }
.switch-label input:checked + .switch-slider { background: var(--primary); }
.switch-label input:checked + .switch-slider::before { transform: translateX(20px); }
.switch-text { font-size: 14px; color: var(--text-primary); }
.form-actions { padding: 20px 24px; background: var(--bg-color); display: flex; justify-content: flex-end; gap: 10px; border-radius: 0 0 var(--radius-lg) var(--radius-lg); }
</style>

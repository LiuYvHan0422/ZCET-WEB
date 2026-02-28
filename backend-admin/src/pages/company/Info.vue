<template>
  <div class="company-info-page">
    <div class="page-header">
      <div>
        <h1 class="page-title">公司信息</h1>
        <p class="page-subtitle">设置公司基本信息，联系方式等内容。</p>
      </div>
      <button class="btn btn-primary" @click="handleSave" :disabled="saving">💾 保存设置</button>
    </div>
    <div class="form-container">
      <form @submit.prevent="handleSave">
        <div class="form-section">
          <div class="section-title">🏢 公司基本信息</div>
          <div class="form-group">
            <label>公司名称</label>
            <input type="text" class="form-control" v-model="form.name" placeholder="请输入公司名称" />
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>英文名称</label>
              <input type="text" class="form-control" v-model="form.companyNameEn" placeholder="Company Name" />
            </div>
            <div class="form-group">
              <label>成立年份</label>
              <input type="number" class="form-control" v-model="form.foundedYear" placeholder="如：2010" />
            </div>
          </div>
          <div class="form-group">
            <label>公司简介</label>
            <textarea class="form-control" v-model="form.shortDescription" rows="3" placeholder="请输入公司简介简述"></textarea>
          </div>
        </div>
        <div class="form-section">
          <div class="section-title">📝 公司详细介绍</div>
          <div class="form-group">
            <textarea class="form-control" v-model="form.aboutContent" rows="10" placeholder="请输入公司详细介绍"></textarea>
          </div>
        </div>
        <div class="form-section">
          <div class="section-title">📞 联系方式</div>
          <div class="form-row">
            <div class="form-group">
              <label>联系人</label>
              <input type="text" class="form-control" v-model="form.contactName" placeholder="请输入联系人姓名" />
            </div>
            <div class="form-group">
              <label>联系电话</label>
              <input type="tel" class="form-control" v-model="form.phone" placeholder="请输入联系电话" />
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>电子邮箱</label>
              <input type="email" class="form-control" v-model="form.email" placeholder="请输入电子邮箱" />
            </div>
            <div class="form-group">
              <label>传真号码</label>
              <input type="tel" class="form-control" v-model="form.fax" placeholder="请输入传真号码" />
            </div>
          </div>
          <div class="form-group">
            <label>公司地址</label>
            <input type="text" class="form-control" v-model="form.address" placeholder="请输入公司地址" />
          </div>
        </div>
        <div class="form-section">
          <div class="section-title">🌐 社交媒体</div>
          <div class="form-row">
            <div class="form-group">
              <label>微信</label>
              <input type="text" class="form-control" v-model="form.wechat" placeholder="请输入微信号" />
            </div>
            <div class="form-group">
              <label>微信公众号</label>
              <input type="text" class="form-control" v-model="form.wechatOfficial" placeholder="请输入公众号名称" />
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>抖音</label>
              <input type="text" class="form-control" v-model="form.douyin" placeholder="请输入抖音号" />
            </div>
            <div class="form-group">
              <label>小红书</label>
              <input type="text" class="form-control" v-model="form.xiaohongshu" placeholder="请输入小红书号" />
            </div>
          </div>
        </div>
        <div class="form-section">
          <div class="section-title">🖼️ 公司图片</div>
          <div class="form-row">
            <div class="form-group half">
              <label>公司 Logo</label>
              <Upload v-model="form.logo" type="company" hint="建议尺寸：200x60像素" />
            </div>
            <div class="form-group half">
              <label>公司二维码</label>
              <Upload v-model="form.qrcode" type="company" hint="建议尺寸：200x200像素" />
            </div>
          </div>
        </div>
      </form>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { api } from '@/utils/request'
import Upload from '@/components/Upload.vue'

const saving = ref(false)
const form = reactive({
  name: '', companyNameEn: '', foundedYear: '', shortDescription: '', aboutContent: '',
  contactName: '', phone: '', email: '', fax: '', address: '', wechat: '', wechatOfficial: '', douyin: '', xiaohongshu: '',
  logo: '', qrcode: ''
})

const handleSave = async () => {
  saving.value = true
  try {
    const response = await api.put<{ code: number; message: string }>('/company', form)
    if (response.code === 0 || response.code === 200) alert('公司信息保存成功！')
    else alert(response.message || '保存失败')
  } catch (error) { alert('保存失败，请稍后重试') }
  finally { saving.value = false }
}

onMounted(async () => {
  try {
    const response = await api.get<{ code: number; data: any }>('/company')
    if ((response.code === 0 || response.code === 200) && response.data) {
      // 将后端的 name 映射到前端的 name
      Object.assign(form, response.data)
      if (response.data.name) form.name = response.data.name
    }
  } catch (error) { console.error(error) }
})
</script>
<style scoped>
.form-container { background: var(--white); border-radius: var(--radius-lg); box-shadow: var(--shadow); }
.form-section { padding: 24px; border-bottom: 1px solid var(--border-color); }
.form-section:last-child { border-bottom: none; }
.section-title { font-size: 16px; font-weight: 600; color: var(--text-primary); margin-bottom: 20px; }
.form-row { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; }
.form-group.half { grid-column: span 1; }
textarea.form-control { min-height: 200px; resize: vertical; }
@media (max-width: 768px) { .form-row { grid-template-columns: 1fr; } }
</style>

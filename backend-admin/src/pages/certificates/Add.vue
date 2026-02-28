<template>
  <div class="certificate-add-page">
    <div class="page-header">
      <div>
        <h1 class="page-title">添加资质</h1>
        <p class="page-subtitle">添加新的荣誉资质或证书。</p>
      </div>
    </div>

    <div class="form-container">
      <form @submit.prevent="handleSubmit">
        <div class="form-section">
          <div class="section-title">基本信息</div>
          <div class="form-group">
            <label>资质名称 <span class="required">*</span></label>
            <input v-model="form.name" type="text" class="form-control" placeholder="请输入资质名称" required />
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>类型 <span class="required">*</span></label>
              <select v-model="form.type" class="form-control" required>
                <option value="">请选择类型</option>
                <option value="patent">专利证书</option>
                <option value="iso">体系认证</option>
                <option value="award">获奖荣誉</option>
                <option value="other">其他资质</option>
              </select>
            </div>
            <div class="form-group">
              <label>颁发/到期日期</label>
              <input v-model="form.date" type="date" class="form-control" />
            </div>
          </div>
          <div class="form-group">
            <label>编号/专利号</label>
            <input v-model="form.number" type="text" class="form-control" placeholder="如：ZL202410123456" />
          </div>
        </div>

        <div class="form-section">
          <div class="section-title">资质图片</div>
          <Upload
            v-model="form.image"
            type="certificates"
            hint="建议尺寸：800x600像素，支持 JPG、PNG 格式"
          />
        </div>

        <div class="form-section">
          <div class="section-title">详细说明</div>
          <textarea
            v-model="form.description"
            class="form-control"
            rows="4"
            placeholder="请输入资质详细说明"
          />
        </div>

        <div class="form-section">
          <div class="section-title">状态设置</div>
          <div class="form-group">
            <label class="switch-label">
              <input v-model="form.isActive" type="checkbox" />
              <span class="switch-slider"></span>
              <span class="switch-text">展示该资质</span>
            </label>
          </div>
        </div>

        <div class="form-actions">
          <button type="button" class="btn btn-outline" @click="handleReset">重置</button>
          <button type="submit" class="btn btn-primary" :disabled="submitting">
            {{ submitting ? '保存中...' : '保存资质' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { api } from '@/utils/request';
import Upload from '@/components/Upload.vue';

const router = useRouter();
const submitting = ref(false);
const form = reactive({
  name: '',
  type: '',
  date: '',
  number: '',
  image: '',
  description: '',
  isActive: true,
});

const handleSubmit = async () => {
  if (!form.name || !form.type) {
    alert('请填写必填字段');
    return;
  }

  submitting.value = true;
  try {
    const submitData = {
      title: form.name,
      type: form.type,
      date: form.date || '',
      number: form.number || '',
      image: form.image || '',
      description: form.description || '',
      isActive: form.isActive,
    };
    const response = await api.post<{ code: number; message: string }>('/certificates', submitData);
    if (response.code === 0 || response.code === 200) {
      alert('资质添加成功！');
      router.push('/certificates');
    } else {
      alert(response.message || '添加失败');
    }
  } catch {
    alert('添加失败，请稍后重试');
  } finally {
    submitting.value = false;
  }
};

const handleReset = () => {
  if (!confirm('确定要重置表单吗？')) {
    return;
  }
  Object.assign(form, {
    name: '',
    type: '',
    date: '',
    number: '',
    image: '',
    description: '',
    isActive: true,
  });
};
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

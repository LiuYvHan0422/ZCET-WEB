<template>
  <div class="news-add-page">
    <div class="page-header">
      <div>
        <h1 class="page-title">发布新闻</h1>
        <p class="page-subtitle">发布新的新闻文章。</p>
      </div>
    </div>
    <div class="form-container">
      <form @submit.prevent="handleSubmit">
        <div class="form-section">
          <div class="section-title">📰 基本信息</div>
          <div class="form-group">
            <label>标题 <span class="required">*</span></label>
            <input type="text" class="form-control" v-model="form.title" placeholder="请输入新闻标题" required />
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>分类 <span class="required">*</span></label>
              <select class="form-control" v-model="form.category" required>
                <option value="">请选择分类</option>
                <option value="公司新闻">公司新闻</option>
                <option value="行业动态">行业动态</option>
                <option value="产品更新">产品更新</option>
              </select>
            </div>
            <div class="form-group">
              <label>作者</label>
              <input type="text" class="form-control" v-model="form.author" placeholder="请输入作者名称" />
            </div>
          </div>
          <div class="form-group">
            <label>封面图片</label>
            <Upload v-model="form.image" type="news" hint="建议尺寸：1200x630像素" />
          </div>
        </div>
        <div class="form-section">
          <div class="section-title">📝 内容</div>
          <div class="form-group">
            <label>摘要</label>
            <textarea class="form-control" v-model="form.summary" rows="3" placeholder="请输入文章摘要"></textarea>
          </div>
          <div class="form-group">
            <label>正文内容 <span class="required">*</span></label>
            <div ref="editorRef" class="wang-editor"></div>
          </div>
        </div>
        <div class="form-section">
          <div class="section-title">⚙️ 发布设置</div>
          <div class="form-group">
            <label>状态</label>
            <select class="form-control" v-model="form.status">
              <option value="draft">草稿</option>
              <option value="published">立即发布</option>
            </select>
          </div>
        </div>
        <div class="form-actions">
          <button type="button" class="btn btn-outline" @click="handleReset">重置</button>
          <button type="submit" class="btn btn-primary" :disabled="submitting">{{ submitting ? '保存中...' : '发布文章' }}</button>
        </div>
      </form>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, reactive, onMounted, onBeforeUnmount, shallowRef } from 'vue'
import { useRouter } from 'vue-router'
import { api } from '@/utils/request'
import Upload from '@/components/Upload.vue'
import { createEditor } from '@wangeditor/editor'

const router = useRouter()
const submitting = ref(false)
const editorRef = ref<HTMLElement | null>(null)
const editor = shallowRef(null)
const form = reactive({ title: '', category: '', author: '', image: '', summary: '', content: '', status: 'draft' })
const initEditor = () => {
  if (editorRef.value && !editor.value) {
    editor.value = createEditor({
      selector: editorRef.value,
      html: '',
      height: '400px',
      onChange: (editor: any) => { form.content = editor.getHtml() },
      config: {
        placeholder: '请输入新闻正文内容...',
        MENU_CONF: {
          uploadImage: {
            fieldName: 'file',
            maxFileSize: 10 * 1024 * 1024,
          }
        }
      }
    })
  }
}
const handleSubmit = async () => {
  // 提交前主动同步编辑器内容
  if (editor.value) {
    form.content = editor.value.getHtml()
  }
  
  if (!form.title || !form.category) { alert('请填写必填字段'); return }
  const contentText = form.content?.replace(/<[^>]*>/g, '').trim()
  if (!form.content || !contentText) { alert('请填写新闻正文内容'); return }
  submitting.value = true
  try {
    const submitData = {
      title: form.title,
      category: form.category,
      author: form.author || '',
      image: form.image || '',
      excerpt: form.summary || '',
      summary: form.summary || '',
      content: form.content,
      isPublished: form.status === 'published'
    }

    const response = await api.post<{ code: number; message: string; id?: number }>('/news', submitData)
    if (response.code === 0 || response.code === 200) { alert('新闻发布成功！'); router.push('/news') }
    else { alert(response.message || '发布失败') }
  } catch (error) { alert('发布失败，请稍后重试') }
  finally { submitting.value = false }
}
const handleReset = () => {
  if (confirm('确定要重置表单吗？')) {
    Object.assign(form, { title: '', category: '', author: '', image: '', summary: '', content: '', status: 'draft' })
    if (editor.value) editor.value.setHtml('')
  }
}
onMounted(initEditor)
onBeforeUnmount(() => { if (editor.value) { editor.value.destroy(); editor.value = null } })
</script>
<style scoped>
.form-container { background: var(--white); border-radius: var(--radius-lg); box-shadow: var(--shadow); }
.form-section { padding: 24px; border-bottom: 1px solid var(--border-color); }
.form-section:last-child { border-bottom: none; }
.section-title { font-size: 16px; font-weight: 600; color: var(--text-primary); margin-bottom: 20px; }
.form-row { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; }
.required { color: var(--danger); }
.wang-editor {
  height: 400px;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  overflow: hidden;
}

:deep(.wang-editor .w-e-toolbar) {
  border-bottom: 1px solid var(--border-color);
}

:deep(.wang-editor .w-e-text-container) {
  height: calc(100% - 40px) !important;
  min-height: calc(100% - 40px) !important;
}

:deep(.wang-editor .w-e-text) {
  min-height: 330px !important;
}
.form-actions { padding: 20px 24px; background: var(--bg-color); display: flex; justify-content: flex-end; gap: 10px; border-radius: 0 0 var(--radius-lg) var(--radius-lg); }
</style>

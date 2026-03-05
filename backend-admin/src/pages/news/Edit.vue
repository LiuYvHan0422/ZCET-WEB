<template>
  <div class="news-edit-page">
    <div class="page-header">
      <div>
        <h1 class="page-title">编辑新闻</h1>
        <p class="page-subtitle">编辑新闻文章内容。</p>
      </div>
    </div>
    <div class="form-container">
      <form @submit.prevent="handleSubmit" v-if="!loading">
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
            <div ref="toolbarRef" class="wang-toolbar"></div>
            <div ref="editorRef" class="wang-editor"></div>
          </div>
        </div>
        <div class="form-section">
          <div class="section-title">⚙️ 发布设置</div>
          <div class="form-group">
            <label>状态</label>
            <select class="form-control" v-model="form.status">
              <option value="draft">草稿</option>
              <option value="published">已发布</option>
            </select>
          </div>
        </div>
        <div class="form-actions">
          <button type="button" class="btn btn-outline" @click="handleReset">重置</button>
          <button type="submit" class="btn btn-primary" :disabled="submitting">{{ submitting ? '保存中...' : '保存修改' }}</button>
        </div>
      </form>
      <div class="loading" v-else>加载中...</div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, reactive, onMounted, onBeforeUnmount, shallowRef } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { api } from '@/utils/request'
import Upload from '@/components/Upload.vue'
import { createEditor, createToolbar } from '@wangeditor/editor'

const route = useRoute()
const router = useRouter()
const loading = ref(false)
const submitting = ref(false)
const toolbarRef = ref<HTMLElement | null>(null)
const editorRef = ref<HTMLElement | null>(null)
const editor = shallowRef(null)
const toolbar = shallowRef(null)
const form = reactive({ title: '', category: '', author: '', image: '', summary: '', content: '', status: 'draft' })
const fetchNews = async () => {
  loading.value = true
  try {
    const response = await api.get<any>(`/news/${route.params.id}`)
    console.log('API 响应:', response)
    
    // 兼容两种响应格式：1. { code: 200, data: {...} }  2. 直接返回 {...}
    const data = response?.data || response
    
    if (data && data.id) {
      console.log('后端返回的数据:', data)
      
      // 字段映射：将后端字段转换为前端表单字段
      form.title = data.title || ''
      form.category = data.category || ''
      form.author = data.author || ''
      form.image = data.coverImage || data.image || ''
      form.summary = data.excerpt || data.summary || ''
      form.content = data.content || ''
      form.status = data.isPublished === true ? 'published' : (data.isPublished === false ? 'draft' : data.status || 'draft')
      
      console.log('赋值后的 form:', form)
      setTimeout(initEditor, 100)
    } else {
      console.warn('响应没有数据:', response)
    }
  } catch (error) { 
    console.error('获取新闻失败:', error) 
  }
  finally { loading.value = false }
}
const initEditor = () => {
  if (editorRef.value && !editor.value) {
    // 注意：wang-editor 高度需要 >= 300px，否则 modal 和 hoverbar 定位会出现异常
    editor.value = createEditor({
      selector: editorRef.value,
      html: form.content || '',
      height: 400,
      minHeight: 300,
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

    if (toolbarRef.value) {
      toolbar.value = createToolbar({
        editor: editor.value,
        selector: toolbarRef.value,
        config: {
          modalAppendToBody: false
        }
      })
    }
  }
}
const handleSubmit = async () => {
  // 提交前主动同步编辑器内容
  if (editor.value) {
    form.content = editor.value.getHtml()
  }
  
  if (!form.title) { alert('请填写标题'); return }
  const contentText = form.content?.replace(/<[^>]*>/g, '').trim()
  if (!form.content || !contentText) { alert('请填写新闻正文内容'); return }
  submitting.value = true
  try {
    // 字段映射：将前端表单字段转换为后端 DTO 字段
    const submitData = {
      title: form.title,
      category: form.category,
      author: form.author || '',
      // 前端 summary -> 后端 excerpt（数据库 excerpt 字段）
      excerpt: form.summary || '',
      summary: form.summary || '',
      content: form.content,
      // 前端 image -> 后端 image（DTO 定义的字段）
      image: form.image || '',
      // 前端 status (draft/published) -> 后端 isPublished (boolean)
      isPublished: form.status === 'published'
    }
    
    const response = await api.patch<{ code: number; message: string }>(`/news/${route.params.id}`, submitData)
    if (response.code === 0 || response.code === 200) { alert('新闻更新成功！'); router.push('/news') }
    else { alert(response.message || '更新失败') }
  } catch (error) { alert('更新失败，请稍后重试') }
  finally { submitting.value = false }
}
const handleReset = () => { if (confirm('确定要重置吗？')) fetchNews() }
onMounted(fetchNews)
onBeforeUnmount(() => {
  if (toolbar.value) {
    toolbar.value.destroy()
    toolbar.value = null
  }
  if (editor.value) {
    editor.value.destroy()
    editor.value = null
  }
})
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
  min-height: 300px;
  border: 1px solid var(--border-color);
  border-top: none;
  border-radius: 0 0 var(--radius-md) var(--radius-md);
  overflow: hidden;
}

.wang-toolbar {
  border: 1px solid var(--border-color);
  border-bottom: none;
  border-radius: var(--radius-md) var(--radius-md) 0 0;
  overflow: visible;
  position: relative;
  z-index: 2;
  background: var(--white);
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

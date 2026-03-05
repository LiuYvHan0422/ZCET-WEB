<template>
  <div class="product-edit-page">
    <div class="page-header">
      <div>
        <h1 class="page-title">编辑商品</h1>
        <p class="page-subtitle">编辑商品信息。</p>
      </div>
    </div>
    <div class="form-container">
      <form @submit.prevent="handleSubmit" v-if="!loading">
        <div class="form-section">
          <div class="section-title">📦 基本信息</div>
          <div class="form-group">
            <label>商品名称 <span class="required">*</span></label>
            <input type="text" class="form-control" v-model="form.name" placeholder="请输入商品名称" required />
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>SKU 编号 <span class="required">*</span></label>
              <input type="text" class="form-control" v-model="form.sku" placeholder="如：P001" required />
            </div>
            <div class="form-group">
              <label>分类 <span class="required">*</span></label>
              <input
                type="text"
                class="form-control"
                v-model.trim="form.category"
                list="product-category-options"
                placeholder="请输入或选择分类"
                required
              />
              <datalist id="product-category-options">
                <option v-for="cat in categories" :key="cat" :value="cat" />
              </datalist>
              <p class="hint">可直接输入新分类，保存后会自动加入建议列表。</p>
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>价格 <span class="required">*</span></label>
              <input type="number" class="form-control" v-model.number="form.price" placeholder="请输入价格" min="0" step="0.01" required />
            </div>
            <div class="form-group">
              <label>库存数量</label>
              <input type="number" class="form-control" v-model.number="form.stock" placeholder="请输入库存" min="0" />
            </div>
          </div>
        </div>
        <div class="form-section">
          <div class="section-title">🖼️ 商品图片</div>
          <Upload v-model="form.image" type="products" hint="建议尺寸：800x800像素" />
        </div>
        <div class="form-section">
          <div class="section-title">📝 商品描述</div>
          <div class="form-group">
            <label>简短描述</label>
            <textarea class="form-control" v-model="form.shortDescription" rows="3" placeholder="请输入商品简短描述"></textarea>
          </div>
          <div class="form-group">
            <label>详细介绍</label>
            <div ref="editorRef" class="wang-editor"></div>
          </div>
        </div>
        <div class="form-section">
          <div class="section-title">⚙️ 状态设置</div>
          <div class="form-group">
            <label class="switch-label">
              <input type="checkbox" v-model="form.isActive" />
              <span class="switch-slider"></span>
              <span class="switch-text">上架商品</span>
            </label>
          </div>
          <div class="form-group">
            <label class="switch-label">
              <input type="checkbox" v-model="form.isFeatured" />
              <span class="switch-slider"></span>
              <span class="switch-text">推荐商品</span>
            </label>
            <p class="hint">推荐商品将在首页优先展示</p>
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
import { createEditor } from '@wangeditor/editor'

const route = useRoute()
const router = useRouter()
const loading = ref(false)
const submitting = ref(false)
const editorRef = ref<HTMLElement | null>(null)
const editor = shallowRef(null)
const DEFAULT_CATEGORIES = ['套装', '礼盒', '单品', '限量版']
const categories = ref<string[]>([...DEFAULT_CATEGORIES])
const form = reactive({ name: '', sku: '', category: '', price: 0, stock: 0, image: '', shortDescription: '', description: '', isActive: true, isFeatured: false })

const normalizeCategories = (raw: unknown): string[] => {
  if (!Array.isArray(raw)) return []

  return Array.from(
    new Set(
      raw
        .map(item => String(item ?? '').trim())
        .filter(Boolean)
    )
  )
}

const mergeCategories = (raw: unknown, currentCategory = ''): string[] => {
  const remote = normalizeCategories(raw)
  const next = remote.length > 0 ? remote : [...DEFAULT_CATEGORIES]
  const current = String(currentCategory ?? '').trim()

  if (current && !next.includes(current)) {
    next.unshift(current)
  }

  return Array.from(new Set(next))
}

const fetchCategories = async (currentCategory = '') => {
  try {
    const response = await api.get<any>('/products/categories')
    categories.value = mergeCategories(response?.data ?? response, currentCategory)
  } catch (error) {
    console.warn('获取分类失败，使用默认分类:', error)
    categories.value = mergeCategories([], currentCategory)
  }
}

const fetchProduct = async () => {
  loading.value = true
  try {
    const response = await api.get<any>(`/products/${route.params.id}`)
    // 兼容两种响应格式：1. { code: 200, data: {...} }  2. 直接返回 {...}
    const data = response?.data || response
    
    if (data && data.id) {
      Object.assign(form, data)
      fetchCategories(form.category)
      setTimeout(initEditor, 100)
    }
  } catch (error) { 
    console.error('获取商品信息失败:', error) 
    alert('获取商品信息失败，请检查网络连接')
  }
  finally { loading.value = false }
}
const initEditor = () => {
  if (!editorRef.value) return;
  
  // 如果编辑器已经初始化，直接更新内容
  if (editor.value) {
    const content = form.description || ''
    if (editor.value.getHtml() !== content) {
      editor.value.setHtml(content)
    }
    return;
  }
  
  // 创建新的编辑器实例
  // 注意：wang-editor 高度需要 >= 300px，否则 modal 和 hoverbar 定位会出现异常
  editor.value = createEditor({
    selector: editorRef.value,
    html: form.description || '',
    height: 350,
    minHeight: 300,
    onChange: (editor: any) => {
      form.description = editor.getHtml()
    },
    config: {
      placeholder: '请输入商品详细介绍...',
      MENU_CONF: {
        uploadImage: {
          fieldName: 'file',
          maxFileSize: 10 * 1024 * 1024,
        }
      }
    }
  })
}
const handleSubmit = async () => {
  // 提交前主动同步编辑器内容
  if (editor.value) {
    form.description = editor.value.getHtml()
  }
  
  if (!form.name || !form.sku || !form.category) { alert('请填写必填字段'); return }
  const descText = form.description?.replace(/<[^>]*>/g, '').trim()
  if (!form.description || !descText) { alert('请填写商品详细介绍'); return }
  submitting.value = true
  try {
    const response = await api.patch<{ code: number; message: string }>(`/products/${route.params.id}`, form)
    if (response.code === 0 || response.code === 200) { alert('商品更新成功！'); router.push('/products') }
    else { alert(response.message || '更新失败') }
  } catch (error: any) {
    console.error('更新商品失败:', error)
    if (error.response?.data) {
      const { code, message, errors } = error.response.data
      if (errors && typeof errors === 'object') {
        const errorMessages = Object.entries(errors)
          .map(([field, msgs]) => `${field}: ${Array.isArray(msgs) ? msgs.join(', ') : msgs}`)
          .join('\n')
        alert(`验证失败:\n${errorMessages}`)
      } else {
        alert(message || '更新失败，请稍后重试')
      }
    } else if (error.request) {
      alert('网络连接失败，请检查网络')
    } else {
      alert('更新失败，请稍后重试')
    }
  }
  finally { submitting.value = false }
}
const handleReset = () => { if (confirm('确定要重置吗？')) fetchProduct() }
onMounted(() => {
  fetchCategories()
  fetchProduct()
})
onBeforeUnmount(() => {
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
  height: 350px;
  min-height: 300px;
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
  min-height: 280px !important;
}
.form-actions { padding: 20px 24px; background: var(--bg-color); display: flex; justify-content: flex-end; gap: 10px; border-radius: 0 0 var(--radius-lg) var(--radius-lg); }
@media (max-width: 768px) { .form-row { grid-template-columns: 1fr; } }
</style>

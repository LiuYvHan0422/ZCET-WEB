<template>
  <div class="product-add-page">
    <div class="page-header">
      <div>
        <h1 class="page-title">添加商品</h1>
        <p class="page-subtitle">添加新的商品到您的店铺。</p>
      </div>
    </div>

    <div class="form-container">
      <form @submit.prevent="handleSubmit">
        <!-- 基本信息 -->
        <div class="form-section">
          <div class="section-title">📦 基本信息</div>
          <div class="form-group">
            <label>商品名称 <span class="required">*</span></label>
            <input
              type="text"
              class="form-control"
              v-model="form.name"
              placeholder="请输入商品名称"
              required
            />
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>SKU 编号 <span class="required">*</span></label>
              <input
                type="text"
                class="form-control"
                v-model="form.sku"
                placeholder="如：P001"
                required
              />
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
              <input
                type="number"
                class="form-control"
                v-model.number="form.price"
                placeholder="请输入价格"
                min="0"
                step="0.01"
                required
              />
            </div>
            <div class="form-group">
              <label>库存数量</label>
              <input
                type="number"
                class="form-control"
                v-model.number="form.stock"
                placeholder="请输入库存"
                min="0"
              />
            </div>
          </div>
        </div>

        <!-- 商品图片 -->
        <div class="form-section">
          <div class="section-title">🖼️ 商品图片</div>
          <Upload
            v-model="form.image"
            type="products"
            hint="建议尺寸：800x800像素，支持 JPG、PNG 格式"
          />
        </div>

        <!-- 商品描述 -->
        <div class="form-section">
          <div class="section-title">📝 商品描述</div>
          <div class="form-group">
            <label>简短描述</label>
            <textarea
              class="form-control"
              v-model="form.shortDescription"
              rows="3"
              placeholder="请输入商品简短描述"
            ></textarea>
          </div>
          <div class="form-group">
            <label>详细介绍</label>
            <div ref="editorRef" class="wang-editor"></div>
          </div>
        </div>

        <!-- 状态设置 -->
        <div class="form-section">
          <div class="section-title">⚙️ 状态设置</div>
          <div class="form-group">
            <label class="switch-label">
              <input type="checkbox" v-model="form.isActive" />
              <span class="switch-slider"></span>
              <span class="switch-text">上架商品</span>
            </label>
            <p class="hint">勾选后商品将在前台展示</p>
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

        <!-- 提交按钮 -->
        <div class="form-actions">
          <button type="button" class="btn btn-outline" @click="handleReset">重置</button>
          <button type="submit" class="btn btn-primary" :disabled="submitting">
            {{ submitting ? '保存中...' : '保存商品' }}
          </button>
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

const DEFAULT_CATEGORIES = ['套装', '礼盒', '单品', '限量版']
const categories = ref<string[]>([...DEFAULT_CATEGORIES])

const form = reactive({
  name: '',
  sku: '',
  category: '',
  price: 0,
  stock: 0,
  image: '',
  shortDescription: '',
  description: '',
  isActive: true,
  isFeatured: false
})

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

const fetchCategories = async () => {
  try {
    const response = await api.get<any>('/products/categories')
    const remoteCategories = normalizeCategories(response?.data ?? response)
    categories.value = remoteCategories.length > 0 ? remoteCategories : [...DEFAULT_CATEGORIES]
  } catch (error) {
    console.warn('获取分类失败，使用默认分类:', error)
    categories.value = [...DEFAULT_CATEGORIES]
  }
}

const initEditor = () => {
  if (editorRef.value && !editor.value) {
    editor.value = createEditor({
      selector: editorRef.value,
      html: '',
      height: '350px',
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
}

const handleSubmit = async () => {
  // 提交前主动同步编辑器内容
  if (editor.value) {
    form.description = editor.value.getHtml()
  }
  
  if (!form.name || !form.sku || !form.category) {
    alert('请填写必填字段')
    return
  }
  
  // 检查富文本编辑器内容
  const descText = form.description?.replace(/<[^>]*>/g, '').trim()
  if (!form.description || !descText) {
    alert('请填写商品详细介绍')
    return
  }

  submitting.value = true

  try {
    const response = await api.post<{
      code: number
      message: string
    }>('/products', form)

    if (response.code === 0 || response.code === 200) {
      alert('商品添加成功！')
      router.push('/products')
    } else {
      alert(response.message || '添加失败')
    }
  } catch (error: any) {
    console.error('添加商品失败:', error)
    if (error.response?.data) {
      const { code, message, errors } = error.response.data
      if (errors && typeof errors === 'object') {
        // 显示详细的验证错误
        const errorMessages = Object.entries(errors)
          .map(([field, msgs]) => `${field}: ${Array.isArray(msgs) ? msgs.join(', ') : msgs}`)
          .join('\n')
        alert(`验证失败:\n${errorMessages}`)
      } else {
        alert(message || '添加失败，请稍后重试')
      }
    } else if (error.request) {
      alert('网络连接失败，请检查网络')
    } else {
      alert('添加失败，请稍后重试')
    }
  } finally {
    submitting.value = false
  }
}

const handleReset = () => {
  if (confirm('确定要重置表单吗？所有填写的内容将被清除。')) {
    Object.assign(form, {
      name: '',
      sku: '',
      category: '',
      price: 0,
      stock: 0,
      image: '',
      shortDescription: '',
      description: '',
      isActive: true,
      isFeatured: false
    })
  }
}

onMounted(() => {
  initEditor()
  fetchCategories()
})

onBeforeUnmount(() => {
  if (editor.value) {
    editor.value.destroy()
    editor.value = null
  }
})
</script>

<style scoped>
.form-container {
  background: var(--white);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow);
}

.form-section {
  padding: 24px;
  border-bottom: 1px solid var(--border-color);
}

.form-section:last-child {
  border-bottom: none;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.form-row {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}

.required {
  color: var(--danger);
}

.hint {
  font-size: 12px;
  color: var(--text-secondary);
  margin-top: 6px;
}

/* 开关样式 */
.switch-label {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
}

.switch-label input {
  display: none;
}

.switch-slider {
  width: 44px;
  height: 24px;
  background: #ccc;
  border-radius: 24px;
  position: relative;
  transition: all 0.3s;
}

.switch-slider::before {
  content: '';
  position: absolute;
  width: 20px;
  height: 20px;
  background: white;
  border-radius: 50%;
  top: 2px;
  left: 2px;
  transition: all 0.3s;
}

.switch-label input:checked + .switch-slider {
  background: var(--primary);
}

.switch-label input:checked + .switch-slider::before {
  transform: translateX(20px);
}

.switch-text {
  font-size: 14px;
  color: var(--text-primary);
}

.wang-editor {
  height: 350px;
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

.form-actions {
  padding: 20px 24px;
  background: var(--bg-color);
  border-radius: 0 0 var(--radius-lg) var(--radius-lg);
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

@media (max-width: 768px) {
  .form-row {
    grid-template-columns: 1fr;
  }
}
</style>

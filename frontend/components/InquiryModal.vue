<template>
  <Teleport to="body">
    <div
      v-if="isOpen"
      class="modal-overlay"
      :class="{ active: isOpen }"
      @click="handleOverlayClick"
    >
      <div class="modal" @click.stop>
        <div class="modal-header">
          <h2 class="modal-title">
            {{ modalTitle }}
          </h2>
          <button class="modal-close" @click="close">
            ×
          </button>
        </div>
        
        <div class="modal-body">
          <!-- 成功状态 -->
          <div v-if="submitSuccess" class="success-message">
            <div class="success-icon">✓</div>
            <h3 class="success-title">提交成功！</h3>
            <p class="success-text">
              感谢您的询盘，我们的工作人员会尽快与您联系。
            </p>
            <button
              class="btn btn-primary"
              style="margin-top: 30px;"
              @click="resetAndContinue"
            >
              继续询盘
            </button>
          </div>
          
          <!-- 询盘表单 -->
          <form v-else id="inquiryForm" @submit.prevent="submitForm">
            <input type="hidden" :value="productName" name="productName">
            
            <div class="form-group">
              <label>
                意向商品 <span class="required">*</span>
              </label>
              <input
                type="text"
                class="form-control"
                :value="displayProductName"
                readonly
                style="background: var(--bg-color);"
              >
            </div>
            
            <div class="form-group">
              <label>
                您的姓名 <span class="required">*</span>
              </label>
              <input
                v-model="form.customerName"
                type="text"
                class="form-control"
                placeholder="请输入您的姓名"
                required
              >
            </div>
            
            <div class="form-group">
              <label>
                联系电话 <span class="required">*</span>
              </label>
              <input
                v-model="form.customerPhone"
                type="tel"
                class="form-control"
                placeholder="请输入联系电话"
                required
              >
              <p class="form-hint">请至少填写电话或邮箱其中一个</p>
            </div>
            
            <div class="form-group">
              <label>电子邮箱</label>
              <input
                v-model="form.customerEmail"
                type="email"
                class="form-control"
                placeholder="请输入电子邮箱"
              >
            </div>
            
            <div class="form-group">
              <label>公司名称</label>
              <input
                v-model="form.companyName"
                type="text"
                class="form-control"
                placeholder="请输入公司名称（选填）"
              >
            </div>
            
            <div class="form-group">
              <label>留言内容</label>
              <textarea
                v-model="form.message"
                class="form-control"
                rows="4"
                placeholder="请输入您的具体需求或问题（选填）"
              ></textarea>
            </div>
            
            <div class="modal-footer" style="padding: 0; border: none; margin-top: 30px;">
              <button type="button" class="btn btn-outline" @click="close">
                取消
              </button>
              <button
                type="submit"
                class="btn btn-primary"
                :disabled="submitting"
                :class="{ 'btn-loading': submitting }"
              >
                {{ submitting ? '提交中...' : '提交询盘' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { apiPost } from '~/composables/useApi'

// Props
interface Props {
  productName?: string
}

const props = withDefaults(defineProps<Props>(), {
  productName: ''
})

// Emits
const emit = defineEmits<{
  (e: 'close'): void
}>()

// 响应式状态
const isOpen = ref(false)
const submitSuccess = ref(false)
const submitting = ref(false)

// 表单数据
const form = ref({
  customerName: '',
  customerPhone: '',
  customerEmail: '',
  companyName: '',
  message: ''
})

// 计算属性
const displayProductName = computed(() => {
  return props.productName || '通用询盘'
})

const modalTitle = computed(() => {
  return props.productName ? `获取报价 - ${props.productName}` : '获取报价'
})

// 方法
const close = () => {
  isOpen.value = false
  document.body.style.overflow = ''
  emit('close')
  resetForm()
}

const resetForm = () => {
  form.value = {
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    companyName: '',
    message: ''
  }
  submitSuccess.value = false
}

const resetAndContinue = () => {
  resetForm()
}

const handleOverlayClick = (event: MouseEvent) => {
  const target = event.target as HTMLElement
  if (target.classList.contains('modal-overlay')) {
    close()
  }
}

const submitForm = async () => {
  // 验证：电话或邮箱至少填一个
  if (!form.value.customerPhone && !form.value.customerEmail) {
    alert('请至少填写电话或邮箱其中一个联系方式！')
    return
  }

  submitting.value = true

  try {
    // 提交到真实API
    const res = await apiPost<{ code: number; message: string }>('/inquiries', {
      productName: props.productName,
      customerName: form.value.customerName,
      customerPhone: form.value.customerPhone,
      customerEmail: form.value.customerEmail,
      companyName: form.value.companyName,
      message: form.value.message
    })
    
    if (res.code === 201 || res.code === 200 || res.code === 0) {
      console.log('询盘提交成功：', {
        productName: props.productName,
        ...form.value
      })
      submitSuccess.value = true
    } else {
      throw new Error(res.message || '提交失败')
    }
  } catch (error: any) {
    console.error('提交失败：', error)
    alert(error.message || '提交失败，请稍后重试！')
  } finally {
    submitting.value = false
  }
}

// 键盘事件
const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Escape' && isOpen.value) {
    close()
  }
}

// 生命周期
watch(() => props.productName, () => {
  // 当产品名称变化时，重置成功状态
  if (isOpen.value) {
    submitSuccess.value = false
  }
})

onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
  isOpen.value = true
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
  document.body.style.overflow = ''
})
</script>

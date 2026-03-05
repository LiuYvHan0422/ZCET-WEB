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
          <h2 class="modal-title">{{ modalTitle }}</h2>
          <button class="modal-close" @click="close">×</button>
        </div>

        <div class="modal-body">
          <div v-if="submitSuccess" class="success-message">
            <div class="success-icon">✓</div>
            <h3 class="success-title">提交成功！</h3>
            <p class="success-text">感谢您的询盘，我们会尽快与您联系。</p>
            <button class="btn btn-primary" style="margin-top: 30px" @click="resetAndContinue">
              继续询盘
            </button>
          </div>

          <form v-else id="inquiryForm" @submit.prevent="submitForm">
            <input type="hidden" :value="productName" name="productName" />

            <div class="form-group">
              <label>意向商品 <span class="required">*</span></label>
              <input
                type="text"
                class="form-control"
                :value="displayProductName"
                readonly
                style="background: var(--bg-color)"
              />
            </div>

            <div class="form-group">
              <label>您的姓名 <span class="required">*</span></label>
              <input
                v-model="form.customerName"
                type="text"
                class="form-control"
                placeholder="请输入您的姓名"
                required
              />
            </div>

            <div class="form-group">
              <label>联系电话 <span class="required">*</span></label>
              <input
                v-model="form.customerPhone"
                type="tel"
                class="form-control"
                placeholder="请输入联系电话"
                required
              />
              <p class="form-hint">请至少填写电话或邮箱其中一个</p>
            </div>

            <div class="form-group">
              <label>电子邮箱</label>
              <input
                v-model="form.customerEmail"
                type="email"
                class="form-control"
                placeholder="请输入电子邮箱"
              />
            </div>

            <div class="form-group">
              <label>公司名称</label>
              <input
                v-model="form.companyName"
                type="text"
                class="form-control"
                placeholder="请输入公司名称（选填）"
              />
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

            <div class="modal-footer" style="padding: 0; border: none; margin-top: 30px">
              <button type="button" class="btn btn-outline" @click="close">取消</button>
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

interface Props {
  productName?: string
}

const props = withDefaults(defineProps<Props>(), {
  productName: '',
})

const emit = defineEmits<{
  (e: 'close'): void
}>()

const isOpen = ref(false)
const submitSuccess = ref(false)
const submitting = ref(false)

const form = ref({
  customerName: '',
  customerPhone: '',
  customerEmail: '',
  companyName: '',
  message: '',
})

const displayProductName = computed(() => props.productName || '通用询盘')

const modalTitle = computed(() =>
  props.productName ? `获取报价 - ${props.productName}` : '获取报价',
)

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
    message: '',
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
  if (!form.value.customerPhone.trim() && !form.value.customerEmail.trim()) {
    alert('请至少填写电话或邮箱其中一个联系方式！')
    return
  }

  submitting.value = true

  try {
    const customerName = form.value.customerName.trim()
    const customerPhone = form.value.customerPhone.trim()
    const customerEmail = form.value.customerEmail.trim()
    const companyName = form.value.companyName.trim()
    const message = form.value.message.trim()
    const productName = props.productName.trim()

    const payload: Record<string, string> = {
      customerName,
      customerPhone,
    }

    if (productName) payload.productName = productName
    if (customerEmail) payload.customerEmail = customerEmail
    if (companyName) payload.companyName = companyName
    if (message) payload.message = message

    const res = await apiPost<{ code: number; message: string }>('/inquiries', payload)

    if (res.code === 201 || res.code === 200 || res.code === 0) {
      submitSuccess.value = true
    } else {
      throw new Error(res.message || '提交失败')
    }
  } catch (error: any) {
    console.error('提交失败:', error)
    alert(error.message || '提交失败，请稍后重试')
  } finally {
    submitting.value = false
  }
}

const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Escape' && isOpen.value) {
    close()
  }
}

watch(
  () => props.productName,
  () => {
    if (isOpen.value) {
      submitSuccess.value = false
    }
  },
)

onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
  isOpen.value = true
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
  document.body.style.overflow = ''
})
</script>

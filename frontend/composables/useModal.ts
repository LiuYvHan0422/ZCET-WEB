import { inject } from 'vue'
import type { Ref } from 'vue'

// 弹窗状态接口
interface ModalState {
  showModal: Ref<boolean>
  modalProductName: Ref<string>
  openModal: (productName?: string) => void
  closeModal: () => void
}

// 注入键
const ModalSymbol = Symbol('modal')

// 提供弹窗功能
export const useModal = () => {
  const modal = inject<ModalState>(ModalSymbol)
  
  if (!modal) {
    throw new Error('useModal() 必须在提供弹窗上下文的组件中使用')
  }
  
  return modal
}

// 创建弹窗上下文（供根布局使用）
export const createModalContext = () => {
  const showModal = ref(false)
  const modalProductName = ref('')
  
  const openModal = (productName: string = '') => {
    modalProductName.value = productName
    showModal.value = true
    document.body.style.overflow = 'hidden'
  }
  
  const closeModal = () => {
    showModal.value = false
    document.body.style.overflow = ''
  }
  
  provide(ModalSymbol, {
    showModal,
    modalProductName,
    openModal,
    closeModal
  })
  
  return {
    showModal,
    modalProductName,
    openModal,
    closeModal
  }
}

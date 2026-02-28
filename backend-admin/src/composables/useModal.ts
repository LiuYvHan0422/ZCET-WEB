import { ref, computed } from 'vue'

export function useModal() {
  const visible = ref(false)
  const title = ref('')
  const data = ref<any>(null)

  const open = (newTitle: string, newData?: any) => {
    title.value = newTitle
    data.value = newData || null
    visible.value = true
  }

  const close = () => {
    visible.value = false
    data.value = null
  }

  const toggle = () => {
    visible.value = !visible.value
  }

  return {
    visible,
    title,
    data,
    open,
    close,
    toggle,
    isOpen: computed(() => visible.value)
  }
}

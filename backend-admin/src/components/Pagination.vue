<template>
  <div class="pagination" v-if="total > 0">
    <span class="info">共 {{ total }} 条</span>
    <a
      href="javascript:;"
      :class="{ disabled: current === 1 }"
      @click="goTo(current - 1)"
    >&lt;</a>
    <a
      v-for="page in visiblePages"
      :key="page"
      href="javascript:;"
      :class="{ active: page === current }"
      @click="goTo(page)"
    >{{ page }}</a>
    <a
      href="javascript:;"
      :class="{ disabled: current === totalPage }"
      @click="goTo(current + 1)"
    >&gt;</a>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  current: number
  total: number
  pageSize: number
}>()

const emit = defineEmits<{
  (e: 'change', page: number): void
}>()

const totalPage = computed(() => Math.ceil(props.total / props.pageSize))

const visiblePages = computed(() => {
  const pages: number[] = []
  const total = totalPage.value
  const current = props.current
  
  let start = Math.max(1, current - 2)
  let end = Math.min(total, current + 2)
  
  if (end - start < 4) {
    if (start === 1) {
      end = Math.min(5, total)
    } else {
      start = Math.max(1, total - 4)
    }
  }
  
  for (let i = start; i <= end; i++) {
    pages.push(i)
  }
  
  return pages
})

const goTo = (page: number) => {
  if (page < 1 || page > totalPage.value || page === props.current) return
  emit('change', page)
}
</script>

<style scoped>
.pagination .disabled {
  opacity: 0.5;
  pointer-events: none;
}
</style>

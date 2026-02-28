<template>
  <span class="status-badge" :class="type">{{ text }}</span>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  status: string
  statusMap?: Record<string, { text: string; type: string }>
}>()

const defaultStatusMap: Record<string, { text: string; type: string }> = {
  active: { text: '已上架', type: 'active' },
  inactive: { text: '已下架', type: 'inactive' },
  published: { text: '已发布', type: 'published' },
  draft: { text: '草稿', type: 'draft' },
  archived: { text: '已归档', type: 'archived' },
  pending: { text: '待处理', type: 'pending' },
  replied: { text: '已回复', type: 'replied' },
  closed: { text: '已关闭', type: 'closed' }
}

const map = computed(() => props.statusMap || defaultStatusMap)
const type = computed(() => map.value[props.status]?.type || 'default')
const text = computed(() => map.value[props.status]?.text || props.status)
</script>

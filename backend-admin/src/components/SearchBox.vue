<template>
  <div class="search-box">
    <input
      type="text"
      class="search-input"
      :placeholder="placeholder"
      :value="modelValue"
      @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
      @keyup.enter="$emit('search')"
    />
    <button class="btn btn-outline btn-sm" @click="$emit('search')">🔍 搜索</button>
    <button
      v-if="showReset"
      class="btn btn-outline btn-sm"
      @click="reset"
    >重置</button>
  </div>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  modelValue: string
  placeholder?: string
  showReset?: boolean
}>(), {
  placeholder: '搜索...',
  showReset: false
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
  (e: 'search'): void
  (e: 'reset'): void
}>()

const reset = () => {
  emit('update:modelValue', '')
  emit('reset')
}
</script>

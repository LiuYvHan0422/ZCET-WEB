<template>
  <div class="app">
    <AppHeader />
    <main class="main-content">
      <slot />
    </main>
    <AppFooter />
    <InquiryModal
      v-if="showModal"
      :product-name="modalProductName"
      @close="closeModal"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { createModalContext } from '~/composables/useModal'

// 使用 composable 创建弹窗上下文
const { showModal, modalProductName, openModal, closeModal } = createModalContext()
</script>

<style scoped>
.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.main-content {
  flex: 1;
}
</style>

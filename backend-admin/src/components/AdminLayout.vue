<template>
  <div class="admin-layout">
    <AdminSidebar />
    <div class="main-content">
      <AdminHeader />
      <div class="page-content">
        <router-view />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import AdminSidebar from './AdminSidebar.vue'
import AdminHeader from './AdminHeader.vue'

const authStore = useAuthStore()

onMounted(() => {
  authStore.initAuth()
})
</script>

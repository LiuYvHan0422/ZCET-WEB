<template>
  <aside class="admin-sidebar">
    <div class="sidebar-header">
      <div class="sidebar-logo">🏢 精品独立站</div>
      <div class="sidebar-subtitle">CMS 内容管理系统</div>
    </div>
    <nav class="sidebar-nav">
      <div class="nav-section">
        <div class="nav-section-title">概览</div>
        <router-link to="/" class="nav-item" :class="{ active: currentRoute === 'Dashboard' }">
          <span class="icon">📊</span>
          <span>仪表盘</span>
        </router-link>
      </div>
      <div class="nav-section">
        <div class="nav-section-title">内容管理</div>
        <router-link to="/products" class="nav-item" :class="{ active: routePath.startsWith('/products') }">
          <span class="icon">📦</span>
          <span>商品管理</span>
        </router-link>
        <router-link to="/news" class="nav-item" :class="{ active: routePath.startsWith('/news') }">
          <span class="icon">📰</span>
          <span>新闻动态</span>
        </router-link>
        <router-link to="/certificates" class="nav-item" :class="{ active: routePath.startsWith('/certificates') }">
          <span class="icon">🏆</span>
          <span>荣誉资质</span>
        </router-link>
      </div>
      <div class="nav-section">
        <div class="nav-section-title">业务管理</div>
        <router-link to="/inquiries" class="nav-item" :class="{ active: routePath.startsWith('/inquiries') }">
          <span class="icon">📬</span>
          <span>询盘管理</span>
        </router-link>
      </div>
      <div class="nav-section">
        <div class="nav-section-title">系统设置</div>
        <router-link to="/company" class="nav-item" :class="{ active: routePath.startsWith('/company') }">
          <span class="icon">🏢</span>
          <span>公司信息</span>
        </router-link>
        <router-link to="/settings" class="nav-item" :class="{ active: routePath.startsWith('/settings') }">
          <span class="icon">⚙️</span>
          <span>系统设置</span>
        </router-link>
      </div>
    </nav>
  </aside>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

const routePath = computed(() => route.path)
const currentRoute = computed(() => route.name)
</script>

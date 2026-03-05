<template>
  <header class="header">
    <div class="container header-inner">
      <NuxtLink to="/" class="logo">
        {{ siteTitle }}
      </NuxtLink>

      <nav class="nav">
        <NuxtLink
          v-for="item in navItems"
          :key="item.path"
          :to="item.path"
          class="nav-link"
          :class="{ active: isActive(item.path) }"
        >
          {{ item.name }}
        </NuxtLink>
      </nav>

      <button class="btn btn-primary" @click="handleGetQuote">
        获取报价
      </button>
    </div>
  </header>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useModal } from '~/composables/useModal'
import { useSeo } from '~/composables/useSeo'

const route = useRoute()
const { openModal } = useModal()
const { seo, fetchSeo } = useSeo()

// 在首屏渲染前拉取 SEO，避免先显示默认站点名再闪烁更新
await fetchSeo()

const siteTitle = computed(() => seo.value.siteTitle || '沈阳振昌能源科技有限公司')

const navItems = [
  { name: '首页', path: '/' },
  { name: '全部商品', path: '/product' },
  { name: '新闻动态', path: '/news' },
  { name: '关于我们', path: '/about' },
  { name: '荣誉资质', path: '/certificates' },
  { name: '联系我们', path: '/#contact' },
]

const isActive = (path: string) => {
  if (path === '/') return route.path === '/'

  if (path.includes('#')) {
    const [pathname, hash] = path.split('#')
    const currentHash = route.hash.replace('#', '')
    return route.path === pathname && currentHash === hash
  }

  return route.path === path
}

const handleGetQuote = () => {
  openModal('')
}
</script>

<style scoped>
.header {
  background: var(--white);
  box-shadow: var(--shadow);
  position: sticky;
  top: 0;
  z-index: 1000;
}

.header-inner {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 70px;
}

.logo {
  font-size: 18px;
  font-weight: bold;
  color: var(--primary);
  white-space: nowrap;
}

.nav {
  display: flex;
  gap: 40px;
}

.nav-link {
  font-weight: 500;
  color: var(--text-regular);
  padding: 8px 0;
  position: relative;
  transition: color 0.3s;
}

.nav-link:hover {
  color: var(--primary);
}

.nav-link.active {
  color: var(--primary);
}

.nav-link.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: var(--primary);
}

@media (max-width: 1024px) {
  .nav {
    gap: 25px;
  }
}

@media (max-width: 768px) {
  .nav {
    display: none;
  }
}
</style>

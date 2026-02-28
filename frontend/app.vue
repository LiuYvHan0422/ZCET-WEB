<script setup lang="ts">
import { useSeo } from '~/composables/useSeo'

const { fetchSeo, getSiteTitle, getSiteDescription, getKeywords } = useSeo()

// 异步获取SEO设置并设置页面head
const initSeo = async () => {
  const seo = await fetchSeo()
  
  useHead({
    title: seo.siteTitle ? `${seo.siteTitle} - 您的优质选择` : '精品独立站 - 您的优质选择',
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { name: 'description', content: seo.siteDescription || '专业品质，值得信赖。我们提供优质的产品和服务，致力于为客户创造最大价值' },
      { name: 'keywords', content: seo.keywords || '' }
    ]
  })
}

// 客户端挂载时获取SEO设置
if (process.client) {
  initSeo()
}
</script>

<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

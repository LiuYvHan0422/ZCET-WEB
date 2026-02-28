// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  
  modules: [
    '@pinia/nuxt',
  ],

  css: [
    '~/assets/css/main.css'
  ],

  app: {
    head: {
      title: '', // 由 app.vue 动态设置
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' }
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
      ]
    }
  },

  // 开发环境代理配置 - 将前端 /api 请求转发到后端服务器
  vite: {
    server: {
      proxy: {
        '/api': {
          target: 'http://localhost:8001',
          changeOrigin: true,
        }
      }
    }
  },

  runtimeConfig: {
    public: {
      apiBase: process.env.API_BASE || '/api/v1'
    }
  },

  compatibilityDate: '2025-01-01'
})

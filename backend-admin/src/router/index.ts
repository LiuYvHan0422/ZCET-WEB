import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/pages/Login.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/',
    component: () => import('@/components/AdminLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        name: 'Dashboard',
        component: () => import('@/pages/Dashboard.vue')
      },
      {
        path: 'products',
        name: 'Products',
        component: () => import('@/pages/products/List.vue')
      },
      {
        path: 'products/add',
        name: 'ProductAdd',
        component: () => import('@/pages/products/Add.vue')
      },
      {
        path: 'products/edit/:id',
        name: 'ProductEdit',
        component: () => import('@/pages/products/Edit.vue')
      },
      {
        path: 'news',
        name: 'News',
        component: () => import('@/pages/news/List.vue')
      },
      {
        path: 'news/add',
        name: 'NewsAdd',
        component: () => import('@/pages/news/Add.vue')
      },
      {
        path: 'news/edit/:id',
        name: 'NewsEdit',
        component: () => import('@/pages/news/Edit.vue')
      },
      {
        path: 'certificates',
        name: 'Certificates',
        component: () => import('@/pages/certificates/List.vue')
      },
      {
        path: 'certificates/add',
        name: 'CertificateAdd',
        component: () => import('@/pages/certificates/Add.vue')
      },
      {
        path: 'certificates/edit/:id',
        name: 'CertificateEdit',
        component: () => import('@/pages/certificates/Edit.vue')
      },
      {
        path: 'inquiries',
        name: 'Inquiries',
        component: () => import('@/pages/inquiries/List.vue')
      },
      {
        path: 'inquiries/:id',
        name: 'InquiryDetail',
        component: () => import('@/pages/inquiries/Detail.vue')
      },
      {
        path: 'company',
        name: 'Company',
        component: () => import('@/pages/company/Info.vue')
      },
      {
        path: 'settings',
        name: 'Settings',
        component: () => import('@/pages/settings/Index.vue')
      }
    ]
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/'
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守卫
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  const token = authStore.token
  
  if (to.meta.requiresAuth && !token) {
    next('/login')
  } else if (to.path === '/login' && token) {
    next('/')
  } else {
    next()
  }
})

export default router

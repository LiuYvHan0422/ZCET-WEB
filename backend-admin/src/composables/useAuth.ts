import { computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'

export function useAuth() {
  const authStore = useAuthStore()
  const router = useRouter()

  const login = async (username: string, password: string) => {
    const result = await authStore.login(username, password)
    
    if (result.success) {
      router.push('/')
    }
    
    return result
  }

  const logout = async () => {
    await authStore.logout()
    router.push('/login')
  }

  const checkAuth = () => {
    return !!authStore.token
  }

  return {
    user: computed(() => authStore.user),
    token: computed(() => authStore.token),
    isLoggedIn: computed(() => authStore.isLoggedIn),
    login,
    logout,
    checkAuth
  }
}

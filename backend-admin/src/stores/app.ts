import { defineStore } from 'pinia'

interface AppState {
  sidebarCollapsed: boolean
  darkMode: boolean
  locale: string
}

export const useAppStore = defineStore('app', {
  state: (): AppState => ({
    sidebarCollapsed: false,
    darkMode: false,
    locale: 'zh-CN'
  }),

  actions: {
    toggleSidebar() {
      this.sidebarCollapsed = !this.sidebarCollapsed
    },

    setSidebarCollapsed(collapsed: boolean) {
      this.sidebarCollapsed = collapsed
    },

    toggleDarkMode() {
      this.darkMode = !this.darkMode
      document.documentElement.classList.toggle('dark', this.darkMode)
    },

    setDarkMode(dark: boolean) {
      this.darkMode = dark
      document.documentElement.classList.toggle('dark', dark)
    }
  }
})

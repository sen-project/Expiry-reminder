import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useAuthStore = defineStore('auth', () => {
  const isLoggedIn = ref(false)
  const username = ref('')

  const login = (user) => {
    isLoggedIn.value = true
    username.value = user
    localStorage.setItem('isLoggedIn', 'true')
    localStorage.setItem('username', user)
  }

  const logout = () => {
    isLoggedIn.value = false
    username.value = ''
    localStorage.removeItem('isLoggedIn')
    localStorage.removeItem('username')
  }

  const checkAuth = () => {
    const loggedIn = localStorage.getItem('isLoggedIn')
    const user = localStorage.getItem('username')
    if (loggedIn === 'true' && user) {
      isLoggedIn.value = true
      username.value = user
    }
  }

  return {
    isLoggedIn,
    username,
    login,
    logout,
    checkAuth
  }
})

import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const token = ref(null)
  const isAuthenticated = computed(() => !!token.value)

  // Initialize state from localStorage
  const initializeAuth = () => {
    try {
      const storedToken = localStorage.getItem('token')
      const storedUser = localStorage.getItem('user')
      
      if (storedToken && storedUser) {
        token.value = storedToken
        user.value = JSON.parse(storedUser)
      }
    } catch (error) {
      console.error('Error initializing auth state:', error)
      clearAuth()
    }
  }

  // Login
  const login = async (username, password) => {
    try {
      const response = await fetch('https://api.mgoods.uz/api/web/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ username, password })
      })

      const data = await response.json()

      if (!data.status) {
        throw new Error(data.message || 'Login failed')
      }

      // Store auth data
      token.value = data.data.token
      user.value = data.data.user

      // Persist to localStorage
      localStorage.setItem('token', data.data.token)
      localStorage.setItem('user', JSON.stringify(data.data.user))

      return { success: true }
    } catch (error) {
      console.error('Login error:', error)
      return { 
        success: false, 
        error: error.message || 'An error occurred during login' 
      }
    }
  }

  // Logout
  const logout = () => {
    clearAuth()
    return { success: true }
  }

  // Clear auth state
  const clearAuth = () => {
    user.value = null
    token.value = null
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }

  // Validate token by making a request to get user profile
  const validateToken = async () => {
    if (!token.value) return false

    try {
      const response = await fetch('https://api.mgoods.uz/api/web/profile', {
        headers: {
          'Authorization': `Bearer ${token.value}`,
          'Accept': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error('Token invalid')
      }

      const data = await response.json()
      return data.status === true
    } catch (error) {
      console.error('Token validation error:', error)
      clearAuth() // Clear invalid token
      return false
    }
  }

  return {
    user,
    token,
    isAuthenticated,
    login,
    logout,
    initializeAuth,
    validateToken
  }
})

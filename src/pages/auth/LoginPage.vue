<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth'

const router = useRouter()
const auth = useAuthStore()

// Form state
const username = ref('')
const password = ref('')
const showPassword = ref(false)
const error = ref('')
const loading = ref(false)
const showSuccessMessage = ref(false)

const isValid = computed(() => {
  return username.value.length > 0 && password.value.length > 0
})

const handleLogin = async () => {
  if (loading.value) return
  
  try {
    loading.value = true
    error.value = ''
    
    const result = await auth.login(username.value, password.value)
    
    if (result.success) {
      showSuccessMessage.value = true
      // Redirect after showing success message
      setTimeout(() => {
        router.push('/')
      }, 2000)
    } else {
      error.value = result.error || 'Login failed. Please try again.'
    }
  } catch (err) {
    console.error('Login error:', err)
    error.value = 'Something went wrong. Please try again.'
  } finally {
    loading.value = false
  }
}

const goToRegister = () => {
  router.push({ name: 'Register' })
}

const goToResetPassword = () => {
  router.push({ name: 'ResetPassword' })
}

const togglePassword = () => {
  showPassword.value = !showPassword.value
}
</script>

<template>
  <div class="auth-container">
    <div class="auth-box">
      <div class="auth-logo">
        <span class="auth-logo-text">M</span>goods
      </div>

      <h2 class="auth-title">Millionga ($) bir qadam</h2>
      
      <!-- Success Message -->
      <div v-if="showSuccessMessage" class="auth-success">
        <i class="mdi mdi-check-circle"></i>
        <p>Siz muvaffaqiyatli tizimga kirdingiz</p>
      </div>
      
      <form v-else @submit.prevent="handleLogin" class="auth-form">
        <div class="auth-group">
          <label class="auth-label">Username</label>
          <div class="auth-input-wrapper">
            <i class="mdi mdi-account auth-input-icon"></i>
            <input 
              type="text" 
              v-model="username"
              placeholder="Enter username"
              required
              class="auth-input"
              :disabled="loading"
            >
          </div>
        </div>
        
        <div class="auth-group">
          <label class="auth-label">Password</label>
          <div class="auth-input-wrapper">
            <i class="mdi mdi-lock auth-input-icon"></i>
            <input 
              :type="showPassword ? 'text' : 'password'"
              v-model="password"
              placeholder="Enter password"
              required
              class="auth-input"
              :disabled="loading"
            >
            <button 
              type="button"
              class="password-toggle"
              @click="togglePassword"
              :disabled="loading"
            >
              <i :class="showPassword ? 'mdi mdi-eye-off' : 'mdi mdi-eye'"></i>
            </button>
          </div>
        </div>

        <p v-if="error" class="auth-error">{{ error }}</p>

        <button type="submit" class="auth-button" :disabled="!isValid || loading">
          <i class="mdi mdi-login"></i>
          <span v-if="loading">Logging in...</span>
          <span v-else>Log in to APP</span>
        </button>

        <div class="auth-link">
          <button type="button" class="link" @click="goToResetPassword" :disabled="loading">
            <i class="mdi mdi-lock-reset"></i>
            Reset password
          </button>
          <span class="mx-2">|</span>
          <button type="button" class="link" @click="goToRegister" :disabled="loading">
            <i class="mdi mdi-account-plus"></i>
            Register
          </button>
        </div>

        <div class="auth-divider">
          <span class="auth-divider-text">or continue with</span>
        </div>
        
        <div class="social-buttons">
          <button type="button" class="social-button google" :disabled="loading">
            <i class="mdi mdi-google"></i>
            <span class="hidden sm:inline">Register with Google</span>
            <span class="sm:hidden">Google</span>
          </button>
          <button type="button" class="social-button telegram" :disabled="loading">
            <i class="mdi mdi-telegram"></i>
            <span class="hidden sm:inline">Register with Telegram</span>
            <span class="sm:hidden">Telegram</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
.auth-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f3f4f6;
  padding: 1rem;
}

.auth-box {
  background: white;
  border-radius: 1rem;
  padding: 2rem;
  width: 100%;
  max-width: 28rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

.auth-logo {
  text-align: center;
  font-size: 1.5rem;
  font-weight: bold;
  margin-bottom: 1rem;
  color: #ef4444;
}

.auth-logo-text {
  background: #ef4444;
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  margin-right: 0.25rem;
}

.auth-title {
  text-align: center;
  font-size: 1.25rem;
  color: #374151;
  margin-bottom: 2rem;
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.auth-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.auth-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
}

.auth-input-wrapper {
  position: relative;
}

.auth-input-icon {
  position: absolute;
  left: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  color: #9ca3af;
  font-size: 1.25rem;
}

.auth-input {
  width: 100%;
  padding: 0.625rem 0.75rem 0.625rem 2.5rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  transition: all 0.2s;
}

.auth-input:focus {
  outline: none;
  border-color: #ef4444;
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
}

.auth-input:disabled {
  background-color: #f3f4f6;
  cursor: not-allowed;
}

.password-toggle {
  position: absolute;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #9ca3af;
  cursor: pointer;
  padding: 0;
  font-size: 1.25rem;
}

.password-toggle:hover:not(:disabled) {
  color: #ef4444;
}

.password-toggle:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.auth-error {
  color: #dc2626;
  font-size: 0.875rem;
  margin-top: -0.5rem;
}

.auth-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  width: 100%;
  padding: 0.625rem;
  background-color: #ef4444;
  color: white;
  border: none;
  border-radius: 0.375rem;
  font-weight: 500;
  transition: all 0.2s;
}

.auth-button:hover:not(:disabled) {
  background-color: #dc2626;
}

.auth-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.auth-link {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.link {
  background: none;
  border: none;
  color: #ef4444;
  font-size: 0.875rem;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  cursor: pointer;
  padding: 0;
}

.link:hover:not(:disabled) {
  text-decoration: underline;
}

.link:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.mx-2 {
  color: #9ca3af;
}

.auth-divider {
  position: relative;
  text-align: center;
  margin: 1.5rem 0;
}

.auth-divider::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  width: 100%;
  height: 1px;
  background-color: #e5e7eb;
}

.auth-divider-text {
  position: relative;
  display: inline-block;
  padding: 0 0.75rem;
  background-color: white;
  color: #6b7280;
  font-size: 0.875rem;
}

.social-buttons {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.75rem;
}

.social-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.625rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  background-color: white;
  color: #374151;
  font-size: 0.875rem;
  transition: all 0.2s;
}

.social-button:hover:not(:disabled) {
  background-color: #f9fafb;
  border-color: #9ca3af;
}

.social-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.social-button.google {
  color: #ea4335;
}

.social-button.telegram {
  color: #0088cc;
}

.auth-success {
  text-align: center;
  color: #059669;
  padding: 2rem;
}

.auth-success i {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.auth-success p {
  font-size: 1.125rem;
  font-weight: 500;
}

@media (max-width: 640px) {
  .hidden {
    display: none;
  }
  
  .sm\:hidden {
    display: inline;
  }
  
  .sm\:inline {
    display: none;
  }
}
</style>
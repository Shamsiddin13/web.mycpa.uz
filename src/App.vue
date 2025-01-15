<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from './stores/auth'

const router = useRouter()
const auth = useAuthStore()

onMounted(() => {
  // Initialize auth state from localStorage
  auth.initializeAuth()
})
</script>

<template>
  <router-view></router-view>
</template>

<style>
.page-content {
  padding: 1rem;
}
</style>
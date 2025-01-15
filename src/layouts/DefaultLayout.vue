<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import Header from './components/Header.vue'
import Sidebar from './components/Sidebar.vue'
import Footer from './components/Footer.vue'

// Get initial sidebar state from localStorage or default to true
const isSidebarOpen = ref(localStorage.getItem('sidebarOpen') !== 'false')
const isMobile = ref(false)
const touchStartX = ref(0)

const checkMobile = () => {
  isMobile.value = window.innerWidth <= 768
  if (isMobile.value) {
    isSidebarOpen.value = false
  }
}

const toggleSidebar = () => {
  isSidebarOpen.value = !isSidebarOpen.value
}

// Watch sidebar state and save to localStorage
watch(isSidebarOpen, (newValue) => {
  localStorage.setItem('sidebarOpen', newValue)
})

// Touch handlers for mobile swipe
const handleTouchStart = (e) => {
  touchStartX.value = e.touches[0].clientX
}

const handleTouchEnd = (e) => {
  const touchEndX = e.changedTouches[0].clientX
  const deltaX = touchEndX - touchStartX.value
  
  // Swipe right to open sidebar
  if (deltaX > 50 && !isSidebarOpen.value && isMobile.value) {
    isSidebarOpen.value = true
  }
  // Swipe left to close sidebar
  else if (deltaX < -50 && isSidebarOpen.value && isMobile.value) {
    isSidebarOpen.value = false
  }
}

onMounted(() => {
  checkMobile()
  window.addEventListener('resize', checkMobile)
  document.addEventListener('touchstart', handleTouchStart)
  document.addEventListener('touchend', handleTouchEnd)
})

onUnmounted(() => {
  window.removeEventListener('resize', checkMobile)
  document.removeEventListener('touchstart', handleTouchStart)
  document.removeEventListener('touchend', handleTouchEnd)
})
</script>

<template>
  <div class="layout">
    <!-- Overlay for mobile when sidebar is open -->
    <div 
      v-if="isMobile && isSidebarOpen" 
      class="sidebar-overlay"
      @click="toggleSidebar"
    ></div>
    
    <Sidebar 
      class="sidebar" 
      :class="{ 'sidebar-closed': !isSidebarOpen }" 
      :is-open="isSidebarOpen"
    />
    
    <div class="main-content">
      <Header @toggle-sidebar="toggleSidebar" :is-sidebar-open="isSidebarOpen" />
      <main class="content">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </main>
      <Footer />
    </div>
  </div>
</template>

<style scoped>
.layout {
  display: flex;
  min-height: 100vh;
  background-color: var(--bg-secondary);
}

.sidebar {
  width: 250px;
  flex-shrink: 0;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  will-change: width, transform;
  z-index: 50;
}

.sidebar-closed {
  width: 64px;
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0; /* Prevent content from causing horizontal scroll */
  height: 100vh;
  overflow-y: auto;
}

.content {
  flex: 1;
  padding: 1.5rem;
  overflow-x: hidden;
  background-color: var(--bg-secondary);
}

.sidebar-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 45;
  transition: opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  backdrop-filter: blur(4px);
}

/* Transitions */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

@media (max-width: 768px) {
  .sidebar {
    position: fixed;
    height: 100vh;
    transform: translateX(0);
  }

  .sidebar-closed {
    transform: translateX(-100%);
  }

  .content {
    padding: 1rem;
  }
}
</style>
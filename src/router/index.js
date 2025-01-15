import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import LoginPage from '../pages/auth/LoginPage.vue'
import RegisterPage from '../pages/auth/RegisterPage.vue'
import ResetPasswordPage from '../pages/auth/ResetPasswordPage.vue'
import DefaultLayout from '../layouts/DefaultLayout.vue'
import DashboardPage from '../pages/dashboard/DashboardPage.vue'
import OrderPage from '../pages/orders/orderpage.vue'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: LoginPage,
    meta: { requiresGuest: true }
  },
  {
    path: '/register',
    name: 'Register',
    component: RegisterPage,
    meta: { requiresGuest: true }
  },
  {
    path: '/reset-password',
    name: 'ResetPassword',
    component: ResetPasswordPage,
    meta: { requiresGuest: true }
  },
  {
    path: '/',
    component: DefaultLayout,
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        name: 'Dashboard',
        component: DashboardPage
      },
      {
        path: 'orders',
        name: 'Orders',
        component: OrderPage
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Navigation guard
router.beforeEach(async (to, from, next) => {
  const auth = useAuthStore()
  
  // Initialize auth state if needed
  auth.initializeAuth()

  // Handle protected routes
  if (to.meta.requiresAuth) {
    if (!auth.isAuthenticated) {
      next('/login')
      return
    }
  }

  // Handle guest-only routes (login, register, etc.)
  if (to.meta.requiresGuest && auth.isAuthenticated) {
    next('/')
    return
  }

  next()
})

export default router
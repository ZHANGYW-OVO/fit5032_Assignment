import { createRouter, createWebHistory } from 'vue-router'
import { authStore } from '../stores/auth.js'
import HomePage from '../views/HomePage.vue'
import LoginPage from '../views/LoginPage.vue'
import RegisterPage from '../views/RegisterPage.vue'
import DashboardPage from '../views/DashboardPage.vue'
import HealthResourcesPage from '../views/HealthResourcesPage.vue'
import CommunityPage from '../views/CommunityPage.vue'
import SupportPage from '../views/SupportPage.vue'
import AdminPage from '../views/AdminPage.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: HomePage,
  },
  {
    path: '/login',
    name: 'Login',
    component: LoginPage,
  },
  {
    path: '/register',
    name: 'Register',
    component: RegisterPage,
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: DashboardPage,
    meta: { requiresAuth: true },
  },
  {
    path: '/health-resources',
    name: 'HealthResources',
    component: HealthResourcesPage,
  },
  {
    path: '/community',
    name: 'Community',
    component: CommunityPage,
  },
  {
    path: '/support',
    name: 'Support',
    component: SupportPage,
  },
  {
    path: '/admin',
    name: 'Admin',
    component: AdminPage,
    meta: { requiresAuth: true, requiresAdmin: true },
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

// 路由守卫 - 使用 authStore
router.beforeEach((to, from, next) => {
  // 使用 authStore 检查用户状态
  const isLoggedIn = authStore.isLoggedIn()
  const currentUser = authStore.getCurrentUser()

  if (to.matched.some((record) => record.meta.requiresAuth)) {
    if (!isLoggedIn) {
      next('/login')
    } else if (to.matched.some((record) => record.meta.requiresAdmin)) {
      if (authStore.isAdmin()) {
        next()
      } else {
        next('/dashboard')
      }
    } else {
      next()
    }
  } else {
    // 如果用户已经登录，访问登录或注册页面时重定向到仪表板
    if ((to.name === 'Login' || to.name === 'Register') && isLoggedIn) {
      if (currentUser?.role === 'admin') {
        next('/admin')
      } else {
        next('/dashboard')
      }
    } else {
      next()
    }
  }
})

export default router

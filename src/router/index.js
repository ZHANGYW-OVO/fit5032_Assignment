import { createRouter, createWebHistory } from 'vue-router'
import { authStore } from '../stores/auth.js'

// 导入页面组件
import HomePage from '../views/HomePage.vue'
import LoginPage from '../views/LoginPage.vue'
import RegisterPage from '../views/RegisterPage.vue'
import DashboardPage from '../views/DashboardPage.vue'
import HealthResourcesPage from '../views/HealthResourcesPage.vue'
import CommunityPage from '../views/CommunityPage.vue'
import SupportPage from '../views/SupportPage.vue'
import AdminPage from '../views/AdminPage.vue'

// 导入新的综合仪表板
import ComprehensiveHealthDashboard from '../views/ComprehensiveHealthDashboard.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: HomePage,
    meta: {
      title: 'Elderly Health Charity - Supporting Senior Wellness',
      description: 'Comprehensive health resources and community support for elderly adults',
    },
  },
  {
    path: '/login',
    name: 'Login',
    component: LoginPage,
    meta: {
      title: 'Login - Elderly Health Charity',
      description: 'Sign in to access your health dashboard and community resources',
      guest: true,
    },
  },
  {
    path: '/register',
    name: 'Register',
    component: RegisterPage,
    meta: {
      title: 'Register - Join Our Community',
      description: 'Create an account to access personalized health resources',
      guest: true,
    },
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: DashboardPage,
    meta: {
      title: 'Dashboard - Health Overview',
      description: 'Your personalized health dashboard',
      requiresAuth: true,
    },
  },
  {
    path: '/comprehensive-dashboard',
    name: 'ComprehensiveDashboard',
    component: ComprehensiveHealthDashboard,
    meta: {
      title: 'Comprehensive Health Dashboard',
      description: 'Advanced health analytics and management tools',
      requiresAuth: true,
    },
  },
  {
    path: '/health-resources',
    name: 'HealthResources',
    component: HealthResourcesPage,
    meta: {
      title: 'Health Resources - Educational Materials',
      description: 'Comprehensive health education resources for seniors',
    },
  },
  {
    path: '/community',
    name: 'Community',
    component: CommunityPage,
    meta: {
      title: 'Community Events - Stay Connected',
      description: 'Join community events and connect with fellow members',
    },
  },
  {
    path: '/support',
    name: 'Support',
    component: SupportPage,
    meta: {
      title: 'Support - Get Help',
      description: 'Get support and assistance with your health journey',
    },
  },
  {
    path: '/admin',
    name: 'Admin',
    component: AdminPage,
    meta: {
      title: 'Admin Panel - System Management',
      description: 'Administrative tools and system management',
      requiresAuth: true,
      requiresAdmin: true,
    },
  },

  // 健康分析页面
  {
    path: '/analytics',
    name: 'HealthAnalytics',
    component: () => import('../components/HealthCharts.vue'),
    meta: {
      title: 'Health Analytics - Data Insights',
      description: 'Comprehensive health data analysis and insights',
      requiresAuth: true,
    },
  },

  // 预约管理页面
  {
    path: '/appointments',
    name: 'Appointments',
    component: () => import('../components/AppointmentBooking.vue'),
    meta: {
      title: 'Appointment Booking - Schedule Care',
      description: 'Book and manage medical appointments',
      requiresAuth: true,
    },
  },

  // 医疗机构地图
  {
    path: '/find-care',
    name: 'FindCare',
    component: () => import('../components/HealthMap.vue'),
    meta: {
      title: 'Find Healthcare - Locate Services',
      description: 'Find nearby healthcare facilities and services',
    },
  },

  // 离线功能页面
  {
    path: '/offline',
    name: 'OfflineFeatures',
    component: () => import('../components/OfflineFeatures.vue'),
    meta: {
      title: 'Offline Features - Stay Connected',
      description: 'Use health tracking features even when offline',
      requiresAuth: true,
    },
  },

  // 数据导出页面
  {
    path: '/export',
    name: 'DataExport',
    component: () => import('../views/DataExportPage.vue'),
    meta: {
      title: 'Data Export - Download Reports',
      description: 'Export your health data and reports',
      requiresAuth: true,
    },
  },

  // 无障碍设置页面
  {
    path: '/accessibility',
    name: 'AccessibilitySettings',
    component: () => import('../views/AccessibilityPage.vue'),
    meta: {
      title: 'Accessibility Settings - Customize Experience',
      description: 'Adjust accessibility settings for better usability',
    },
  },

  // 错误页面
  {
    path: '/404',
    name: 'NotFound',
    component: () => import('../views/NotFoundPage.vue'),
    meta: {
      title: '404 - Page Not Found',
      description: 'The page you are looking for does not exist',
    },
  },

  // 重定向所有未匹配的路由到404页面
  {
    path: '/:pathMatch(.*)*',
    redirect: '/404',
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,

  // 滚动行为 - 改善无障碍体验
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else if (to.hash) {
      return {
        el: to.hash,
        behavior: 'smooth',
      }
    } else {
      return {
        top: 0,
        behavior: 'smooth',
      }
    }
  },
})

// 🔥 全局路由守卫 - 修复版本
router.beforeEach(async (to, from, next) => {
  // 更新页面标题和描述
  updatePageMeta(to)

  // 🔥 等待Firebase认证初始化完成
  try {
    console.log('🔍 Router guard: Waiting for Firebase ready...')
    await authStore.waitForFirebaseReady()
    console.log('✅ Router guard: Firebase ready')
  } catch (error) {
    console.error('❌ Router guard: Firebase initialization failed:', error)
    // 即使Firebase初始化失败，也继续路由导航，避免应用卡死
  }

  // 🔥 获取认证状态
  const isLoggedIn = authStore.isLoggedIn()
  const currentUser = authStore.getCurrentUser()

  console.log('🔍 Router guard check:', {
    to: to.path,
    isLoggedIn,
    currentUser: currentUser?.email,
    requiresAuth: to.matched.some((record) => record.meta.requiresAuth),
    guest: to.matched.some((record) => record.meta.guest),
  })

  // 处理需要认证的路由
  if (to.matched.some((record) => record.meta.requiresAuth)) {
    if (!isLoggedIn) {
      console.log('🔒 Router guard: Authentication required, redirecting to login')
      // 保存用户想要访问的页面
      sessionStorage.setItem('redirectAfterLogin', to.fullPath)
      next('/login')
      return
    }

    // 检查管理员权限
    if (to.matched.some((record) => record.meta.requiresAdmin)) {
      if (!authStore.isAdmin()) {
        console.log('🔒 Router guard: Admin access required, redirecting to dashboard')
        // 非管理员用户重定向到普通仪表板
        next('/dashboard')
        return
      }
    }
  }

  // 处理访客专用页面（已登录用户不应访问）
  if (to.matched.some((record) => record.meta.guest)) {
    if (isLoggedIn) {
      console.log('🔄 Router guard: User already logged in, redirecting from guest page')
      // 根据用户角色重定向
      if (currentUser?.role === 'admin') {
        next('/admin')
      } else {
        next('/dashboard')
      }
      return
    }
  }

  // 无障碍功能：页面切换时通知屏幕阅读器
  announceRouteChange(to)

  console.log('✅ Router guard: Navigation allowed to', to.path)
  next()
})

// 路由后置守卫
router.afterEach((to, from) => {
  // 页面加载完成后设置焦点
  setTimeout(() => {
    setPageFocus(to)
  }, 100)

  // 发送页面浏览分析（如果启用）
  trackPageView(to)
})

// 更新页面元数据
function updatePageMeta(route) {
  // 更新页面标题
  document.title = route.meta.title || 'Elderly Health Charity'

  // 更新描述
  let descriptionMeta = document.querySelector('meta[name="description"]')
  if (!descriptionMeta) {
    descriptionMeta = document.createElement('meta')
    descriptionMeta.name = 'description'
    document.head.appendChild(descriptionMeta)
  }
  descriptionMeta.content =
    route.meta.description || 'Supporting the health and wellness of elderly community members'

  // 更新 Open Graph 标签
  updateOpenGraphTags(route)
}

// 更新 Open Graph 标签
function updateOpenGraphTags(route) {
  const ogTags = [
    { property: 'og:title', content: route.meta.title || 'Elderly Health Charity' },
    { property: 'og:description', content: route.meta.description || 'Supporting senior wellness' },
    { property: 'og:type', content: 'website' },
    { property: 'og:url', content: window.location.href },
  ]

  ogTags.forEach((tag) => {
    let element = document.querySelector(`meta[property="${tag.property}"]`)
    if (!element) {
      element = document.createElement('meta')
      element.setAttribute('property', tag.property)
      document.head.appendChild(element)
    }
    element.content = tag.content
  })
}

// 通知屏幕阅读器页面变更
function announceRouteChange(route) {
  const announcement = document.createElement('div')
  announcement.setAttribute('aria-live', 'polite')
  announcement.setAttribute('aria-atomic', 'true')
  announcement.className = 'sr-only'
  announcement.textContent = `Navigated to ${route.meta.title || route.name}`

  document.body.appendChild(announcement)

  // 3秒后移除通知
  setTimeout(() => {
    if (document.body.contains(announcement)) {
      document.body.removeChild(announcement)
    }
  }, 3000)
}

// 设置页面焦点（无障碍功能）
function setPageFocus(route) {
  // 首先尝试找到主要标题
  const mainHeading = document.querySelector('h1')
  if (mainHeading) {
    mainHeading.setAttribute('tabindex', '-1')
    mainHeading.focus()
    return
  }

  // 如果没有h1，尝试找到主要内容区域
  const mainContent = document.querySelector('#main-content, main, [role="main"]')
  if (mainContent) {
    mainContent.setAttribute('tabindex', '-1')
    mainContent.focus()
    return
  }

  // 最后尝试将焦点设置到body
  document.body.focus()
}

// 页面浏览分析
function trackPageView(route) {
  // 只在生产环境且用户同意的情况下发送分析数据
  if (import.meta.env.PROD && window.gtag) {
    window.gtag('config', import.meta.env.VITE_GA_TRACKING_ID, {
      page_title: route.meta.title,
      page_location: window.location.href,
      page_path: route.path,
    })
  }
}

// 🔥 新增：路由守卫错误处理
router.onError((error) => {
  console.error('Router error:', error)

  // 如果是认证相关错误，重定向到登录页面
  if (error.message.includes('auth') || error.message.includes('login')) {
    router.push('/login')
    return
  }

  // 可以在这里添加错误报告逻辑
  if (import.meta.env.PROD) {
    // 发送错误到监控服务
    // sentry.captureException(error)
  }

  // 重定向到错误页面
  router.push('/404')
})

export default router

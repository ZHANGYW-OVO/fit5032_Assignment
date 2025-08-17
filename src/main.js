import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

// Firebase配置
import { auth, signInWithGoogle } from './firebase/config.js'

// 导入认证状态管理
import { authStore } from './stores/auth.js'

// 导入服务
import { emailService } from './services/emailService.js'
import { cloudFunctionsService } from './services/cloudFunctions.js'
import { exportService } from './services/exportService.js'
import { apiService } from './services/apiService.js'

// 导入无障碍设计
import { accessibilityMixin, accessibilityCSS } from './mixins/accessibility.js'

// 添加无障碍CSS到页面
const styleElement = document.createElement('style')
styleElement.textContent = accessibilityCSS
document.head.appendChild(styleElement)

// 全局状态管理
const globalState = {
  // 用户相关
  currentUser: null,
  users: [
    { id: 1, email: 'admin@charity.com', password: 'admin123', role: 'admin', name: 'Admin User' },
    {
      id: 2,
      email: 'volunteer@charity.com',
      password: 'volunteer123',
      role: 'volunteer',
      name: 'Volunteer User',
    },
    { id: 3, email: 'user@charity.com', password: 'user123', role: 'user', name: 'Regular User' },
  ],

  // 健康资源
  healthResources: [
    {
      id: 1,
      title: 'Heart Health Guidelines',
      content: 'Important information about maintaining heart health in elderly years.',
      category: 'Heart Health',
      ratings: [4, 5, 4, 5, 4],
      averageRating: 4.4,
      author: 'Dr. Sarah Wilson',
      publishDate: '2025-01-15',
      downloadCount: 1240,
    },
    {
      id: 2,
      title: 'Diabetes Management',
      content: 'Comprehensive guide for managing diabetes in senior adults.',
      category: 'Diabetes',
      ratings: [5, 4, 5, 4, 5],
      averageRating: 4.6,
      author: 'Endocrinology Team',
      publishDate: '2025-02-20',
      downloadCount: 1580,
    },
    {
      id: 3,
      title: 'Mental Health Support',
      content: 'Resources and support for mental health challenges in elderly populations.',
      category: 'Mental Health',
      ratings: [4, 4, 5, 4, 4],
      averageRating: 4.2,
      author: 'Dr. Lisa Rodriguez',
      publishDate: '2025-03-10',
      downloadCount: 670,
    },
  ],

  // 社区活动
  communityEvents: [
    {
      id: 1,
      title: 'Weekly Health Check',
      date: '2025-08-25',
      description: 'Free health screening for community members',
      location: 'Community Center',
      category: 'health',
      maxParticipants: 30,
      currentParticipants: 18,
    },
    {
      id: 2,
      title: 'Nutrition Workshop',
      date: '2025-08-28',
      description: 'Learn about healthy eating for seniors',
      location: 'Health Center',
      category: 'education',
      maxParticipants: 25,
      currentParticipants: 12,
    },
  ],

  // 预约数据
  appointments: [
    {
      id: 1,
      date: '2025-08-20',
      time: '10:00',
      doctorId: 1,
      doctorName: 'Sarah Johnson',
      patientName: 'John Doe',
      type: 'consultation',
      reason: 'Annual checkup',
      status: 'confirmed',
    },
  ],

  // 健康数据
  healthData: {
    bloodPressure: {
      systolic: 128,
      diastolic: 82,
      trend: -2.3,
    },
    heartRate: {
      current: 74,
      trend: 1.2,
    },
    weight: {
      current: 68.5,
      target: 70,
      trend: -1.8,
    },
    dailySteps: {
      current: 8240,
      goal: 7000,
      trend: 5.6,
    },
  },

  // 医疗机构数据
  healthcareFacilities: [
    {
      id: 1,
      name: 'Melbourne General Hospital',
      type: 'hospital',
      address: '123 Collins Street, Melbourne VIC 3000',
      lat: -37.8136,
      lng: 144.9631,
      phone: '(03) 9342-7000',
      hours: '24/7',
      rating: 4.2,
      services: ['Emergency', 'Surgery', 'Cardiology', 'Oncology'],
    },
    {
      id: 2,
      name: 'Senior Care Clinic',
      type: 'clinic',
      address: '789 Flinders Street, Melbourne VIC 3000',
      lat: -37.817,
      lng: 144.967,
      phone: '(03) 9876-5432',
      hours: 'Mon-Sat 9AM-5PM',
      rating: 4.8,
      services: ['Geriatric Care', 'Physical Therapy', 'Nutrition Counseling'],
    },
  ],

  // 应用设置
  appSettings: {
    accessibility: {
      highContrast: false,
      largeText: false,
      keyboardNavigation: true,
      screenReaderSupport: true,
    },
    notifications: {
      emailReminders: true,
      appointmentAlerts: true,
      healthTips: true,
      medicationReminders: true,
    },
    privacy: {
      dataSharing: false,
      analyticsOptIn: true,
      marketingEmails: false,
    },
  },

  // API统计
  apiStats: {
    totalRequests: 7832,
    todayRequests: 247,
    popularEndpoints: [
      { endpoint: '/health-statistics', requests: 89 },
      { endpoint: '/community-events', requests: 67 },
      { endpoint: '/health-resources', requests: 45 },
    ],
  },
}

// 🔥 简化的Firebase认证初始化 - 只处理弹窗登录
async function initializeFirebaseAuth() {
  console.log('🔥 Initializing Firebase authentication...')

  try {
    // 检查是否有已登录的用户
    const currentFirebaseUser = auth.currentUser
    console.log('🔍 Current Firebase user:', currentFirebaseUser?.email || 'null')

    if (currentFirebaseUser) {
      console.log('✅ Found existing Firebase user, adding to AuthStore...')
      const result = authStore.addFirebaseUser(currentFirebaseUser)

      if (result.success) {
        console.log('✅ Existing user processed successfully')
        window.dispatchEvent(
          new CustomEvent('user-login', {
            detail: result.user,
          }),
        )
      }
    }

    // 监听认证状态变化（用于登录/登出）
    auth.onAuthStateChanged((firebaseUser) => {
      console.log('🔥 Firebase auth state changed:', firebaseUser ? firebaseUser.email : 'No user')

      if (firebaseUser) {
        // 检查是否是新的用户登录
        const currentAuthUser = authStore.getCurrentUser()
        if (!currentAuthUser || currentAuthUser.email !== firebaseUser.email) {
          console.log('🆕 New user login detected, processing...')
          const result = authStore.addFirebaseUser(firebaseUser)

          if (result.success) {
            window.dispatchEvent(
              new CustomEvent('user-login', {
                detail: result.user,
              }),
            )
          }
        }
      } else {
        // Firebase用户登出
        if (authStore.isGoogleUser()) {
          console.log('🚪 Firebase user signed out, clearing AuthStore...')
          authStore.logout()
          window.dispatchEvent(new CustomEvent('user-logout'))
        }
      }
    })

    // 标记Firebase为就绪状态
    authStore.setFirebaseReady(true)
    console.log('✅ Firebase authentication initialized')
  } catch (error) {
    console.error('❌ Firebase auth initialization failed:', error)
    authStore.setFirebaseReady(true)
  }
}

// 服务初始化
async function initializeServices() {
  try {
    // 初始化邮件服务
    await emailService.initialize()
    console.log('✅ Email service initialized')

    // 检查在线状态
    console.log('🌐 Connection status:', cloudFunctionsService.getConnectionStatus())

    // 加载用户设置
    loadUserSettings()

    // 设置服务工作器（如果支持）
    if ('serviceWorker' in navigator) {
      registerServiceWorker()
    }

    console.log('✅ All services initialized successfully')
  } catch (error) {
    console.error('❌ Service initialization failed:', error)
  }
}

// 加载用户设置
function loadUserSettings() {
  try {
    const savedSettings = localStorage.getItem('appSettings')
    if (savedSettings) {
      globalState.appSettings = { ...globalState.appSettings, ...JSON.parse(savedSettings) }
    }
  } catch (error) {
    console.error('Failed to load user settings:', error)
  }
}

// 注册Service Worker用于离线功能
async function registerServiceWorker() {
  try {
    if (import.meta.env.PROD) {
      const registration = await navigator.serviceWorker.register('/sw.js')
      console.log('✅ Service Worker registered:', registration)
    }
  } catch (error) {
    console.error('❌ Service Worker registration failed:', error)
  }
}

// 全局错误处理
window.addEventListener('error', (event) => {
  console.error('Global error:', event.error)
})

// 未处理的Promise拒绝
window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason)
  event.preventDefault()
})

// 应用初始化流程
async function initializeApp() {
  try {
    console.log('🚀 Starting app initialization...')

    // 1. 初始化Firebase认证
    await initializeFirebaseAuth()

    // 2. 初始化其他服务
    await initializeServices()

    // 3. 创建Vue应用
    const app = createApp(App)

    // 4. 提供全局状态和服务
    app.provide('globalState', globalState)
    app.provide('authStore', authStore)
    app.provide('emailService', emailService)
    app.provide('cloudFunctionsService', cloudFunctionsService)
    app.provide('exportService', exportService)
    app.provide('apiService', apiService)

    // 5. 注册全局混入
    app.mixin(accessibilityMixin)

    // 6. 全局属性
    app.config.globalProperties.$services = {
      email: emailService,
      cloudFunctions: cloudFunctionsService,
      export: exportService,
      api: apiService,
    }

    app.config.globalProperties.$auth = authStore

    // 7. 全局错误处理器
    app.config.errorHandler = (err, instance, info) => {
      console.error('Vue error:', err, info)
    }

    // 8. 使用路由
    app.use(router)

    // 9. 挂载应用
    app.mount('#app')

    console.log('✅ App initialization completed')

    // 10. 应用启动后的初始化
    setTimeout(() => {
      preloadCriticalResources()
      checkForUpdates()
      trackPageLoad()
    }, 1000)
  } catch (error) {
    console.error('❌ App initialization failed:', error)
    document.body.innerHTML = `
      <div style="display: flex; justify-content: center; align-items: center; height: 100vh; flex-direction: column; font-family: Arial, sans-serif;">
        <h1 style="color: #dc3545;">应用初始化失败</h1>
        <p style="color: #666; margin: 10px 0;">请刷新页面重试</p>
        <button onclick="window.location.reload()" style="padding: 10px 20px; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer;">
          刷新页面
        </button>
      </div>
    `
  }
}

// 预加载关键资源
function preloadCriticalResources() {
  const fontLink = document.createElement('link')
  fontLink.rel = 'preload'
  fontLink.href = '/fonts/inter-var.woff2'
  fontLink.as = 'font'
  fontLink.type = 'font/woff2'
  fontLink.crossOrigin = 'anonymous'
  document.head.appendChild(fontLink)

  const images = ['/images/logo.svg', '/images/hero-image.jpg']
  images.forEach((src) => {
    const link = document.createElement('link')
    link.rel = 'preload'
    link.href = src
    link.as = 'image'
    document.head.appendChild(link)
  })
}

// 检查应用更新
function checkForUpdates() {
  if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
    navigator.serviceWorker.addEventListener('message', (event) => {
      if (event.data.type === 'UPDATE_AVAILABLE') {
        showUpdateNotification()
      }
    })
  }
}

// 显示更新通知
function showUpdateNotification() {
  const notification = document.createElement('div')
  notification.className = 'update-notification'
  notification.innerHTML = `
    <div class="update-content">
      <span>🔄 A new version is available!</span>
      <button onclick="window.location.reload()">Update Now</button>
      <button onclick="this.parentElement.parentElement.remove()">Later</button>
    </div>
  `

  const style = document.createElement('style')
  style.textContent = `
    .update-notification {
      position: fixed;
      top: 20px;
      right: 20px;
      background: #007bff;
      color: white;
      padding: 15px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      z-index: 10000;
      max-width: 300px;
    }
    .update-content {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    .update-content button {
      padding: 8px 12px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
    }
    .update-content button:first-of-type {
      background: white;
      color: #007bff;
    }
    .update-content button:last-of-type {
      background: transparent;
      color: white;
      border: 1px solid white;
    }
  `

  document.head.appendChild(style)
  document.body.appendChild(notification)

  setTimeout(() => {
    if (notification.parentElement) {
      notification.remove()
    }
  }, 10000)
}

// 页面加载分析
function trackPageLoad() {
  const loadTime = performance.now()
  console.log(`📊 Page loaded in ${loadTime.toFixed(2)}ms`)

  if (globalState.appSettings.privacy.analyticsOptIn) {
    // gtag('event', 'page_load', { load_time: loadTime })
  }
}

// 🔥 开发环境下暴露调试变量
if (import.meta.env.DEV) {
  window.debugAuth = authStore

  window.debugFirebase = {
    auth,
    signInWithGoogle,
  }

  console.log('🔧 调试变量已暴露:')
  console.log('- window.debugAuth (AuthStore)')
  console.log('- window.debugFirebase (Firebase 工具)')

  window.debugApp = {
    globalState,
    authStore,
    services: {
      email: emailService,
      cloudFunctions: cloudFunctionsService,
      export: exportService,
      api: apiService,
    },
  }

  // 测试Google登录
  window.testGoogleLogin = async () => {
    console.log('🧪 Testing Google popup login...')
    try {
      const result = await signInWithGoogle()
      console.log('✅ Test result:', result)

      if (result.success) {
        const authResult = authStore.addFirebaseUser(result.user)
        console.log('📝 AuthStore result:', authResult)
      }

      return result
    } catch (error) {
      console.error('❌ Test failed:', error)
      throw error
    }
  }

  // 检查认证状态
  window.checkAuthState = () => {
    return {
      authStore: authStore.getDebugInfo(),
      firebase: auth.currentUser?.email || 'null',
      path: window.location.pathname,
    }
  }

  console.log('🎯 可用的调试命令:')
  console.log('- window.testGoogleLogin() // 测试Google登录')
  console.log('- window.checkAuthState() // 检查认证状态')
}

// 启动应用
initializeApp()

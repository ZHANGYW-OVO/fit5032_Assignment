<template>
  <nav class="navbar">
    <div class="nav-container">
      <!-- Logo -->
      <div class="nav-logo">
        <router-link to="/" class="logo-link">
          <span class="logo-text">Elderly Health</span>
        </router-link>
      </div>

      <!-- 移动端菜单按钮 -->
      <button class="mobile-menu-btn" @click="toggleMobileMenu" :class="{ active: showMobileMenu }">
        <span></span>
        <span></span>
        <span></span>
      </button>

      <!-- 导航菜单 -->
      <div class="nav-menu" :class="{ active: showMobileMenu }">
        <!-- 公共导航链接 -->
        <div class="nav-links">
          <router-link to="/" class="nav-link" @click="closeMobileMenu">Home</router-link>
          <router-link to="/health-resources" class="nav-link" @click="closeMobileMenu"
            >Resources</router-link
          >
          <router-link to="/community" class="nav-link" @click="closeMobileMenu"
            >Community</router-link
          >
          <router-link to="/find-care" class="nav-link" @click="closeMobileMenu"
            >Find Care</router-link
          >

          <!-- 认证后才显示的链接 -->
          <template v-if="isLoggedIn">
            <router-link to="/dashboard" class="nav-link" @click="closeMobileMenu"
              >Dashboard</router-link
            >
            <router-link to="/appointments" class="nav-link" @click="closeMobileMenu"
              >Appointments</router-link
            >

            <!-- 管理员链接 -->
            <router-link
              v-if="isAdmin"
              to="/admin"
              class="nav-link admin-link"
              @click="closeMobileMenu"
            >
              Admin
            </router-link>
          </template>
        </div>

        <!-- 用户区域 -->
        <div class="nav-user">
          <!-- 未登录状态 -->
          <template v-if="!isLoggedIn">
            <router-link to="/login" class="nav-btn login-btn" @click="closeMobileMenu">
              Sign In
            </router-link>
            <router-link to="/register" class="nav-btn register-btn" @click="closeMobileMenu">
              Register
            </router-link>
          </template>

          <!-- 已登录状态 -->
          <template v-else>
            <!-- 用户信息 -->
            <div class="user-info" @click="toggleUserMenu">
              <img v-if="userAvatar" :src="userAvatar" :alt="userName" class="user-avatar" />
              <div v-else class="user-avatar-placeholder">
                {{ userInitials }}
              </div>
              <span class="user-name">{{ userName }}</span>
              <svg class="dropdown-icon" :class="{ rotated: showUserMenu }" viewBox="0 0 24 24">
                <path d="M7 10l5 5 5-5z" />
              </svg>
            </div>

            <!-- 用户下拉菜单 -->
            <div v-if="showUserMenu" class="user-dropdown" @click.stop>
              <div class="user-dropdown-header">
                <div class="user-details">
                  <div class="user-name-full">{{ userName }}</div>
                  <div class="user-email">{{ userEmail }}</div>
                  <div class="user-role">{{ userRole }}</div>
                </div>
              </div>

              <div class="user-dropdown-menu">
                <router-link to="/dashboard" class="dropdown-item" @click="closeUserMenu">
                  <span>📊</span> Dashboard
                </router-link>
                <router-link
                  to="/comprehensive-dashboard"
                  class="dropdown-item"
                  @click="closeUserMenu"
                >
                  <span>📈</span> Health Analytics
                </router-link>
                <router-link to="/export" class="dropdown-item" @click="closeUserMenu">
                  <span>📥</span> Export Data
                </router-link>
                <router-link to="/accessibility" class="dropdown-item" @click="closeUserMenu">
                  <span>♿</span> Accessibility
                </router-link>

                <hr class="dropdown-divider" />

                <button @click="handleLogout" class="dropdown-item logout-item">
                  <span>🚪</span> Sign Out
                </button>
              </div>
            </div>
          </template>
        </div>
      </div>
    </div>

    <!-- 移动端背景遮罩 -->
    <div v-if="showMobileMenu" class="mobile-overlay" @click="closeMobileMenu"></div>
  </nav>
</template>

<script>
import { authStore } from '../stores/auth.js'
import { signOutUser } from '../firebase/config.js'

export default {
  name: 'NavBar',
  data() {
    return {
      showMobileMenu: false,
      showUserMenu: false,
      // 🔥 响应式认证状态
      authState: {
        isLoggedIn: false,
        currentUser: null,
      },
    }
  },
  computed: {
    isLoggedIn() {
      return this.authState.isLoggedIn
    },
    currentUser() {
      return this.authState.currentUser
    },
    userName() {
      return this.currentUser?.name || 'User'
    },
    userEmail() {
      return this.currentUser?.email || ''
    },
    userRole() {
      const role = this.currentUser?.role || 'user'
      return role.charAt(0).toUpperCase() + role.slice(1)
    },
    userInitials() {
      if (!this.currentUser?.name) return 'U'
      return this.currentUser.name
        .split(' ')
        .map((word) => word[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    },
    userAvatar() {
      return this.currentUser?.photo || null
    },
    isAdmin() {
      return this.currentUser?.role === 'admin'
    },
  },
  mounted() {
    console.log('🔧 NavBar mounted, setting up auth monitoring...')

    // 🔥 初始化认证状态
    this.updateAuthState()

    // 🔥 监听全局登录/登出事件
    window.addEventListener('user-login', this.handleUserLogin)
    window.addEventListener('user-logout', this.handleUserLogout)

    // 🔥 简化：只需要定期检查一次状态变化，不需要每秒检查
    this.authCheckInterval = setInterval(() => {
      this.updateAuthState()
    }, 5000) // 改为5秒检查一次

    // 🔥 监听点击事件关闭下拉菜单
    document.addEventListener('click', this.handleDocumentClick)

    console.log('🔧 NavBar auth state initialized:', this.authState)
  },
  beforeUnmount() {
    // 清理事件监听器
    window.removeEventListener('user-login', this.handleUserLogin)
    window.removeEventListener('user-logout', this.handleUserLogout)
    document.removeEventListener('click', this.handleDocumentClick)

    if (this.authCheckInterval) {
      clearInterval(this.authCheckInterval)
    }
  },
  methods: {
    // 🔥 更新认证状态
    updateAuthState() {
      const newAuthState = {
        isLoggedIn: authStore.isLoggedIn(),
        currentUser: authStore.getCurrentUser(),
      }

      // 只在状态真正变化时更新
      if (JSON.stringify(newAuthState) !== JSON.stringify(this.authState)) {
        console.log('🔧 NavBar auth state updated:', newAuthState)
        this.authState = newAuthState
      }
    },

    // 🔥 处理用户登录事件
    handleUserLogin(event) {
      console.log('🔧 NavBar received user-login event:', event.detail)
      this.updateAuthState()
      this.closeMobileMenu()
    },

    // 🔥 处理用户登出事件
    handleUserLogout() {
      console.log('🔧 NavBar received user-logout event')
      this.updateAuthState()
      this.closeUserMenu()
      this.closeMobileMenu()
    },

    // 处理登出
    async handleLogout() {
      try {
        console.log('🔧 NavBar handling logout...')

        // 1. Firebase登出（如果是Google用户）
        if (authStore.isGoogleUser()) {
          await signOutUser()
          console.log('✅ Firebase user signed out')
        }

        // 2. AuthStore登出
        authStore.logout()
        console.log('✅ AuthStore user logged out')

        // 3. 触发全局登出事件
        window.dispatchEvent(new CustomEvent('user-logout'))

        // 4. 关闭菜单
        this.closeUserMenu()
        this.closeMobileMenu()

        // 5. 重定向到首页
        this.$router.push('/')
      } catch (error) {
        console.error('❌ Logout failed:', error)
        // 即使Firebase登出失败，也要清理本地状态
        authStore.logout()
        this.updateAuthState()
        this.$router.push('/')
      }
    },

    // 切换移动端菜单
    toggleMobileMenu() {
      this.showMobileMenu = !this.showMobileMenu
      if (this.showMobileMenu) {
        this.showUserMenu = false
      }
    },

    // 关闭移动端菜单
    closeMobileMenu() {
      this.showMobileMenu = false
    },

    // 切换用户菜单
    toggleUserMenu() {
      this.showUserMenu = !this.showUserMenu
    },

    // 关闭用户菜单
    closeUserMenu() {
      this.showUserMenu = false
    },

    // 处理文档点击
    handleDocumentClick(event) {
      // 如果点击的不是用户菜单区域，则关闭用户菜单
      if (!event.target.closest('.user-info') && !event.target.closest('.user-dropdown')) {
        this.showUserMenu = false
      }
    },
  },
}
</script>

<style scoped>
.navbar {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  height: 70px;
}

.nav-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.nav-logo .logo-link {
  text-decoration: none;
  color: white;
}

.logo-text {
  font-size: 24px;
  font-weight: bold;
  color: white;
}

.mobile-menu-btn {
  display: none;
  flex-direction: column;
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;
}

.mobile-menu-btn span {
  width: 25px;
  height: 3px;
  background: white;
  margin: 3px 0;
  transition: 0.3s;
}

.nav-menu {
  display: flex;
  align-items: center;
  gap: 30px;
}

.nav-links {
  display: flex;
  gap: 25px;
}

.nav-link {
  color: white;
  text-decoration: none;
  padding: 8px 16px;
  border-radius: 4px;
  transition: all 0.3s ease;
  font-weight: 500;
}

.nav-link:hover,
.nav-link.router-link-active {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-1px);
}

.admin-link {
  background: rgba(255, 215, 0, 0.2);
  border: 1px solid rgba(255, 215, 0, 0.3);
}

.nav-user {
  display: flex;
  align-items: center;
  gap: 15px;
  position: relative;
}

.nav-btn {
  padding: 10px 20px;
  border-radius: 6px;
  text-decoration: none;
  font-weight: 600;
  transition: all 0.3s ease;
}

.login-btn {
  color: white;
  border: 2px solid white;
  background: transparent;
}

.login-btn:hover {
  background: white;
  color: #667eea;
}

.register-btn {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: 2px solid transparent;
}

.register-btn:hover {
  background: white;
  color: #667eea;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
  border-radius: 25px;
  background: rgba(255, 255, 255, 0.1);
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.user-info:hover {
  background: rgba(255, 255, 255, 0.2);
}

.user-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
}

.user-avatar-placeholder {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  color: white;
  font-size: 14px;
}

.user-name {
  color: white;
  font-weight: 500;
  max-width: 120px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.dropdown-icon {
  width: 20px;
  height: 20px;
  fill: white;
  transition: transform 0.3s ease;
}

.dropdown-icon.rotated {
  transform: rotate(180deg);
}

.user-dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  background: white;
  border-radius: 8px;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  min-width: 240px;
  z-index: 1001;
  margin-top: 8px;
  overflow: hidden;
}

.user-dropdown-header {
  padding: 16px;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-bottom: 1px solid #dee2e6;
}

.user-details {
  text-align: left;
}

.user-name-full {
  font-weight: 600;
  color: #2c3e50;
  font-size: 16px;
  margin-bottom: 4px;
}

.user-email {
  color: #6c757d;
  font-size: 14px;
  margin-bottom: 4px;
}

.user-role {
  background: #007bff;
  color: white;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  display: inline-block;
}

.user-dropdown-menu {
  padding: 8px 0;
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  color: #2c3e50;
  text-decoration: none;
  transition: background-color 0.2s ease;
  border: none;
  background: none;
  width: 100%;
  text-align: left;
  cursor: pointer;
  font-size: 14px;
}

.dropdown-item:hover {
  background: #f8f9fa;
}

.logout-item {
  color: #dc3545;
  border-top: 1px solid #dee2e6;
  margin-top: 4px;
  padding-top: 12px;
}

.logout-item:hover {
  background: #fff5f5;
}

.dropdown-divider {
  border: none;
  border-top: 1px solid #dee2e6;
  margin: 8px 0;
}

.mobile-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 999;
}

/* 移动端样式 */
@media (max-width: 768px) {
  .navbar {
    height: 60px;
  }

  .nav-container {
    padding: 0 15px;
  }

  .logo-text {
    font-size: 20px;
  }

  .mobile-menu-btn {
    display: flex;
    z-index: 1002;
  }

  .mobile-menu-btn.active span:nth-child(1) {
    transform: rotate(-45deg) translate(-6px, 6px);
  }

  .mobile-menu-btn.active span:nth-child(2) {
    opacity: 0;
  }

  .mobile-menu-btn.active span:nth-child(3) {
    transform: rotate(45deg) translate(-6px, -6px);
  }

  .nav-menu {
    position: fixed;
    top: 60px;
    left: 0;
    right: 0;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    flex-direction: column;
    padding: 20px;
    gap: 20px;
    transform: translateY(-100%);
    transition: transform 0.3s ease;
    z-index: 1001;
    max-height: calc(100vh - 60px);
    overflow-y: auto;
  }

  .nav-menu.active {
    transform: translateY(0);
  }

  .nav-links {
    flex-direction: column;
    gap: 15px;
    width: 100%;
  }

  .nav-link {
    padding: 12px 16px;
    text-align: center;
    border-radius: 6px;
  }

  .nav-user {
    flex-direction: column;
    gap: 15px;
    width: 100%;
  }

  .nav-btn {
    text-align: center;
    width: 100%;
  }

  .user-info {
    justify-content: center;
    width: 100%;
  }

  .user-dropdown {
    position: static;
    margin-top: 0;
    box-shadow: none;
    border: 1px solid rgba(255, 255, 255, 0.2);
  }

  .user-name {
    max-width: none;
  }
}

@media (max-width: 480px) {
  .nav-container {
    padding: 0 10px;
  }

  .logo-text {
    font-size: 18px;
  }

  .nav-menu {
    padding: 15px;
  }

  .user-dropdown {
    min-width: auto;
    width: 100%;
  }
}
</style>

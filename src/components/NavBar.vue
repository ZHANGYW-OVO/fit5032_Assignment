<template>
  <nav class="navbar">
    <div class="navbar-container">
      <!-- Logo and Brand -->
      <div class="navbar-brand">
        <router-link to="/" class="brand-link">
          <div class="brand-icon">🏥</div>
          <span class="brand-text">Elderly Health Charity</span>
        </router-link>
      </div>

      <!-- Mobile Menu Toggle -->
      <button class="mobile-toggle" @click="toggleMobileMenu" :class="{ active: mobileMenuOpen }">
        <span class="hamburger-line"></span>
        <span class="hamburger-line"></span>
        <span class="hamburger-line"></span>
      </button>

      <!-- Navigation Menu -->
      <div class="navbar-menu" :class="{ active: mobileMenuOpen }">
        <div class="navbar-nav">
          <router-link to="/" class="nav-link" @click="closeMobileMenu">Home</router-link>
          <router-link to="/health-resources" class="nav-link" @click="closeMobileMenu">
            Health Resources
          </router-link>
          <router-link to="/community" class="nav-link" @click="closeMobileMenu">
            Community
          </router-link>
          <router-link to="/support" class="nav-link" @click="closeMobileMenu">Support</router-link>
        </div>

        <!-- User Menu -->
        <div class="navbar-user">
          <div v-if="currentUser" class="user-menu">
            <div class="user-info" @click="toggleUserDropdown">
              <span class="user-name">{{ currentUser.name }}</span>
              <span class="user-role" :class="`role-${currentUser.role}`">
                {{ getRoleLabel(currentUser.role) }}
              </span>
              <span class="dropdown-arrow">▼</span>
            </div>
            <div v-if="userDropdownOpen" class="user-dropdown">
              <router-link to="/dashboard" class="dropdown-link" @click="closeDropdown">
                Dashboard
              </router-link>
              <router-link
                v-if="currentUser.role === 'admin'"
                to="/admin"
                class="dropdown-link"
                @click="closeDropdown"
              >
                Admin Panel
              </router-link>
              <div class="dropdown-divider"></div>
              <button class="dropdown-link logout-btn" @click="handleLogout">Logout</button>
            </div>
          </div>
          <div v-else class="auth-buttons">
            <router-link to="/login" class="btn btn-secondary" @click="closeMobileMenu">
              Login
            </router-link>
            <router-link to="/register" class="btn btn-primary" @click="closeMobileMenu">
              Register
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </nav>
</template>

<script>
import { authStore } from '../stores/auth.js'

export default {
  name: 'NavBar',
  data() {
    return {
      currentUser: null,
      mobileMenuOpen: false,
      userDropdownOpen: false,
    }
  },
  mounted() {
    this.checkUser()
    // 监听自定义登录事件
    window.addEventListener('user-login', this.handleUserLogin)
    // 监听自定义登出事件
    window.addEventListener('user-logout', this.handleUserLogout)
    // Listen for clicks outside to close dropdowns
    document.addEventListener('click', this.handleOutsideClick)
  },
  beforeUnmount() {
    window.removeEventListener('user-login', this.handleUserLogin)
    window.removeEventListener('user-logout', this.handleUserLogout)
    document.removeEventListener('click', this.handleOutsideClick)
  },
  methods: {
    checkUser() {
      // 使用 authStore 检查当前用户状态
      this.currentUser = authStore.getCurrentUser()
    },
    handleUserLogin(event) {
      // 处理登录事件
      this.currentUser = event.detail || authStore.getCurrentUser()
    },
    handleUserLogout() {
      // 处理登出事件
      this.currentUser = null
    },
    getRoleLabel(role) {
      const roleLabels = {
        admin: 'Administrator',
        volunteer: 'Volunteer',
        user: 'Member',
      }
      return roleLabels[role] || 'User'
    },
    toggleMobileMenu() {
      this.mobileMenuOpen = !this.mobileMenuOpen
      this.userDropdownOpen = false
    },
    closeMobileMenu() {
      this.mobileMenuOpen = false
    },
    toggleUserDropdown() {
      this.userDropdownOpen = !this.userDropdownOpen
    },
    closeDropdown() {
      this.userDropdownOpen = false
      this.mobileMenuOpen = false
    },
    handleOutsideClick(event) {
      const navbar = this.$el
      if (navbar && !navbar.contains(event.target)) {
        this.userDropdownOpen = false
        this.mobileMenuOpen = false
      }
    },
    handleLogout() {
      // 使用 authStore 进行登出
      authStore.logout()
      this.currentUser = null
      this.closeDropdown()

      // 触发自定义登出事件
      window.dispatchEvent(new CustomEvent('user-logout'))

      // Redirect to home page
      this.$router.push('/')
    },
  },
}
</script>

<style scoped>
.navbar {
  background: linear-gradient(135deg, #2c3e50, #34495e);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  height: 70px;
}

.navbar-container {
  max-width: 1200px;
  margin: 0 auto;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
}

.navbar-brand {
  display: flex;
  align-items: center;
}

.brand-link {
  display: flex;
  align-items: center;
  text-decoration: none;
  color: white;
  font-weight: bold;
  font-size: 18px;
}

.brand-icon {
  font-size: 32px;
  margin-right: 12px;
}

.brand-text {
  font-size: 20px;
}

.mobile-toggle {
  display: none;
  flex-direction: column;
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;
}

.hamburger-line {
  width: 25px;
  height: 3px;
  background-color: white;
  margin: 3px 0;
  transition: all 0.3s ease;
}

.mobile-toggle.active .hamburger-line:nth-child(1) {
  transform: rotate(45deg) translate(6px, 6px);
}

.mobile-toggle.active .hamburger-line:nth-child(2) {
  opacity: 0;
}

.mobile-toggle.active .hamburger-line:nth-child(3) {
  transform: rotate(-45deg) translate(6px, -6px);
}

.navbar-menu {
  display: flex;
  align-items: center;
  gap: 40px;
}

.navbar-nav {
  display: flex;
  align-items: center;
  gap: 30px;
}

.nav-link {
  color: white;
  text-decoration: none;
  font-size: 16px;
  font-weight: 500;
  padding: 8px 16px;
  border-radius: 6px;
  transition: all 0.3s ease;
}

.nav-link:hover {
  background-color: rgba(255, 255, 255, 0.1);
  color: #3498db;
}

.nav-link.router-link-active {
  background-color: #3498db;
  color: white;
}

.navbar-user {
  position: relative;
}

.user-menu {
  position: relative;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
  color: white;
  cursor: pointer;
  padding: 8px 12px;
  border-radius: 6px;
  transition: background-color 0.3s ease;
}

.user-info:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.user-name {
  font-weight: 600;
  font-size: 15px;
}

.user-role {
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 12px;
  font-weight: bold;
  text-transform: uppercase;
}

.role-admin {
  background-color: #e74c3c;
  color: white;
}

.role-volunteer {
  background-color: #f39c12;
  color: white;
}

.role-user {
  background-color: #27ae60;
  color: white;
}

.dropdown-arrow {
  font-size: 12px;
  transition: transform 0.3s ease;
}

.user-dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  background: white;
  border-radius: 8px;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.2);
  padding: 8px 0;
  min-width: 180px;
  z-index: 1001;
  margin-top: 8px;
}

.dropdown-link {
  display: block;
  padding: 10px 16px;
  color: #2c3e50;
  text-decoration: none;
  font-size: 14px;
  transition: background-color 0.3s ease;
  border: none;
  background: none;
  width: 100%;
  text-align: left;
  cursor: pointer;
}

.dropdown-link:hover {
  background-color: #f8f9fa;
}

.dropdown-divider {
  height: 1px;
  background-color: #eee;
  margin: 8px 0;
}

.logout-btn {
  color: #e74c3c;
  font-weight: 600;
}

.logout-btn:hover {
  background-color: #ffeaea;
}

.auth-buttons {
  display: flex;
  gap: 15px;
  align-items: center;
}

.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  text-decoration: none;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: inline-block;
  text-align: center;
}

.btn-primary {
  background-color: #3498db;
  color: white;
}

.btn-primary:hover {
  background-color: #2980b9;
  transform: translateY(-1px);
}

.btn-secondary {
  background-color: transparent;
  color: white;
  border: 2px solid white;
}

.btn-secondary:hover {
  background-color: white;
  color: #2c3e50;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .navbar {
    height: 60px;
  }

  .brand-text {
    font-size: 16px;
  }

  .brand-icon {
    font-size: 24px;
    margin-right: 8px;
  }

  .mobile-toggle {
    display: flex;
  }

  .navbar-menu {
    position: fixed;
    top: 60px;
    left: 0;
    right: 0;
    background: linear-gradient(135deg, #2c3e50, #34495e);
    flex-direction: column;
    padding: 20px;
    transform: translateX(-100%);
    transition: transform 0.3s ease;
    height: calc(100vh - 60px);
    overflow-y: auto;
  }

  .navbar-menu.active {
    transform: translateX(0);
  }

  .navbar-nav {
    flex-direction: column;
    gap: 15px;
    width: 100%;
    margin-bottom: 30px;
  }

  .nav-link {
    width: 100%;
    text-align: center;
    padding: 15px;
    font-size: 18px;
  }

  .navbar-user {
    width: 100%;
  }

  .user-info {
    justify-content: center;
    padding: 15px;
    font-size: 16px;
  }

  .user-dropdown {
    position: static;
    box-shadow: none;
    background: rgba(255, 255, 255, 0.1);
    margin-top: 10px;
  }

  .dropdown-link {
    color: white;
    font-size: 16px;
    padding: 15px;
  }

  .dropdown-link:hover {
    background-color: rgba(255, 255, 255, 0.1);
  }

  .auth-buttons {
    flex-direction: column;
    width: 100%;
    gap: 10px;
  }

  .btn {
    width: 100%;
    padding: 15px;
    font-size: 16px;
  }
}

@media (max-width: 480px) {
  .navbar-container {
    padding: 0 15px;
  }

  .brand-text {
    display: none;
  }
}
</style>

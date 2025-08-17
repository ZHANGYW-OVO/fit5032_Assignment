<template>
  <div class="login-page">
    <div class="login-container">
      <div class="login-card">
        <h2 class="login-title">Welcome Back</h2>
        <p class="login-subtitle">Sign in to access your account</p>

        <!-- 外部认证选项 -->
        <div class="external-auth">
          <button @click="handleGoogleLogin" class="btn btn-google" :disabled="loading">
            <span class="google-icon">🔒</span>
            {{ loading ? 'Signing in...' : 'Continue with Google' }}
          </button>
        </div>

        <!-- 分隔线 -->
        <div class="divider">
          <span>OR</span>
        </div>

        <!-- 传统登录表单 -->
        <form @submit.prevent="handleLogin" class="login-form">
          <div class="form-group">
            <label for="email" class="form-label">Email Address</label>
            <input
              type="email"
              id="email"
              v-model="form.email"
              class="form-input"
              :class="{ error: errors.email }"
              placeholder="Enter your email"
              @blur="validateEmail"
            />
            <div v-if="errors.email" class="error-message">{{ errors.email }}</div>
          </div>

          <div class="form-group">
            <label for="password" class="form-label">Password</label>
            <input
              type="password"
              id="password"
              v-model="form.password"
              class="form-input"
              :class="{ error: errors.password }"
              placeholder="Enter your password"
              @blur="validatePassword"
            />
            <div v-if="errors.password" class="error-message">{{ errors.password }}</div>
          </div>

          <div v-if="loginError" class="error-message">{{ loginError }}</div>

          <button
            type="submit"
            class="btn btn-primary login-btn"
            :disabled="!isFormValid || loading"
          >
            Sign In
          </button>
        </form>

        <!-- 页面底部 -->
        <div class="login-footer">
          <p>
            Don't have an account?
            <router-link to="/register" class="register-link">Register here</router-link>
          </p>
        </div>

        <!-- 测试账号信息 -->
        <div class="test-accounts">
          <h3>Test Accounts:</h3>
          <div class="account-info">
            <p><strong>Admin:</strong> admin@charity.com / admin123</p>
            <p><strong>Volunteer:</strong> volunteer@charity.com / volunteer123</p>
            <p><strong>User:</strong> user@charity.com / user123</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { authStore } from '../stores/auth.js'
import { signInWithGoogle } from '../firebase/config.js'

export default {
  name: 'LoginPage',
  data() {
    return {
      form: {
        email: '',
        password: '',
      },
      errors: {
        email: '',
        password: '',
      },
      loginError: '',
      loading: false,
    }
  },
  computed: {
    isFormValid() {
      return this.form.email && this.form.password && !this.errors.email && !this.errors.password
    },
  },
  mounted() {
    console.log('🔐 LoginPage mounted')

    // 检查是否已经登录
    if (authStore.isLoggedIn()) {
      console.log('✅ User already logged in, redirecting...')
      this.redirectToDashboard()
    }
  },
  methods: {
    // 🔥 Google登录处理 - 只使用弹窗
    async handleGoogleLogin() {
      this.loading = true
      this.loginError = ''

      try {
        console.log('🚀 Starting Google popup login...')

        const result = await signInWithGoogle()

        if (result.success && result.user) {
          console.log('✅ Google login successful:', result.user)

          // 添加用户到AuthStore
          const authResult = authStore.addFirebaseUser(result.user)
          console.log('🔥 AuthStore result:', authResult)

          if (authResult.success) {
            // 触发全局登录事件
            window.dispatchEvent(
              new CustomEvent('user-login', {
                detail: authResult.user,
              }),
            )

            console.log('🎉 Login completed, redirecting...')

            // 立即重定向
            this.redirectToDashboard()
          } else {
            this.loginError = authResult.message
          }
        } else {
          this.loginError = result.message || 'Google login failed'
        }
      } catch (error) {
        console.error('❌ Google login error:', error)
        this.loginError = 'Google login failed. Please try again.'
      } finally {
        this.loading = false
      }
    },

    // 重定向到dashboard
    redirectToDashboard() {
      const currentUser = authStore.getCurrentUser()
      console.log('🔄 Redirecting user:', currentUser)

      // 检查是否有保存的重定向路径
      const redirectPath = sessionStorage.getItem('redirectAfterLogin')
      if (redirectPath) {
        sessionStorage.removeItem('redirectAfterLogin')
        this.$router.push(redirectPath)
      } else {
        // 根据用户角色重定向
        if (currentUser?.role === 'admin') {
          this.$router.push('/admin')
        } else {
          this.$router.push('/dashboard')
        }
      }
    },

    // 表单验证方法
    validateEmail() {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!this.form.email) {
        this.errors.email = 'Email is required'
      } else if (!emailRegex.test(this.form.email)) {
        this.errors.email = 'Please enter a valid email address'
      } else {
        this.errors.email = ''
      }
    },

    validatePassword() {
      if (!this.form.password) {
        this.errors.password = 'Password is required'
      } else if (this.form.password.length < 6) {
        this.errors.password = 'Password must be at least 6 characters long'
      } else {
        this.errors.password = ''
      }
    },

    // 传统登录处理
    handleLogin() {
      this.validateEmail()
      this.validatePassword()

      if (!this.isFormValid) {
        return
      }

      this.loading = true

      try {
        const result = authStore.login(this.form.email, this.form.password)

        if (result.success) {
          this.loginError = ''

          // 触发用户登录事件
          window.dispatchEvent(
            new CustomEvent('user-login', {
              detail: result.user,
            }),
          )

          this.redirectToDashboard()
        } else {
          this.loginError = result.message
        }
      } catch (error) {
        console.error('❌ Login error:', error)
        this.loginError = 'Login failed. Please try again.'
      } finally {
        this.loading = false
      }
    },
  },
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.login-container {
  width: 100%;
  max-width: 400px;
}

.login-card {
  background: white;
  border-radius: 12px;
  padding: 40px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
}

.login-title {
  font-size: 28px;
  text-align: center;
  margin-bottom: 8px;
  color: #2c3e50;
}

.login-subtitle {
  text-align: center;
  color: #666;
  margin-bottom: 30px;
}

.external-auth {
  margin-bottom: 20px;
}

.btn-google {
  width: 100%;
  padding: 12px;
  border: 2px solid #4285f4;
  background: white;
  color: #4285f4;
  border-radius: 6px;
  font-size: 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  transition: all 0.3s ease;
}

.btn-google:hover {
  background: #4285f4;
  color: white;
}

.btn-google:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.google-icon {
  font-size: 18px;
}

.divider {
  text-align: center;
  margin: 20px 0;
  position: relative;
}

.divider::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 1px;
  background: #ddd;
}

.divider span {
  background: white;
  padding: 0 15px;
  color: #666;
  font-size: 14px;
}

.login-form {
  margin-bottom: 30px;
}

.form-group {
  margin-bottom: 20px;
}

.form-label {
  display: block;
  margin-bottom: 8px;
  font-weight: bold;
  font-size: 16px;
}

.form-input {
  width: 100%;
  padding: 12px;
  border: 2px solid #ddd;
  border-radius: 6px;
  font-size: 16px;
}

.form-input:focus {
  outline: none;
  border-color: #007bff;
}

.form-input.error {
  border-color: #dc3545;
}

.error-message {
  color: #dc3545;
  font-size: 14px;
  margin-top: 5px;
}

.btn {
  padding: 12px 24px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 16px;
  transition: all 0.3s ease;
}

.btn-primary {
  background-color: #007bff;
  color: white;
}

.btn-primary:hover {
  background-color: #0056b3;
}

.login-btn {
  width: 100%;
  font-size: 18px;
  padding: 14px;
  margin-top: 10px;
}

.login-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.login-footer {
  text-align: center;
  padding-top: 20px;
  border-top: 1px solid #eee;
}

.register-link {
  color: #3498db;
  text-decoration: none;
  font-weight: bold;
}

.register-link:hover {
  color: #2980b9;
}

.test-accounts {
  margin-top: 30px;
  padding: 20px;
  background-color: #f8f9fa;
  border-radius: 8px;
}

.test-accounts h3 {
  margin-bottom: 10px;
  color: #2c3e50;
  font-size: 16px;
}

.account-info p {
  margin: 5px 0;
  font-size: 14px;
  color: #666;
}

@media (max-width: 480px) {
  .login-card {
    padding: 30px 20px;
  }

  .login-title {
    font-size: 24px;
  }
}
</style>

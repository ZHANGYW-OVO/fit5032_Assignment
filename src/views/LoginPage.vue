<template>
  <div class="login-page">
    <div class="login-container">
      <div class="login-card">
        <h2 class="login-title">Welcome Back</h2>
        <p class="login-subtitle">Sign in to access your account</p>

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

          <button type="submit" class="btn btn-primary login-btn" :disabled="!isFormValid">
            Sign In
          </button>
        </form>

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
    }
  },
  computed: {
    isFormValid() {
      return this.form.email && this.form.password && !this.errors.email && !this.errors.password
    },
  },
  methods: {
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
    handleLogin() {
      this.validateEmail()
      this.validatePassword()

      if (!this.isFormValid) {
        return
      }

      // 使用 authStore 进行登录
      const result = authStore.login(this.form.email, this.form.password)

      if (result.success) {
        this.loginError = ''

        // 触发自定义事件通知其他组件
        window.dispatchEvent(
          new CustomEvent('user-login', {
            detail: result.user,
          }),
        )

        // 根据角色跳转
        if (result.user.role === 'admin') {
          this.$router.push('/admin')
        } else {
          this.$router.push('/dashboard')
        }
      } else {
        this.loginError = result.message
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

/* 响应式设计 */
@media (max-width: 480px) {
  .login-card {
    padding: 30px 20px;
  }

  .login-title {
    font-size: 24px;
  }
}
</style>

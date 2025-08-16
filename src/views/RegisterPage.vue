<template>
  <div class="register-page">
    <div class="register-container">
      <div class="register-card">
        <h2 class="register-title">Join Our Community</h2>
        <p class="register-subtitle">Create your account to get started</p>

        <form @submit.prevent="handleRegister" class="register-form">
          <div class="form-group">
            <label for="name" class="form-label">Full Name</label>
            <input
              type="text"
              id="name"
              v-model="form.name"
              class="form-input"
              :class="{ error: errors.name }"
              placeholder="Enter your full name"
              @blur="validateName"
            />
            <div v-if="errors.name" class="error-message">{{ errors.name }}</div>
          </div>

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

          <div class="form-group">
            <label for="confirmPassword" class="form-label">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              v-model="form.confirmPassword"
              class="form-input"
              :class="{ error: errors.confirmPassword }"
              placeholder="Confirm your password"
              @blur="validateConfirmPassword"
            />
            <div v-if="errors.confirmPassword" class="error-message">
              {{ errors.confirmPassword }}
            </div>
          </div>

          <div class="form-group">
            <label for="role" class="form-label">I am a:</label>
            <select
              id="role"
              v-model="form.role"
              class="form-input"
              :class="{ error: errors.role }"
              @change="validateRole"
            >
              <option value="">Select your role</option>
              <option value="user">Community Member</option>
              <option value="volunteer">Volunteer</option>
            </select>
            <div v-if="errors.role" class="error-message">{{ errors.role }}</div>
          </div>

          <div v-if="registerError" class="error-message">{{ registerError }}</div>
          <div v-if="successMessage" class="success-message">{{ successMessage }}</div>

          <button type="submit" class="btn btn-primary register-btn" :disabled="!isFormValid">
            Create Account
          </button>
        </form>

        <div class="register-footer">
          <p>
            Already have an account?
            <router-link to="/login" class="login-link">Sign in here</router-link>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { authStore } from '../stores/auth.js'

export default {
  name: 'RegisterPage',
  data() {
    return {
      form: {
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: '',
      },
      errors: {
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: '',
      },
      registerError: '',
      successMessage: '',
    }
  },
  computed: {
    isFormValid() {
      return (
        this.form.name &&
        this.form.email &&
        this.form.password &&
        this.form.confirmPassword &&
        this.form.role &&
        !this.errors.name &&
        !this.errors.email &&
        !this.errors.password &&
        !this.errors.confirmPassword &&
        !this.errors.role
      )
    },
  },
  methods: {
    validateName() {
      if (!this.form.name.trim()) {
        this.errors.name = 'Full name is required'
      } else if (this.form.name.trim().length < 2) {
        this.errors.name = 'Name must be at least 2 characters long'
      } else {
        this.errors.name = ''
      }
    },
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
    validateConfirmPassword() {
      if (!this.form.confirmPassword) {
        this.errors.confirmPassword = 'Please confirm your password'
      } else if (this.form.password !== this.form.confirmPassword) {
        this.errors.confirmPassword = 'Passwords do not match'
      } else {
        this.errors.confirmPassword = ''
      }
    },
    validateRole() {
      if (!this.form.role) {
        this.errors.role = 'Please select your role'
      } else {
        this.errors.role = ''
      }
    },
    handleRegister() {
      // 验证所有字段
      this.validateName()
      this.validateEmail()
      this.validatePassword()
      this.validateConfirmPassword()
      this.validateRole()

      if (!this.isFormValid) {
        return
      }

      // 验证用户数据
      const validation = authStore.validateUserData({
        name: this.form.name.trim(),
        email: this.form.email,
        password: this.form.password,
        role: this.form.role,
      })

      if (!validation.isValid) {
        // 显示验证错误
        this.errors = { ...this.errors, ...validation.errors }
        return
      }

      // 使用 authStore 进行注册
      const result = authStore.register({
        name: this.form.name.trim(),
        email: this.form.email,
        password: this.form.password,
        role: this.form.role,
      })

      if (result.success) {
        this.successMessage = 'Account created successfully! Redirecting to login...'
        this.registerError = ''

        // 2秒后跳转到登录页面
        setTimeout(() => {
          this.$router.push('/login')
        }, 2000)
      } else {
        this.registerError = result.message
        this.successMessage = ''
      }
    },
  },
}
</script>

<style scoped>
.register-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.register-container {
  width: 100%;
  max-width: 450px;
}

.register-card {
  background: white;
  border-radius: 12px;
  padding: 40px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
}

.register-title {
  font-size: 28px;
  text-align: center;
  margin-bottom: 8px;
  color: #2c3e50;
}

.register-subtitle {
  text-align: center;
  color: #666;
  margin-bottom: 30px;
}

.register-form {
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

.success-message {
  color: #28a745;
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

.register-btn {
  width: 100%;
  font-size: 18px;
  padding: 14px;
  margin-top: 10px;
}

.register-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.register-footer {
  text-align: center;
  padding-top: 20px;
  border-top: 1px solid #eee;
}

.login-link {
  color: #3498db;
  text-decoration: none;
  font-weight: bold;
}

.login-link:hover {
  color: #2980b9;
}

/* 响应式设计 */
@media (max-width: 480px) {
  .register-card {
    padding: 30px 20px;
  }

  .register-title {
    font-size: 24px;
  }
}
</style>

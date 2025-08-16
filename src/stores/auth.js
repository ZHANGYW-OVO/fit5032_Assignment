// 认证状态管理 - 内存版本 (适用于 Claude.ai artifacts)
export class AuthStore {
  constructor() {
    this.currentUser = null
    this.users = this.getDefaultUsers()
    this.lastActivity = Date.now()
  }

  // 获取默认用户数据
  getDefaultUsers() {
    return [
      {
        id: 1,
        email: 'admin@charity.com',
        password: 'admin123',
        role: 'admin',
        name: 'Admin User',
        createdAt: '2025-01-01',
      },
      {
        id: 2,
        email: 'volunteer@charity.com',
        password: 'volunteer123',
        role: 'volunteer',
        name: 'Volunteer User',
        createdAt: '2025-01-15',
      },
      {
        id: 3,
        email: 'user@charity.com',
        password: 'user123',
        role: 'user',
        name: 'Regular User',
        createdAt: '2025-02-01',
      },
    ]
  }

  // 用户登录
  login(email, password) {
    const user = this.users.find((u) => u.email === email && u.password === password)

    if (user) {
      // 不在存储中包含密码
      const userInfo = { ...user }
      delete userInfo.password

      this.currentUser = userInfo
      this.updateLastActivity()

      return {
        success: true,
        user: userInfo,
        message: 'Login successful',
      }
    } else {
      return {
        success: false,
        user: null,
        message: 'Invalid email or password',
      }
    }
  }

  // 用户注册
  register(userData) {
    // 检查邮箱是否已存在
    const existingUser = this.users.find((u) => u.email === userData.email)
    if (existingUser) {
      return {
        success: false,
        message: 'Email already registered',
      }
    }

    // 创建新用户
    const newUser = {
      id: Math.max(...this.users.map((u) => u.id), 0) + 1,
      name: userData.name,
      email: userData.email,
      password: userData.password,
      role: userData.role || 'user',
      createdAt: new Date().toISOString().split('T')[0],
    }

    this.users.push(newUser)

    return {
      success: true,
      message: 'Registration successful',
    }
  }

  // 用户登出
  logout() {
    this.currentUser = null
  }

  // 检查用户是否已登录
  isLoggedIn() {
    return this.currentUser !== null
  }

  // 检查用户是否有特定角色
  hasRole(role) {
    return this.currentUser && this.currentUser.role === role
  }

  // 检查用户是否有管理员权限
  isAdmin() {
    return this.hasRole('admin')
  }

  // 检查用户是否是志愿者
  isVolunteer() {
    return this.hasRole('volunteer')
  }

  // 获取当前用户信息
  getCurrentUser() {
    return this.currentUser
  }

  // 更新用户信息
  updateUserProfile(updates) {
    if (!this.currentUser) {
      return {
        success: false,
        message: 'No user logged in',
      }
    }

    // 更新当前用户信息
    this.currentUser = { ...this.currentUser, ...updates }

    // 更新用户列表中的用户信息
    const userIndex = this.users.findIndex((u) => u.id === this.currentUser.id)
    if (userIndex !== -1) {
      this.users[userIndex] = { ...this.users[userIndex], ...updates }
    }

    return {
      success: true,
      message: 'Profile updated successfully',
    }
  }

  // 管理员功能：获取所有用户
  getAllUsers() {
    if (!this.isAdmin()) {
      return {
        success: false,
        message: 'Access denied',
      }
    }

    return {
      success: true,
      users: this.users.map((user) => {
        const userInfo = { ...user }
        delete userInfo.password
        return userInfo
      }),
    }
  }

  // 管理员功能：添加用户
  addUser(userData) {
    if (!this.isAdmin()) {
      return {
        success: false,
        message: 'Access denied',
      }
    }

    return this.register(userData)
  }

  // 管理员功能：删除用户
  deleteUser(userId) {
    if (!this.isAdmin()) {
      return {
        success: false,
        message: 'Access denied',
      }
    }

    if (userId === this.currentUser.id) {
      return {
        success: false,
        message: 'Cannot delete your own account',
      }
    }

    const userIndex = this.users.findIndex((u) => u.id === userId)
    if (userIndex === -1) {
      return {
        success: false,
        message: 'User not found',
      }
    }

    this.users.splice(userIndex, 1)

    return {
      success: true,
      message: 'User deleted successfully',
    }
  }

  // 管理员功能：更新用户角色
  updateUserRole(userId, newRole) {
    if (!this.isAdmin()) {
      return {
        success: false,
        message: 'Access denied',
      }
    }

    const userIndex = this.users.findIndex((u) => u.id === userId)
    if (userIndex === -1) {
      return {
        success: false,
        message: 'User not found',
      }
    }

    this.users[userIndex].role = newRole

    // 如果更新的是当前用户，也要更新当前用户信息
    if (userId === this.currentUser.id) {
      this.currentUser.role = newRole
    }

    return {
      success: true,
      message: 'User role updated successfully',
    }
  }

  // 验证用户输入
  validateUserData(userData) {
    const errors = {}

    // 验证姓名
    if (!userData.name || userData.name.trim().length < 2) {
      errors.name = 'Name must be at least 2 characters long'
    }

    // 验证邮箱
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!userData.email || !emailRegex.test(userData.email)) {
      errors.email = 'Please enter a valid email address'
    }

    // 检查邮箱是否已存在
    const existingUser = this.users.find((u) => u.email === userData.email)
    if (existingUser) {
      errors.email = 'This email is already registered'
    }

    // 验证密码
    if (!userData.password || userData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters long'
    }

    // 验证角色
    const validRoles = ['user', 'volunteer', 'admin']
    if (userData.role && !validRoles.includes(userData.role)) {
      errors.role = 'Invalid role specified'
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    }
  }

  // 更新最后活动时间
  updateLastActivity() {
    this.lastActivity = Date.now()
  }

  // 清理过期的会话
  cleanupExpiredSessions() {
    const timeDiff = Date.now() - this.lastActivity
    const maxInactivity = 24 * 60 * 60 * 1000 // 24小时

    if (timeDiff > maxInactivity) {
      this.logout()
      return true
    }
    return false
  }
}

// 创建全局认证存储实例
export const authStore = new AuthStore()

// 定期清理过期会话（在实际环境中使用）
if (typeof setInterval !== 'undefined') {
  setInterval(
    () => {
      authStore.cleanupExpiredSessions()
    },
    60 * 60 * 1000,
  ) // 每小时检查一次
}

// 监听用户活动来更新最后活动时间（在实际环境中使用）
if (typeof window !== 'undefined') {
  ;['click', 'keypress', 'scroll', 'mousemove'].forEach((event) => {
    window.addEventListener(
      event,
      () => {
        authStore.updateLastActivity()
      },
      { passive: true },
    )
  })
}

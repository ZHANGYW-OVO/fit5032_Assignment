// 认证状态管理 - 修复版本
export class AuthStore {
  constructor() {
    this.currentUser = null
    this.users = this.getDefaultUsers()
    this.lastActivity = Date.now()
    // 🔥 新增：Firebase认证状态标志
    this.firebaseReady = false
    this.firebaseInitPromise = null
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

  // 🔥 修复：处理 Firebase 用户登录 - 正确的属性访问
  addFirebaseUser(firebaseUser) {
    try {
      console.log('🔥 Processing Firebase user:', firebaseUser)

      // 🔥 修复：正确访问Firebase用户属性
      const appUser = {
        id: firebaseUser.uid, // 使用 uid 而不是 id
        name: firebaseUser.displayName || 'Google User', // 使用 displayName 而不是 name
        email: firebaseUser.email,
        photo: firebaseUser.photoURL, // 使用 photoURL 而不是 photo
        role: 'user', // 默认角色
        provider: 'google',
        firebaseUid: firebaseUser.uid,
        createdAt: new Date().toISOString().split('T')[0],
        lastLogin: new Date().toISOString(),
      }

      console.log('🔥 Converted app user:', appUser)

      // 检查是否已经存在此用户
      let existingUser = this.users.find((u) => u.email === appUser.email)

      if (existingUser) {
        // 更新现有用户信息
        existingUser.name = appUser.name
        existingUser.photo = appUser.photo
        existingUser.firebaseUid = appUser.firebaseUid
        existingUser.provider = 'google'
        existingUser.lastLogin = appUser.lastLogin

        this.currentUser = existingUser
        console.log('✅ Updated existing user:', existingUser)
      } else {
        // 创建新用户
        appUser.id = Math.max(...this.users.map((u) => u.id), 0) + 1
        this.users.push(appUser)
        this.currentUser = appUser
        console.log('✅ Created new user:', appUser)
      }

      this.updateLastActivity()

      return {
        success: true,
        user: this.currentUser,
        message: 'Google login successful',
      }
    } catch (error) {
      console.error('❌ Error adding Firebase user:', error)
      return {
        success: false,
        message: 'Failed to process Google login: ' + error.message,
      }
    }
  }

  // 🔥 新增：等待Firebase初始化完成
  async waitForFirebaseReady() {
    if (this.firebaseReady) {
      return true
    }

    if (this.firebaseInitPromise) {
      return await this.firebaseInitPromise
    }

    this.firebaseInitPromise = new Promise((resolve) => {
      const checkReady = () => {
        if (this.firebaseReady) {
          resolve(true)
        } else {
          setTimeout(checkReady, 100)
        }
      }
      checkReady()
    })

    return await this.firebaseInitPromise
  }

  // 🔥 新增：设置Firebase就绪状态
  setFirebaseReady(ready = true) {
    this.firebaseReady = ready
    console.log('🔥 Firebase ready state set to:', ready)
  }

  // Firebase 用户登出
  signOutFirebaseUser() {
    if (this.currentUser && this.currentUser.provider === 'google') {
      this.logout()
      return { success: true, message: 'Google user signed out' }
    }
    return { success: false, message: 'No Google user to sign out' }
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
    console.log('✅ User logged out from authStore')
  }

  // 检查用户是否已登录
  isLoggedIn() {
    const result = this.currentUser !== null
    console.log('🔍 Auth check - isLoggedIn:', result, 'currentUser:', this.currentUser)
    return result
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

  // 获取用户头像URL
  getUserAvatar() {
    if (this.currentUser && this.currentUser.photo) {
      return this.currentUser.photo
    }
    return null
  }

  // 检查用户是否通过Google登录
  isGoogleUser() {
    return this.currentUser && this.currentUser.provider === 'google'
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

  // 调试方法 - 获取当前状态
  getDebugInfo() {
    return {
      currentUser: this.currentUser,
      isLoggedIn: this.isLoggedIn(),
      userCount: this.users.length,
      lastActivity: new Date(this.lastActivity).toISOString(),
      firebaseReady: this.firebaseReady,
    }
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

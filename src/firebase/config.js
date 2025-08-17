import { initializeApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth'
import { getFunctions, httpsCallable } from 'firebase/functions'
import { getFirestore } from 'firebase/firestore'

// Firebase 配置
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

// 初始化 Firebase
const app = initializeApp(firebaseConfig)

// 导出服务
export const auth = getAuth(app)
export const db = getFirestore(app)
export const functions = getFunctions(app)

// 配置 Google Provider
export const googleProvider = new GoogleAuthProvider()
googleProvider.addScope('email')
googleProvider.addScope('profile')

// 🔥 简化的Google登录函数 - 只使用弹窗方式
export const signInWithGoogle = async () => {
  try {
    console.log('🚀 Starting Google popup login...')

    const result = await signInWithPopup(auth, googleProvider)

    if (result && result.user) {
      console.log('✅ Google popup login successful:', {
        uid: result.user.uid,
        email: result.user.email,
        displayName: result.user.displayName,
        photoURL: result.user.photoURL,
      })

      return {
        success: true,
        user: {
          uid: result.user.uid,
          displayName: result.user.displayName,
          email: result.user.email,
          photoURL: result.user.photoURL,
          role: 'user', // 默认角色
        },
      }
    }

    return { success: false, message: 'No user data received' }
  } catch (error) {
    console.error('❌ Google popup login error:', error)

    // 详细错误处理
    let userMessage = 'Google login failed'

    switch (error.code) {
      case 'auth/popup-blocked':
        userMessage = 'Popup was blocked by browser. Please allow popups for this site.'
        break
      case 'auth/popup-closed-by-user':
        userMessage = 'Login was cancelled'
        break
      case 'auth/unauthorized-domain':
        userMessage = 'This domain is not authorized for Google login'
        break
      case 'auth/operation-not-allowed':
        userMessage = 'Google login is not enabled for this project'
        break
      case 'auth/invalid-api-key':
        userMessage = 'Invalid Firebase configuration'
        break
      case 'auth/network-request-failed':
        userMessage = 'Network error. Please check your connection.'
        break
      default:
        userMessage = error.message || 'Unknown error occurred'
    }

    return {
      success: false,
      message: userMessage,
      code: error.code,
    }
  }
}

// 🔥 移除重定向相关的函数 - 不再需要
// export const checkRedirectResult = async () => { ... } // 删除这个函数

// 用户登出
export const signOutUser = async () => {
  try {
    await signOut(auth)
    console.log('✅ User signed out successfully')
    return { success: true }
  } catch (error) {
    console.error('❌ Sign out error:', error)
    return { success: false, message: error.message }
  }
}

// 云函数示例
export const processHealthData = httpsCallable(functions, 'processHealthData')
export const sendHealthReport = httpsCallable(functions, 'sendHealthReport')

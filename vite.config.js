import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  server: {
    port: 5173,
    host: '0.0.0.0', // 或者使用 true
    strictPort: false, // 如果端口被占用，自动尝试下一个
    // 修复 Firebase Auth COOP 问题
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin-allow-popups',
      'Cross-Origin-Embedder-Policy': 'unsafe-none',
    },
    // 修复 WebSocket 连接问题
    hmr: {
      port: 5173,
      host: 'localhost',
      clientPort: 5173,
    },
    // 处理代理和 CORS
    cors: true,
    // 监听文件变化
    watch: {
      usePolling: true, // 在某些系统上需要轮询
      interval: 1000,
    },
  },
  preview: {
    port: 4173,
    host: '0.0.0.0',
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin-allow-popups',
      'Cross-Origin-Embedder-Policy': 'unsafe-none',
    },
  },
  define: {
    global: 'globalThis',
  },
  resolve: {
    alias: {
      '@': '/src',
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['vue', 'vue-router'],
          firebase: ['firebase/app', 'firebase/auth', 'firebase/functions'],
          charts: ['chart.js', 'vue-chartjs'],
        },
      },
    },
  },
  // 优化依赖
  optimizeDeps: {
    include: ['vue', 'vue-router', 'firebase/app', 'firebase/auth'],
  },
})

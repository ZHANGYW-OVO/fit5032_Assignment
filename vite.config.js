import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],

  // 重要：base 路径设置（在根级别）
  base: '/fit5032_Assignment/',

  server: {
    port: 5173,
    host: '0.0.0.0',
    strictPort: false,
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin-allow-popups',
      'Cross-Origin-Embedder-Policy': 'unsafe-none',
    },
    hmr: {
      port: 5173,
      host: 'localhost',
      clientPort: 5173,
    },
    cors: true,
    watch: {
      usePolling: true,
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

  // 修正后的 build 配置
  build: {
    outDir: 'dist', // 输出目录
    assetsDir: 'assets', // 资源目录
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

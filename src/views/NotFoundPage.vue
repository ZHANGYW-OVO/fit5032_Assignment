<template>
  <div class="not-found-page" id="main-content">
    <div class="error-container">
      <div class="error-graphic">
        <div class="error-number">404</div>
        <div class="error-icon">🔍</div>
      </div>

      <div class="error-content">
        <h1 tabindex="-1">Page Not Found</h1>
        <p class="error-message">
          We're sorry, but the page you're looking for doesn't exist. It might have been moved,
          deleted, or you might have typed the wrong address.
        </p>

        <div class="suggestions">
          <h2>What can you do?</h2>
          <ul class="suggestion-list">
            <li>
              <span class="suggestion-icon">🏠</span>
              <router-link to="/" class="suggestion-link"> Go back to the homepage </router-link>
            </li>
            <li>
              <span class="suggestion-icon">📋</span>
              <router-link to="/dashboard" class="suggestion-link">
                Visit your dashboard
              </router-link>
            </li>
            <li>
              <span class="suggestion-icon">📚</span>
              <router-link to="/health-resources" class="suggestion-link">
                Browse health resources
              </router-link>
            </li>
            <li>
              <span class="suggestion-icon">🎯</span>
              <router-link to="/community" class="suggestion-link">
                Check community events
              </router-link>
            </li>
          </ul>
        </div>

        <div class="search-section">
          <h3>Search for what you need:</h3>
          <div class="search-box">
            <input
              type="text"
              v-model="searchQuery"
              placeholder="Search health resources, events, or pages..."
              class="search-input"
              @keyup.enter="performSearch"
            />
            <button @click="performSearch" class="search-btn">🔍 Search</button>
          </div>
        </div>

        <div class="popular-pages">
          <h3>Popular Pages:</h3>
          <div class="page-links">
            <router-link to="/health-resources" class="page-link">
              📚 Health Resources
            </router-link>
            <router-link to="/community" class="page-link"> 🎯 Community Events </router-link>
            <router-link to="/support" class="page-link"> 🆘 Get Support </router-link>
            <router-link to="/comprehensive-dashboard" class="page-link">
              📊 Health Dashboard
            </router-link>
          </div>
        </div>

        <div class="help-section">
          <p>
            Still need help?
            <router-link to="/support" class="help-link">Contact our support team</router-link>
            or call us at
            <a href="tel:+1-555-123-4567" class="phone-link">+1 (555) 123-4567</a>
          </p>
        </div>
      </div>
    </div>

    <!-- 无障碍功能：屏幕阅读器公告 -->
    <div aria-live="polite" aria-atomic="true" class="sr-only" ref="announcement">
      Page not found. You are now on the 404 error page with navigation options.
    </div>
  </div>
</template>

<script>
export default {
  name: 'NotFoundPage',

  data() {
    return {
      searchQuery: '',
    }
  },

  mounted() {
    // 设置页面标题
    document.title = '404 - Page Not Found | Elderly Health Charity'

    // 记录404错误（用于分析）
    this.logPageNotFound()
  },

  methods: {
    performSearch() {
      if (!this.searchQuery.trim()) return

      // 在实际项目中，这里会跳转到搜索结果页面
      // 或者触发全局搜索功能
      this.$router.push({
        path: '/health-resources',
        query: { search: this.searchQuery },
      })
    },

    logPageNotFound() {
      // 记录404错误用于分析和改进
      const errorData = {
        url: window.location.href,
        referrer: document.referrer,
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString(),
      }

      // 在实际项目中，这里会发送到分析服务
      console.log('404 Error logged:', errorData)

      // 如果有Google Analytics
      if (window.gtag) {
        window.gtag('event', 'page_not_found', {
          page_location: window.location.href,
          page_referrer: document.referrer,
        })
      }
    },
  },
}
</script>

<style scoped>
.not-found-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.error-container {
  max-width: 800px;
  width: 100%;
  background: white;
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
  overflow: hidden;
  animation: fadeInUp 0.6s ease-out;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.error-graphic {
  background: linear-gradient(45deg, #ff6b6b, #ee5a24);
  color: white;
  text-align: center;
  padding: 40px 20px;
  position: relative;
  overflow: hidden;
}

.error-graphic::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: repeating-linear-gradient(
    45deg,
    transparent,
    transparent 10px,
    rgba(255, 255, 255, 0.1) 10px,
    rgba(255, 255, 255, 0.1) 20px
  );
  animation: shimmer 3s linear infinite;
}

@keyframes shimmer {
  0% {
    transform: translateX(-100%) translateY(-100%) rotate(45deg);
  }
  100% {
    transform: translateX(100%) translateY(100%) rotate(45deg);
  }
}

.error-number {
  font-size: 120px;
  font-weight: 900;
  line-height: 1;
  margin-bottom: 10px;
  text-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
  position: relative;
  z-index: 1;
}

.error-icon {
  font-size: 48px;
  position: relative;
  z-index: 1;
}

.error-content {
  padding: 40px;
}

.error-content h1 {
  color: #2c3e50;
  font-size: 32px;
  margin-bottom: 16px;
  text-align: center;
}

.error-message {
  color: #666;
  font-size: 18px;
  line-height: 1.6;
  text-align: center;
  margin-bottom: 40px;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
}

.suggestions {
  margin-bottom: 40px;
}

.suggestions h2 {
  color: #2c3e50;
  font-size: 24px;
  margin-bottom: 20px;
  text-align: center;
}

.suggestion-list {
  list-style: none;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 16px;
}

.suggestion-list li {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.suggestion-list li:hover {
  background: #e9ecef;
  transform: translateY(-2px);
}

.suggestion-icon {
  font-size: 24px;
  flex-shrink: 0;
}

.suggestion-link {
  color: #007bff;
  text-decoration: none;
  font-weight: 500;
  font-size: 16px;
}

.suggestion-link:hover {
  color: #0056b3;
  text-decoration: underline;
}

.search-section {
  margin-bottom: 40px;
  text-align: center;
}

.search-section h3 {
  color: #2c3e50;
  margin-bottom: 16px;
}

.search-box {
  display: flex;
  max-width: 500px;
  margin: 0 auto;
  gap: 10px;
}

.search-input {
  flex: 1;
  padding: 12px 16px;
  border: 2px solid #ddd;
  border-radius: 8px;
  font-size: 16px;
  transition: border-color 0.3s ease;
}

.search-input:focus {
  outline: none;
  border-color: #007bff;
}

.search-btn {
  padding: 12px 24px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.search-btn:hover {
  background: #0056b3;
  transform: translateY(-1px);
}

.popular-pages {
  margin-bottom: 40px;
  text-align: center;
}

.popular-pages h3 {
  color: #2c3e50;
  margin-bottom: 16px;
}

.page-links {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  justify-content: center;
}

.page-link {
  padding: 8px 16px;
  background: #e7f3ff;
  color: #007bff;
  text-decoration: none;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.3s ease;
}

.page-link:hover {
  background: #007bff;
  color: white;
  transform: translateY(-2px);
}

.help-section {
  text-align: center;
  padding-top: 30px;
  border-top: 1px solid #dee2e6;
  color: #666;
}

.help-link,
.phone-link {
  color: #007bff;
  text-decoration: none;
  font-weight: 500;
}

.help-link:hover,
.phone-link:hover {
  color: #0056b3;
  text-decoration: underline;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .error-number {
    font-size: 80px;
  }

  .error-content {
    padding: 30px 20px;
  }

  .error-content h1 {
    font-size: 24px;
  }

  .error-message {
    font-size: 16px;
  }

  .suggestion-list {
    grid-template-columns: 1fr;
  }

  .search-box {
    flex-direction: column;
  }

  .page-links {
    flex-direction: column;
    align-items: center;
  }
}

@media (max-width: 480px) {
  .error-graphic {
    padding: 30px 15px;
  }

  .error-number {
    font-size: 60px;
  }

  .error-icon {
    font-size: 32px;
  }

  .error-content h1 {
    font-size: 20px;
  }

  .suggestions h2,
  .search-section h3,
  .popular-pages h3 {
    font-size: 18px;
  }
}

/* 高对比度模式支持 */
@media (prefers-contrast: high) {
  .error-graphic {
    background: #000;
  }

  .suggestion-list li {
    border: 2px solid #000;
  }

  .search-input {
    border: 2px solid #000;
  }
}

/* 减少动画（用户偏好） */
@media (prefers-reduced-motion: reduce) {
  .error-container {
    animation: none;
  }

  .error-graphic::before {
    animation: none;
  }

  .suggestion-list li:hover,
  .search-btn:hover,
  .page-link:hover {
    transform: none;
  }
}
</style>

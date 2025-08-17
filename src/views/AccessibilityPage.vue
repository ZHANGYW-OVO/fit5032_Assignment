<template>
  <div class="accessibility-page" id="main-content">
    <!-- 页面头部 -->
    <div class="page-header">
      <h1 tabindex="-1">♿ Accessibility Settings</h1>
      <p class="page-description">
        Customize your experience to make the website more accessible and easier to use. These
        settings will be saved and applied across all pages.
      </p>
    </div>

    <!-- 设置面板 -->
    <div class="settings-container">
      <!-- 视觉设置 -->
      <section class="settings-section" aria-labelledby="visual-settings">
        <h2 id="visual-settings">👁️ Visual Settings</h2>

        <div class="setting-group">
          <div class="setting-item">
            <div class="setting-info">
              <h3>High Contrast Mode</h3>
              <p>Increases color contrast for better visibility</p>
            </div>
            <button
              @click="toggleHighContrast"
              :class="`toggle-btn ${highContrastMode ? 'active' : ''}`"
              :aria-pressed="highContrastMode"
              aria-describedby="high-contrast-desc"
            >
              <span class="toggle-slider"></span>
              <span class="sr-only"
                >{{ highContrastMode ? 'Disable' : 'Enable' }} high contrast mode</span
              >
            </button>
          </div>
          <div id="high-contrast-desc" class="setting-description">
            High contrast mode makes text and buttons stand out more clearly against backgrounds.
          </div>
        </div>

        <div class="setting-group">
          <div class="setting-item">
            <div class="setting-info">
              <h3>Large Text Mode</h3>
              <p>Increases font size throughout the website</p>
            </div>
            <button
              @click="toggleLargeText"
              :class="`toggle-btn ${largeTextMode ? 'active' : ''}`"
              :aria-pressed="largeTextMode"
              aria-describedby="large-text-desc"
            >
              <span class="toggle-slider"></span>
              <span class="sr-only"
                >{{ largeTextMode ? 'Disable' : 'Enable' }} large text mode</span
              >
            </button>
          </div>
          <div id="large-text-desc" class="setting-description">
            Large text mode increases font sizes by 20% for better readability.
          </div>
        </div>

        <div class="setting-group">
          <div class="setting-item">
            <div class="setting-info">
              <h3>Reduce Motion</h3>
              <p>Minimizes animations and transitions</p>
            </div>
            <button
              @click="toggleReduceMotion"
              :class="`toggle-btn ${reduceMotion ? 'active' : ''}`"
              :aria-pressed="reduceMotion"
              aria-describedby="reduce-motion-desc"
            >
              <span class="toggle-slider"></span>
              <span class="sr-only">{{ reduceMotion ? 'Disable' : 'Enable' }} reduced motion</span>
            </button>
          </div>
          <div id="reduce-motion-desc" class="setting-description">
            Reduces or eliminates animations that might cause discomfort or distraction.
          </div>
        </div>

        <div class="setting-group">
          <div class="setting-item">
            <div class="setting-info">
              <h3>Focus Indicators</h3>
              <p>Enhanced visual focus indicators for keyboard navigation</p>
            </div>
            <button
              @click="toggleFocusIndicators"
              :class="`toggle-btn ${enhancedFocus ? 'active' : ''}`"
              :aria-pressed="enhancedFocus"
              aria-describedby="focus-desc"
            >
              <span class="toggle-slider"></span>
              <span class="sr-only"
                >{{ enhancedFocus ? 'Disable' : 'Enable' }} enhanced focus indicators</span
              >
            </button>
          </div>
          <div id="focus-desc" class="setting-description">
            Makes keyboard focus indicators more visible and prominent.
          </div>
        </div>
      </section>

      <!-- 导航设置 -->
      <section class="settings-section" aria-labelledby="navigation-settings">
        <h2 id="navigation-settings">🧭 Navigation Settings</h2>

        <div class="setting-group">
          <div class="setting-item">
            <div class="setting-info">
              <h3>Keyboard Navigation</h3>
              <p>Enable enhanced keyboard navigation features</p>
            </div>
            <button
              @click="toggleKeyboardNav"
              :class="`toggle-btn ${keyboardNavigation ? 'active' : ''}`"
              :aria-pressed="keyboardNavigation"
              aria-describedby="keyboard-nav-desc"
            >
              <span class="toggle-slider"></span>
              <span class="sr-only"
                >{{ keyboardNavigation ? 'Disable' : 'Enable' }} keyboard navigation</span
              >
            </button>
          </div>
          <div id="keyboard-nav-desc" class="setting-description">
            Enables keyboard shortcuts and enhanced tab navigation throughout the site.
          </div>
        </div>

        <div class="setting-group">
          <div class="setting-item">
            <div class="setting-info">
              <h3>Skip Links</h3>
              <p>Show skip links for faster navigation</p>
            </div>
            <button
              @click="toggleSkipLinks"
              :class="`toggle-btn ${skipLinks ? 'active' : ''}`"
              :aria-pressed="skipLinks"
              aria-describedby="skip-links-desc"
            >
              <span class="toggle-slider"></span>
              <span class="sr-only">{{ skipLinks ? 'Hide' : 'Show' }} skip links</span>
            </button>
          </div>
          <div id="skip-links-desc" class="setting-description">
            Displays "Skip to main content" and other navigation shortcuts at the top of pages.
          </div>
        </div>

        <div class="setting-group">
          <div class="setting-item">
            <div class="setting-info">
              <h3>Page Announcements</h3>
              <p>Announce page changes to screen readers</p>
            </div>
            <button
              @click="togglePageAnnouncements"
              :class="`toggle-btn ${pageAnnouncements ? 'active' : ''}`"
              :aria-pressed="pageAnnouncements"
              aria-describedby="announcements-desc"
            >
              <span class="toggle-slider"></span>
              <span class="sr-only"
                >{{ pageAnnouncements ? 'Disable' : 'Enable' }} page announcements</span
              >
            </button>
          </div>
          <div id="announcements-desc" class="setting-description">
            Automatically announces page titles and important changes to screen readers.
          </div>
        </div>
      </section>

      <!-- 辅助技术设置 -->
      <section class="settings-section" aria-labelledby="assistive-settings">
        <h2 id="assistive-settings">🔊 Assistive Technology</h2>

        <div class="setting-group">
          <div class="setting-item">
            <div class="setting-info">
              <h3>Screen Reader Optimization</h3>
              <p>Optimize content for screen readers</p>
            </div>
            <button
              @click="toggleScreenReaderMode"
              :class="`toggle-btn ${screenReaderMode ? 'active' : ''}`"
              :aria-pressed="screenReaderMode"
              aria-describedby="screen-reader-desc"
            >
              <span class="toggle-slider"></span>
              <span class="sr-only"
                >{{ screenReaderMode ? 'Disable' : 'Enable' }} screen reader optimization</span
              >
            </button>
          </div>
          <div id="screen-reader-desc" class="setting-description">
            Adds extra descriptions and context for screen reader users.
          </div>
        </div>

        <div class="setting-group">
          <div class="setting-item">
            <div class="setting-info">
              <h3>Sound Notifications</h3>
              <p>Enable audio feedback for actions</p>
            </div>
            <button
              @click="toggleSoundNotifications"
              :class="`toggle-btn ${soundNotifications ? 'active' : ''}`"
              :aria-pressed="soundNotifications"
              aria-describedby="sound-desc"
            >
              <span class="toggle-slider"></span>
              <span class="sr-only"
                >{{ soundNotifications ? 'Disable' : 'Enable' }} sound notifications</span
              >
            </button>
          </div>
          <div id="sound-desc" class="setting-description">
            Plays subtle audio cues for button clicks and important notifications.
          </div>
        </div>
      </section>

      <!-- 个人偏好设置 -->
      <section class="settings-section" aria-labelledby="preference-settings">
        <h2 id="preference-settings">⚙️ Personal Preferences</h2>

        <div class="setting-group">
          <div class="setting-item full-width">
            <div class="setting-info">
              <h3>Reading Speed</h3>
              <p>Adjust automatic scrolling and timing for better reading experience</p>
            </div>
            <div class="slider-container">
              <label for="reading-speed" class="slider-label">Reading Speed</label>
              <input
                type="range"
                id="reading-speed"
                v-model="readingSpeed"
                min="1"
                max="5"
                step="1"
                class="setting-slider"
                :aria-describedby="'reading-speed-value'"
              />
              <div class="slider-labels">
                <span>Slow</span>
                <span id="reading-speed-value" class="current-value">{{ readingSpeedLabel }}</span>
                <span>Fast</span>
              </div>
            </div>
          </div>
        </div>

        <div class="setting-group">
          <div class="setting-item full-width">
            <div class="setting-info">
              <h3>Interface Complexity</h3>
              <p>Choose between simplified or full interface</p>
            </div>
            <div class="radio-group" role="radiogroup" aria-labelledby="interface-complexity">
              <label class="radio-label">
                <input
                  type="radio"
                  name="interface"
                  value="simple"
                  v-model="interfaceMode"
                  @change="updateInterfaceMode"
                />
                <span class="radio-custom"></span>
                <span class="radio-text"> <strong>Simple</strong> - Essential features only </span>
              </label>
              <label class="radio-label">
                <input
                  type="radio"
                  name="interface"
                  value="standard"
                  v-model="interfaceMode"
                  @change="updateInterfaceMode"
                />
                <span class="radio-custom"></span>
                <span class="radio-text"> <strong>Standard</strong> - All features available </span>
              </label>
            </div>
          </div>
        </div>
      </section>

      <!-- 快捷键信息 -->
      <section class="settings-section" aria-labelledby="shortcuts-info">
        <h2 id="shortcuts-info">⌨️ Keyboard Shortcuts</h2>

        <div class="shortcuts-grid">
          <div class="shortcut-item">
            <kbd>Tab</kbd>
            <span>Navigate forward</span>
          </div>
          <div class="shortcut-item">
            <kbd>Shift + Tab</kbd>
            <span>Navigate backward</span>
          </div>
          <div class="shortcut-item">
            <kbd>Enter</kbd>
            <span>Activate buttons/links</span>
          </div>
          <div class="shortcut-item">
            <kbd>Space</kbd>
            <span>Toggle checkboxes</span>
          </div>
          <div class="shortcut-item">
            <kbd>Escape</kbd>
            <span>Close dialogs</span>
          </div>
          <div class="shortcut-item">
            <kbd>Alt + 1-9</kbd>
            <span>Quick navigation</span>
          </div>
          <div class="shortcut-item">
            <kbd>Ctrl + /</kbd>
            <span>Show all shortcuts</span>
          </div>
          <div class="shortcut-item">
            <kbd>Alt + H</kbd>
            <span>Toggle high contrast</span>
          </div>
        </div>
      </section>

      <!-- 操作按钮 -->
      <section class="settings-actions">
        <div class="action-buttons">
          <button @click="saveSettings" class="btn btn-primary">💾 Save Settings</button>
          <button @click="resetSettings" class="btn btn-secondary">🔄 Reset to Defaults</button>
          <button @click="testSettings" class="btn btn-outline">🧪 Test Settings</button>
        </div>

        <div class="settings-status" v-if="statusMessage">
          <div :class="`status-message ${statusType}`" role="alert" aria-live="polite">
            {{ statusMessage }}
          </div>
        </div>
      </section>
    </div>

    <!-- 实时预览 -->
    <div class="preview-section">
      <h2>👀 Preview</h2>
      <div class="preview-content">
        <p>This is a sample text to preview your accessibility settings.</p>
        <button class="btn btn-primary">Sample Button</button>
        <a href="#" class="sample-link">Sample Link</a>
      </div>
    </div>
  </div>
</template>

<script>
import { accessibilityMixin } from '../mixins/accessibility.js'

export default {
  name: 'AccessibilityPage',
  mixins: [accessibilityMixin],

  data() {
    return {
      // 继承的无障碍设置
      readingSpeed: 3,
      interfaceMode: 'standard',
      skipLinks: true,
      pageAnnouncements: true,
      soundNotifications: false,
      reduceMotion: false,
      enhancedFocus: true,

      // 状态管理
      statusMessage: '',
      statusType: 'success', // success, error, info
      isLoading: false,
    }
  },

  computed: {
    readingSpeedLabel() {
      const labels = {
        1: 'Very Slow',
        2: 'Slow',
        3: 'Normal',
        4: 'Fast',
        5: 'Very Fast',
      }
      return labels[this.readingSpeed] || 'Normal'
    },
  },

  mounted() {
    this.loadSettings()
    this.announcePageLoad()
  },

  methods: {
    // 切换减少动画
    toggleReduceMotion() {
      this.reduceMotion = !this.reduceMotion
      document.body.classList.toggle('reduce-motion', this.reduceMotion)
      this.announceMessage(`Reduced motion ${this.reduceMotion ? 'enabled' : 'disabled'}`)
    },

    // 切换增强焦点指示器
    toggleFocusIndicators() {
      this.enhancedFocus = !this.enhancedFocus
      document.body.classList.toggle('enhanced-focus', this.enhancedFocus)
      this.announceMessage(
        `Enhanced focus indicators ${this.enhancedFocus ? 'enabled' : 'disabled'}`,
      )
    },

    // 切换键盘导航
    toggleKeyboardNav() {
      this.keyboardNavigation = !this.keyboardNavigation
      this.announceMessage(
        `Keyboard navigation ${this.keyboardNavigation ? 'enabled' : 'disabled'}`,
      )
    },

    // 切换跳转链接
    toggleSkipLinks() {
      this.skipLinks = !this.skipLinks
      const skipLinksElement = document.querySelector('.skip-links')
      if (skipLinksElement) {
        skipLinksElement.style.display = this.skipLinks ? 'block' : 'none'
      }
      this.announceMessage(`Skip links ${this.skipLinks ? 'shown' : 'hidden'}`)
    },

    // 切换页面播报
    togglePageAnnouncements() {
      this.pageAnnouncements = !this.pageAnnouncements
      this.announceMessage(`Page announcements ${this.pageAnnouncements ? 'enabled' : 'disabled'}`)
    },

    // 切换屏幕阅读器模式
    toggleScreenReaderMode() {
      this.screenReaderMode = !this.screenReaderMode
      document.body.classList.toggle('screen-reader-mode', this.screenReaderMode)
      this.announceMessage(
        `Screen reader optimization ${this.screenReaderMode ? 'enabled' : 'disabled'}`,
      )
    },

    // 切换声音通知
    toggleSoundNotifications() {
      this.soundNotifications = !this.soundNotifications
      this.announceMessage(
        `Sound notifications ${this.soundNotifications ? 'enabled' : 'disabled'}`,
      )
    },

    // 更新界面模式
    updateInterfaceMode() {
      document.body.classList.toggle('simple-interface', this.interfaceMode === 'simple')
      this.announceMessage(`Interface mode changed to ${this.interfaceMode}`)
    },

    // 保存设置
    saveSettings() {
      this.isLoading = true

      const settings = {
        highContrastMode: this.highContrastMode,
        largeTextMode: this.largeTextMode,
        keyboardNavigation: this.keyboardNavigation,
        reduceMotion: this.reduceMotion,
        enhancedFocus: this.enhancedFocus,
        skipLinks: this.skipLinks,
        pageAnnouncements: this.pageAnnouncements,
        screenReaderMode: this.screenReaderMode,
        soundNotifications: this.soundNotifications,
        readingSpeed: this.readingSpeed,
        interfaceMode: this.interfaceMode,
      }

      try {
        localStorage.setItem('accessibilitySettings', JSON.stringify(settings))
        this.showStatus('Settings saved successfully!', 'success')
        this.announceMessage('Accessibility settings saved successfully')
      } catch (error) {
        console.error('Failed to save settings:', error)
        this.showStatus('Failed to save settings. Please try again.', 'error')
      } finally {
        this.isLoading = false
      }
    },

    // 重置设置
    resetSettings() {
      if (confirm('Are you sure you want to reset all accessibility settings to defaults?')) {
        // 重置所有设置到默认值
        this.highContrastMode = false
        this.largeTextMode = false
        this.keyboardNavigation = true
        this.reduceMotion = false
        this.enhancedFocus = true
        this.skipLinks = true
        this.pageAnnouncements = true
        this.screenReaderMode = false
        this.soundNotifications = false
        this.readingSpeed = 3
        this.interfaceMode = 'standard'

        // 应用设置
        this.applyAllSettings()

        // 清除本地存储
        localStorage.removeItem('accessibilitySettings')

        this.showStatus('Settings reset to defaults', 'info')
        this.announceMessage('All accessibility settings have been reset to defaults')
      }
    },

    // 测试设置
    testSettings() {
      this.announceMessage('Testing accessibility settings with current configuration')
      this.showStatus('Settings test completed. Check screen reader announcements.', 'info')

      // 演示各种功能
      setTimeout(() => {
        if (this.soundNotifications) {
          // 播放测试音频（需要实现音频播放功能）
          console.log('Playing test sound notification')
        }
      }, 1000)
    },

    // 加载保存的设置
    loadSettings() {
      try {
        const saved = localStorage.getItem('accessibilitySettings')
        if (saved) {
          const settings = JSON.parse(saved)
          Object.assign(this, settings)
          this.applyAllSettings()
        }
      } catch (error) {
        console.error('Failed to load accessibility settings:', error)
      }
    },

    // 应用所有设置
    applyAllSettings() {
      document.body.classList.toggle('high-contrast', this.highContrastMode)
      document.body.classList.toggle('large-text', this.largeTextMode)
      document.body.classList.toggle('reduce-motion', this.reduceMotion)
      document.body.classList.toggle('enhanced-focus', this.enhancedFocus)
      document.body.classList.toggle('screen-reader-mode', this.screenReaderMode)
      document.body.classList.toggle('simple-interface', this.interfaceMode === 'simple')
    },

    // 显示状态消息
    showStatus(message, type = 'success') {
      this.statusMessage = message
      this.statusType = type

      // 3秒后清除消息
      setTimeout(() => {
        this.statusMessage = ''
      }, 3000)
    },

    // 页面加载播报
    announcePageLoad() {
      if (this.pageAnnouncements) {
        this.announceMessage(
          'Accessibility Settings page loaded. You can customize your experience using the controls on this page.',
        )
      }
    },
  },
}
</script>

<style scoped>
.accessibility-page {
  max-width: 1000px;
  margin: 0 auto;
  padding: 20px;
  line-height: 1.6;
}

.page-header {
  text-align: center;
  margin-bottom: 40px;
  padding-bottom: 20px;
  border-bottom: 2px solid #dee2e6;
}

.page-header h1 {
  color: #2c3e50;
  margin-bottom: 16px;
  font-size: 32px;
}

.page-description {
  color: #666;
  font-size: 18px;
  max-width: 600px;
  margin: 0 auto;
}

.settings-container {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.settings-section {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.settings-section h2 {
  color: #2c3e50;
  margin-bottom: 24px;
  font-size: 24px;
  border-bottom: 2px solid #3498db;
  padding-bottom: 8px;
}

.setting-group {
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #eee;
}

.setting-group:last-child {
  margin-bottom: 0;
  border-bottom: none;
}

.setting-item {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 20px;
  margin-bottom: 8px;
}

.setting-item.full-width {
  flex-direction: column;
  align-items: stretch;
}

.setting-info {
  flex: 1;
}

.setting-info h3 {
  color: #2c3e50;
  margin-bottom: 4px;
  font-size: 18px;
}

.setting-info p {
  color: #666;
  margin: 0;
  font-size: 14px;
}

.setting-description {
  color: #888;
  font-size: 13px;
  font-style: italic;
  margin-top: 8px;
  padding-left: 16px;
  border-left: 3px solid #e3f2fd;
}

/* 切换按钮样式 */
.toggle-btn {
  position: relative;
  width: 60px;
  height: 30px;
  background: #ccc;
  border: none;
  border-radius: 15px;
  cursor: pointer;
  transition: all 0.3s ease;
  flex-shrink: 0;
}

.toggle-btn:focus {
  outline: 3px solid #4a90e2;
  outline-offset: 2px;
}

.toggle-btn.active {
  background: #4caf50;
}

.toggle-slider {
  position: absolute;
  top: 3px;
  left: 3px;
  width: 24px;
  height: 24px;
  background: white;
  border-radius: 50%;
  transition: transform 0.3s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.toggle-btn.active .toggle-slider {
  transform: translateX(30px);
}

/* 滑块样式 */
.slider-container {
  margin-top: 16px;
}

.slider-label {
  display: block;
  font-weight: bold;
  margin-bottom: 8px;
  color: #2c3e50;
}

.setting-slider {
  width: 100%;
  height: 8px;
  background: #ddd;
  border-radius: 4px;
  outline: none;
  margin-bottom: 8px;
  cursor: pointer;
}

.setting-slider::-webkit-slider-thumb {
  appearance: none;
  width: 20px;
  height: 20px;
  background: #4caf50;
  border-radius: 50%;
  cursor: pointer;
}

.setting-slider::-moz-range-thumb {
  width: 20px;
  height: 20px;
  background: #4caf50;
  border-radius: 50%;
  cursor: pointer;
  border: none;
}

.slider-labels {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  color: #666;
}

.current-value {
  font-weight: bold;
  color: #4caf50;
}

/* 单选按钮样式 */
.radio-group {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 16px;
}

.radio-label {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  padding: 12px;
  border: 2px solid #ddd;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.radio-label:hover {
  border-color: #4caf50;
  background: #f8fff8;
}

.radio-label input[type='radio'] {
  display: none;
}

.radio-custom {
  width: 20px;
  height: 20px;
  border: 2px solid #ddd;
  border-radius: 50%;
  position: relative;
  transition: all 0.3s ease;
}

.radio-label input[type='radio']:checked + .radio-custom {
  border-color: #4caf50;
  background: #4caf50;
}

.radio-label input[type='radio']:checked + .radio-custom::after {
  content: '';
  position: absolute;
  top: 3px;
  left: 3px;
  width: 8px;
  height: 8px;
  background: white;
  border-radius: 50%;
}

.radio-text {
  flex: 1;
  line-height: 1.4;
}

/* 快捷键网格 */
.shortcuts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 16px;
}

.shortcut-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 8px;
}

kbd {
  background: #2c3e50;
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-family: monospace;
  font-size: 12px;
  min-width: 60px;
  text-align: center;
}

/* 操作按钮 */
.settings-actions {
  background: #f8f9fa;
  padding: 24px;
  border-radius: 12px;
  text-align: center;
}

.action-buttons {
  display: flex;
  gap: 16px;
  justify-content: center;
  flex-wrap: wrap;
  margin-bottom: 16px;
}

.btn {
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 16px;
  font-weight: bold;
  transition: all 0.3s ease;
  min-width: 140px;
}

.btn:focus {
  outline: 3px solid #4a90e2;
  outline-offset: 2px;
}

.btn-primary {
  background: #4caf50;
  color: white;
}

.btn-primary:hover {
  background: #45a049;
  transform: translateY(-2px);
}

.btn-secondary {
  background: #6c757d;
  color: white;
}

.btn-secondary:hover {
  background: #5a6268;
  transform: translateY(-2px);
}

.btn-outline {
  background: transparent;
  border: 2px solid #6c757d;
  color: #6c757d;
}

.btn-outline:hover {
  background: #6c757d;
  color: white;
}

/* 状态消息 */
.settings-status {
  margin-top: 16px;
}

.status-message {
  padding: 12px 16px;
  border-radius: 8px;
  font-weight: bold;
}

.status-message.success {
  background: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

.status-message.error {
  background: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}

.status-message.info {
  background: #d1ecf1;
  color: #0c5460;
  border: 1px solid #bee5eb;
}

/* 预览区域 */
.preview-section {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  margin-top: 32px;
}

.preview-section h2 {
  color: #2c3e50;
  margin-bottom: 20px;
  font-size: 24px;
  border-bottom: 2px solid #3498db;
  padding-bottom: 8px;
}

.preview-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
  align-items: flex-start;
}

.preview-content p {
  color: #666;
  font-size: 16px;
  line-height: 1.6;
}

.sample-link {
  color: #3498db;
  text-decoration: underline;
  font-size: 16px;
}

.sample-link:hover {
  color: #2980b9;
}

.sample-link:focus {
  outline: 3px solid #4a90e2;
  outline-offset: 2px;
}

/* 无障碍增强样式 */
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

/* 高对比度模式 */
.high-contrast .settings-section {
  border: 2px solid #000;
}

.high-contrast .setting-item {
  border-bottom: 1px solid #000;
}

.high-contrast .toggle-btn {
  border: 2px solid #000;
}

.high-contrast .btn {
  border: 2px solid #000;
  font-weight: bold;
}

/* 大字体模式 */
.large-text {
  font-size: 120%;
}

.large-text .btn {
  padding: 14px 28px;
  font-size: 18px;
}

.large-text .toggle-btn {
  width: 70px;
  height: 35px;
}

.large-text .toggle-slider {
  width: 28px;
  height: 28px;
}

.large-text .toggle-btn.active .toggle-slider {
  transform: translateX(35px);
}

/* 减少动画模式 */
.reduce-motion * {
  animation-duration: 0.01ms !important;
  animation-iteration-count: 1 !important;
  transition-duration: 0.01ms !important;
}

/* 增强焦点指示器 */
.enhanced-focus *:focus {
  outline: 4px solid #4a90e2 !important;
  outline-offset: 3px !important;
  box-shadow: 0 0 0 6px rgba(74, 144, 226, 0.3) !important;
}

/* 简化界面模式 */
.simple-interface .settings-section {
  padding: 16px;
}

.simple-interface .setting-group {
  margin-bottom: 16px;
}

.simple-interface .shortcuts-grid {
  grid-template-columns: 1fr;
}

.simple-interface .action-buttons {
  flex-direction: column;
  align-items: center;
}

/* 屏幕阅读器模式 */
.screen-reader-mode .setting-description {
  display: block;
  font-style: normal;
  margin-top: 4px;
  padding-left: 0;
  border-left: none;
  color: #666;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .accessibility-page {
    padding: 16px;
  }

  .page-header h1 {
    font-size: 28px;
  }

  .page-description {
    font-size: 16px;
  }

  .settings-section {
    padding: 16px;
  }

  .settings-section h2 {
    font-size: 20px;
  }

  .setting-item {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }

  .toggle-btn {
    align-self: flex-start;
  }

  .shortcuts-grid {
    grid-template-columns: 1fr;
  }

  .action-buttons {
    flex-direction: column;
    align-items: stretch;
  }

  .btn {
    min-width: auto;
  }

  .radio-group {
    gap: 8px;
  }

  .radio-label {
    padding: 8px;
  }
}

@media (max-width: 480px) {
  .page-header h1 {
    font-size: 24px;
  }

  .settings-section h2 {
    font-size: 18px;
  }

  .setting-info h3 {
    font-size: 16px;
  }

  .shortcuts-grid {
    gap: 8px;
  }

  .shortcut-item {
    padding: 8px;
  }

  kbd {
    min-width: 50px;
    font-size: 11px;
  }
}

/* 打印样式 */
@media print {
  .accessibility-page {
    color: black;
    background: white;
  }

  .toggle-btn,
  .action-buttons {
    display: none;
  }

  .settings-section {
    box-shadow: none;
    border: 1px solid #000;
    page-break-inside: avoid;
  }

  .shortcuts-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* 动画和过渡效果 */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.settings-section {
  animation: fadeIn 0.5s ease-out;
}

.status-message {
  animation: fadeIn 0.3s ease-out;
}

/* 自定义滚动条 */
.accessibility-page::-webkit-scrollbar {
  width: 12px;
}

.accessibility-page::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 6px;
}

.accessibility-page::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 6px;
}

.accessibility-page::-webkit-scrollbar-thumb:hover {
  background: #a1a1a1;
}

/* 高对比度模式下的滚动条 */
.high-contrast .accessibility-page::-webkit-scrollbar-track {
  background: #000;
}

.high-contrast .accessibility-page::-webkit-scrollbar-thumb {
  background: #fff;
}

/* 焦点管理 */
.setting-item:focus-within {
  background: rgba(74, 144, 226, 0.05);
  border-radius: 8px;
  padding: 8px;
  margin: -8px;
}

/* 工具提示样式 */
.setting-info [title]:hover::after {
  content: attr(title);
  position: absolute;
  background: #333;
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  white-space: nowrap;
  z-index: 1000;
  margin-top: 5px;
}
</style>

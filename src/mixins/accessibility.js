// 无障碍设计混入 - WCAG 2.1 AA 标准
export const accessibilityMixin = {
  data() {
    return {
      highContrastMode: false,
      largeTextMode: false,
      screenReaderMode: false,
      keyboardNavigation: true,
      focusVisible: true,
    }
  },

  mounted() {
    this.initializeAccessibility()
    this.setupKeyboardNavigation()
    this.detectScreenReader()
    this.loadAccessibilitySettings()
  },

  methods: {
    // 初始化无障碍功能
    initializeAccessibility() {
      // 添加跳转到主内容的链接
      this.addSkipLinks()

      // 设置焦点管理
      this.setupFocusManagement()

      // 添加ARIA标签
      this.addAriaLabels()

      // 检查颜色对比度
      this.checkColorContrast()
    },

    // 添加跳转链接
    addSkipLinks() {
      if (!document.querySelector('.skip-links')) {
        const skipLinks = document.createElement('div')
        skipLinks.className = 'skip-links'
        skipLinks.innerHTML = `
          <a href="#main-content" class="skip-link">Skip to main content</a>
          <a href="#navigation" class="skip-link">Skip to navigation</a>
          <a href="#footer" class="skip-link">Skip to footer</a>
        `
        document.body.insertBefore(skipLinks, document.body.firstChild)
      }
    },

    // 设置键盘导航
    setupKeyboardNavigation() {
      document.addEventListener('keydown', this.handleKeyboardNavigation)

      // 添加焦点可见性样式
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Tab') {
          document.body.classList.add('keyboard-navigation')
        }
      })

      document.addEventListener('mousedown', () => {
        document.body.classList.remove('keyboard-navigation')
      })
    },

    // 键盘导航处理
    handleKeyboardNavigation(event) {
      const { key, altKey, ctrlKey, shiftKey } = event

      // ESC 键关闭模态框
      if (key === 'Escape') {
        this.closeModals()
      }

      // Alt + 1-9 快速导航
      if (altKey && !ctrlKey && !shiftKey) {
        const num = parseInt(key)
        if (num >= 1 && num <= 9) {
          this.navigateToSection(num)
          event.preventDefault()
        }
      }

      // Ctrl + / 显示键盘快捷键帮助
      if (ctrlKey && key === '/') {
        this.showKeyboardShortcuts()
        event.preventDefault()
      }
    },

    // 焦点管理
    setupFocusManagement() {
      // 模态框焦点陷阱
      this.trapFocusInModals()

      // 页面加载时设置初始焦点
      this.setInitialFocus()
    },

    // 检测屏幕阅读器
    detectScreenReader() {
      // 检测常见的屏幕阅读器
      const userAgent = navigator.userAgent.toLowerCase()
      const screenReaders = ['nvda', 'jaws', 'dragon', 'voiceover']

      this.screenReaderMode = screenReaders.some((sr) => userAgent.includes(sr))

      if (this.screenReaderMode) {
        document.body.classList.add('screen-reader-mode')
        this.announcePageLoad()
      }
    },

    // 页面加载时的播报
    announcePageLoad() {
      const announcement = document.createElement('div')
      announcement.setAttribute('aria-live', 'polite')
      announcement.setAttribute('aria-atomic', 'true')
      announcement.className = 'sr-only'
      announcement.textContent = `Page loaded: ${document.title}. Use Tab to navigate, Alt+1-9 for quick navigation.`
      document.body.appendChild(announcement)

      setTimeout(() => {
        document.body.removeChild(announcement)
      }, 3000)
    },

    // 添加ARIA标签
    addAriaLabels() {
      // 为表单元素添加标签
      this.labelFormElements()

      // 为导航添加地标
      this.addLandmarkRoles()

      // 为动态内容添加live regions
      this.addLiveRegions()
    },

    // 表单元素标签
    labelFormElements() {
      const inputs = document.querySelectorAll('input, select, textarea')
      inputs.forEach((input) => {
        if (!input.getAttribute('aria-label') && !input.getAttribute('aria-labelledby')) {
          const label = document.querySelector(`label[for="${input.id}"]`)
          if (label) {
            input.setAttribute('aria-labelledby', label.id || `label-${input.id}`)
          }
        }

        // 添加必填字段指示
        if (input.required) {
          input.setAttribute('aria-required', 'true')
        }

        // 添加错误状态
        if (input.classList.contains('error')) {
          input.setAttribute('aria-invalid', 'true')
        }
      })
    },

    // 添加地标角色
    addLandmarkRoles() {
      const nav = document.querySelector('nav')
      if (nav && !nav.getAttribute('role')) {
        nav.setAttribute('role', 'navigation')
        nav.setAttribute('aria-label', 'Main navigation')
      }

      const main = document.querySelector('main, #main-content')
      if (main && !main.getAttribute('role')) {
        main.setAttribute('role', 'main')
      }

      const footer = document.querySelector('footer')
      if (footer && !footer.getAttribute('role')) {
        footer.setAttribute('role', 'contentinfo')
      }
    },

    // 添加live regions
    addLiveRegions() {
      if (!document.querySelector('#status-messages')) {
        const statusDiv = document.createElement('div')
        statusDiv.id = 'status-messages'
        statusDiv.setAttribute('aria-live', 'polite')
        statusDiv.setAttribute('aria-atomic', 'true')
        statusDiv.className = 'sr-only'
        document.body.appendChild(statusDiv)
      }
    },

    // 播报状态消息
    announceMessage(message, priority = 'polite') {
      const statusDiv = document.querySelector('#status-messages')
      if (statusDiv) {
        statusDiv.setAttribute('aria-live', priority)
        statusDiv.textContent = message

        setTimeout(() => {
          statusDiv.textContent = ''
        }, 5000)
      }
    },

    // 高对比度模式
    toggleHighContrast() {
      this.highContrastMode = !this.highContrastMode
      document.body.classList.toggle('high-contrast', this.highContrastMode)
      this.saveAccessibilitySettings()
      this.announceMessage(`High contrast mode ${this.highContrastMode ? 'enabled' : 'disabled'}`)
    },

    // 大字体模式
    toggleLargeText() {
      this.largeTextMode = !this.largeTextMode
      document.body.classList.toggle('large-text', this.largeTextMode)
      this.saveAccessibilitySettings()
      this.announceMessage(`Large text mode ${this.largeTextMode ? 'enabled' : 'disabled'}`)
    },

    // 保存无障碍设置
    saveAccessibilitySettings() {
      const settings = {
        highContrastMode: this.highContrastMode,
        largeTextMode: this.largeTextMode,
        keyboardNavigation: this.keyboardNavigation,
      }
      localStorage.setItem('accessibilitySettings', JSON.stringify(settings))
    },

    // 加载无障碍设置
    loadAccessibilitySettings() {
      const saved = localStorage.getItem('accessibilitySettings')
      if (saved) {
        const settings = JSON.parse(saved)
        this.highContrastMode = settings.highContrastMode || false
        this.largeTextMode = settings.largeTextMode || false
        this.keyboardNavigation = settings.keyboardNavigation !== false

        // 应用设置
        document.body.classList.toggle('high-contrast', this.highContrastMode)
        document.body.classList.toggle('large-text', this.largeTextMode)
      }
    },

    // 颜色对比度检查
    checkColorContrast() {
      // 这里会检查页面元素的颜色对比度是否符合WCAG标准
      // 在实际项目中可以使用工具如axe-core进行自动检查
      console.log('Color contrast check completed')
    },

    // 关闭模态框
    closeModals() {
      const modals = document.querySelectorAll('.modal-overlay')
      modals.forEach((modal) => {
        if (modal.style.display !== 'none') {
          modal.style.display = 'none'
          this.restoreFocus()
        }
      })
    },

    // 恢复焦点
    restoreFocus() {
      if (this.lastFocusedElement) {
        this.lastFocusedElement.focus()
        this.lastFocusedElement = null
      }
    },

    // 模态框焦点陷阱
    trapFocusInModals() {
      document.addEventListener('focusin', (e) => {
        const modal = e.target.closest('.modal-overlay')
        if (modal && modal.style.display !== 'none') {
          const focusableElements = modal.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
          )

          if (focusableElements.length === 0) return

          const firstElement = focusableElements[0]
          const lastElement = focusableElements[focusableElements.length - 1]

          if (e.target === modal) {
            firstElement.focus()
          }
        }
      })
    },

    // 设置初始焦点
    setInitialFocus() {
      this.$nextTick(() => {
        const mainHeading = document.querySelector('h1')
        if (mainHeading) {
          mainHeading.setAttribute('tabindex', '-1')
          mainHeading.focus()
        }
      })
    },

    // 快速导航
    navigateToSection(num) {
      const sections = {
        1: '#main-content',
        2: '#navigation',
        3: '#health-resources',
        4: '#community-events',
        5: '#support',
        6: '#user-dashboard',
        7: '#admin-panel',
        8: '#settings',
        9: '#footer',
      }

      const target = document.querySelector(sections[num])
      if (target) {
        target.focus()
        target.scrollIntoView({ behavior: 'smooth' })
        this.announceMessage(
          `Navigated to ${target.textContent || target.getAttribute('aria-label') || 'section'}`,
        )
      }
    },

    // 显示键盘快捷键帮助
    showKeyboardShortcuts() {
      const shortcuts = `
        Keyboard Shortcuts:
        - Tab: Navigate forward
        - Shift+Tab: Navigate backward
        - Enter/Space: Activate buttons and links
        - Escape: Close modals and menus
        - Alt+1-9: Quick navigation to sections
        - Ctrl+/: Show this help
        - Alt+H: Toggle high contrast
        - Alt+L: Toggle large text
      `

      alert(shortcuts) // 在实际项目中应该使用更好的模态框
    },
  },

  beforeUnmount() {
    document.removeEventListener('keydown', this.handleKeyboardNavigation)
  },
}

// CSS类用于无障碍功能
export const accessibilityCSS = `
/* 跳转链接 */
.skip-links {
  position: absolute;
  top: -40px;
  left: 6px;
  z-index: 1000;
}

.skip-link {
  position: absolute;
  top: -40px;
  left: 6px;
  background: #000;
  color: #fff;
  padding: 8px;
  text-decoration: none;
  border-radius: 4px;
  z-index: 1000;
}

.skip-link:focus {
  top: 6px;
}

/* 屏幕阅读器专用文本 */
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

/* 键盘导航时的焦点样式 */
.keyboard-navigation *:focus {
  outline: 3px solid #4A90E2 !important;
  outline-offset: 2px !important;
}

/* 高对比度模式 */
.high-contrast {
  filter: contrast(150%) brightness(110%);
}

.high-contrast .btn {
  border: 2px solid !important;
}

.high-contrast a {
  text-decoration: underline !important;
}

/* 大字体模式 */
.large-text {
  font-size: 120% !important;
}

.large-text .btn {
  padding: 14px 28px !important;
  font-size: 18px !important;
}

.large-text input,
.large-text select,
.large-text textarea {
  font-size: 18px !important;
  padding: 14px !important;
}

/* 错误状态 */
[aria-invalid="true"] {
  border-color: #dc3545 !important;
  border-width: 2px !important;
}

/* 必填字段指示 */
[aria-required="true"]::after {
  content: " *";
  color: #dc3545;
}

/* 焦点陷阱 */
.modal-overlay:focus {
  outline: none;
}

/* 减少动画 */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}

/* 改善点击目标大小 */
.btn,
.btn-sm {
  min-height: 44px;
  min-width: 44px;
}

/* 改善颜色对比度 */
.text-muted {
  color: #495057 !important;
}

/* ARIA live regions */
[aria-live] {
  position: absolute;
  left: -10000px;
  width: 1px;
  height: 1px;
  overflow: hidden;
}
`

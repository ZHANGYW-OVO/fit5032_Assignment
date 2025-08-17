<template>
  <div class="comprehensive-dashboard" id="main-content">
    <!-- 页面头部 -->
    <div class="dashboard-header">
      <h1 tabindex="-1">🩺 Comprehensive Health Dashboard</h1>
      <div class="header-actions">
        <!-- 无障碍功能按钮 -->
        <div class="accessibility-controls">
          <button
            @click="toggleHighContrast"
            :class="`btn btn-outline ${highContrastMode ? 'active' : ''}`"
            :aria-pressed="highContrastMode"
            title="Toggle high contrast mode"
          >
            🔆 High Contrast
          </button>
          <button
            @click="toggleLargeText"
            :class="`btn btn-outline ${largeTextMode ? 'active' : ''}`"
            :aria-pressed="largeTextMode"
            title="Toggle large text mode"
          >
            📝 Large Text
          </button>
        </div>

        <!-- 离线状态指示器 -->
        <div class="connection-status" :class="{ offline: !isOnline }">
          <span class="status-icon">{{ isOnline ? '🌐' : '📱' }}</span>
          <span class="status-text">{{ isOnline ? 'Online' : 'Offline' }}</span>
        </div>
      </div>
    </div>

    <!-- 主要功能标签页 -->
    <div class="main-tabs" role="tablist" aria-label="Dashboard sections">
      <button
        v-for="tab in mainTabs"
        :key="tab.id"
        @click="activeTab = tab.id"
        :class="`tab-button ${activeTab === tab.id ? 'active' : ''}`"
        :aria-selected="activeTab === tab.id"
        :aria-controls="`panel-${tab.id}`"
        role="tab"
      >
        {{ tab.icon }} {{ tab.label }}
      </button>
    </div>

    <!-- 标签页内容 -->
    <div class="tab-content">
      <!-- 健康数据可视化 -->
      <div
        v-if="activeTab === 'analytics'"
        class="tab-panel"
        :id="`panel-analytics`"
        role="tabpanel"
        aria-labelledby="tab-analytics"
      >
        <HealthCharts />
      </div>

      <!-- 数据管理 -->
      <div
        v-if="activeTab === 'data'"
        class="tab-panel"
        :id="`panel-data`"
        role="tabpanel"
        aria-labelledby="tab-data"
      >
        <div class="data-section">
          <h2>📊 Interactive Data Tables</h2>

          <!-- 健康资源表格 -->
          <InteractiveDataTable
            title="🩺 Health Resources"
            :data="healthResources"
            :columns="healthResourceColumns"
            :actions="healthResourceActions"
          />

          <!-- 用户管理表格（仅管理员） -->
          <InteractiveDataTable
            v-if="isAdmin"
            title="👥 User Management"
            :data="users"
            :columns="userColumns"
            :actions="userActions"
          />

          <!-- 导出功能 -->
          <div class="export-section">
            <h3>📤 Data Export Options</h3>
            <div class="export-buttons">
              <button @click="exportHealthReport" class="btn btn-primary">
                📄 Export Health Report (PDF)
              </button>
              <button @click="exportUserList" class="btn btn-secondary">
                📊 Export User List (PDF)
              </button>
              <button @click="exportResourcesReport" class="btn btn-secondary">
                📋 Export Resources Report (PDF)
              </button>
              <button @click="exportDataCSV" class="btn btn-outline">📈 Export Data (CSV)</button>
            </div>
          </div>
        </div>
      </div>

      <!-- 预约管理 -->
      <div
        v-if="activeTab === 'appointments'"
        class="tab-panel"
        :id="`panel-appointments`"
        role="tabpanel"
        aria-labelledby="tab-appointments"
      >
        <AppointmentBooking />
      </div>

      <!-- 地图服务 -->
      <div
        v-if="activeTab === 'locations'"
        class="tab-panel"
        :id="`panel-locations`"
        role="tabpanel"
        aria-labelledby="tab-locations"
      >
        <HealthMap />
      </div>

      <!-- 离线功能 -->
      <div
        v-if="activeTab === 'offline'"
        class="tab-panel"
        :id="`panel-offline`"
        role="tabpanel"
        aria-labelledby="tab-offline"
      >
        <OfflineFeatures />
      </div>

      <!-- API管理 -->
      <div
        v-if="activeTab === 'api'"
        class="tab-panel"
        :id="`panel-api`"
        role="tabpanel"
        aria-labelledby="tab-api"
      >
        <div class="api-section">
          <h2>🔌 API Management</h2>

          <!-- API统计 -->
          <div class="api-stats">
            <div class="stat-card">
              <h3>📈 API Usage Today</h3>
              <div class="stat-value">{{ apiStats.todayRequests }}</div>
              <div class="stat-label">Requests</div>
            </div>
            <div class="stat-card">
              <h3>📊 Total This Month</h3>
              <div class="stat-value">{{ apiStats.totalRequests }}</div>
              <div class="stat-label">Requests</div>
            </div>
          </div>

          <!-- API端点测试 -->
          <div class="api-testing">
            <h3>🧪 Test API Endpoints</h3>
            <div class="endpoint-tests">
              <div class="test-section">
                <h4>GET /api/v1/health-statistics</h4>
                <button @click="testHealthStats" class="btn btn-primary">Test Endpoint</button>
                <pre v-if="testResults.healthStats" class="test-result">{{
                  JSON.stringify(testResults.healthStats, null, 2)
                }}</pre>
              </div>

              <div class="test-section">
                <h4>GET /api/v1/community-events</h4>
                <button @click="testCommunityEvents" class="btn btn-primary">Test Endpoint</button>
                <pre v-if="testResults.events" class="test-result">{{
                  JSON.stringify(testResults.events, null, 2)
                }}</pre>
              </div>
            </div>
          </div>

          <!-- API文档 -->
          <div class="api-docs">
            <h3>📚 API Documentation</h3>
            <div class="docs-content">
              <p>Our REST API provides access to health data and community resources:</p>
              <ul>
                <li><strong>GET /api/v1/health-statistics</strong> - Aggregated health metrics</li>
                <li><strong>GET /api/v1/community-events</strong> - Upcoming community events</li>
                <li><strong>GET /api/v1/health-resources</strong> - Educational resources</li>
                <li><strong>POST /api/v1/health-data</strong> - Submit health measurements</li>
                <li>
                  <strong>GET /api/v1/appointment-slots</strong> - Available appointment times
                </li>
              </ul>
              <p>
                <strong>Authentication:</strong> Include your API key in the X-API-Key header.
                <br />
                <strong>Rate Limits:</strong> 100 requests per minute per API key.
              </p>
              <button @click="downloadAPIDoc" class="btn btn-secondary">
                📄 Download Full Documentation
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 通信功能 -->
      <div
        v-if="activeTab === 'communication'"
        class="tab-panel"
        :id="`panel-communication`"
        role="tabpanel"
        aria-labelledby="tab-communication"
      >
        <div class="communication-section">
          <h2>📧 Communication Center</h2>

          <!-- 发送健康报告 -->
          <div class="email-section">
            <h3>📄 Send Health Report</h3>
            <form @submit.prevent="sendHealthReport" class="email-form">
              <div class="form-group">
                <label for="recipient-email" class="form-label">Recipient Email</label>
                <input
                  id="recipient-email"
                  type="email"
                  v-model="emailForm.recipientEmail"
                  class="form-input"
                  placeholder="doctor@example.com"
                  required
                />
              </div>
              <div class="form-group">
                <label for="report-type" class="form-label">Report Type</label>
                <select id="report-type" v-model="emailForm.reportType" class="form-input">
                  <option value="comprehensive">Comprehensive Health Report</option>
                  <option value="summary">Health Summary</option>
                  <option value="vitals">Vital Signs Only</option>
                </select>
              </div>
              <div class="form-group">
                <label for="message" class="form-label">Additional Message</label>
                <textarea
                  id="message"
                  v-model="emailForm.message"
                  class="form-input"
                  rows="4"
                  placeholder="Any additional information for your healthcare provider..."
                ></textarea>
              </div>
              <button type="submit" class="btn btn-primary" :disabled="sendingEmail">
                {{ sendingEmail ? 'Sending...' : '📧 Send Report' }}
              </button>
            </form>
          </div>

          <!-- 批量邮件功能（管理员） -->
          <div v-if="isAdmin" class="bulk-email-section">
            <h3>📮 Bulk Email to Users</h3>
            <form @submit.prevent="sendBulkEmail" class="bulk-email-form">
              <div class="form-group">
                <label for="email-subject" class="form-label">Subject</label>
                <input
                  id="email-subject"
                  type="text"
                  v-model="bulkEmailForm.subject"
                  class="form-input"
                  placeholder="Important Health Update"
                  required
                />
              </div>
              <div class="form-group">
                <label for="email-content" class="form-label">Message Content</label>
                <textarea
                  id="email-content"
                  v-model="bulkEmailForm.content"
                  class="form-input"
                  rows="6"
                  placeholder="Your message to community members..."
                  required
                ></textarea>
              </div>
              <div class="form-group">
                <label class="checkbox-label">
                  <input type="checkbox" v-model="bulkEmailForm.sendToAll" />
                  Send to all users
                </label>
              </div>
              <button type="submit" class="btn btn-primary" :disabled="sendingBulkEmail">
                {{ sendingBulkEmail ? 'Sending...' : '📬 Send Bulk Email' }}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>

    <!-- 全局通知区域 -->
    <div id="notifications" aria-live="polite" aria-atomic="true" class="sr-only"></div>

    <!-- 云函数状态 -->
    <div v-if="showCloudStatus" class="cloud-status">
      <h4>☁️ Cloud Functions Status</h4>
      <div class="function-status">
        <div class="status-item">
          <span>Health Data Processing:</span>
          <span class="status-indicator operational">🟢 Operational</span>
        </div>
        <div class="status-item">
          <span>Risk Assessment:</span>
          <span class="status-indicator operational">🟢 Operational</span>
        </div>
        <div class="status-item">
          <span>Appointment Optimization:</span>
          <span class="status-indicator operational">🟢 Operational</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { accessibilityMixin } from '../mixins/accessibility.js'
import HealthCharts from '../components/HealthCharts.vue'
import InteractiveDataTable from '../components/InteractiveDataTable.vue'
import AppointmentBooking from '../components/AppointmentBooking.vue'
import HealthMap from '../components/HealthMap.vue'
import OfflineFeatures from '../components/OfflineFeatures.vue'
import { authStore } from '../stores/auth.js'
import { sendHealthReport, sendBulkReminders } from '../services/emailService.js'
import {
  exportHealthReport,
  exportUserList,
  exportResourcesReport,
  exportCSV,
} from '../services/exportService.js'
import { handleAPIRequest, getAPIDocumentation } from '../services/apiService.js'

export default {
  name: 'ComprehensiveHealthDashboard',
  components: {
    HealthCharts,
    InteractiveDataTable,
    AppointmentBooking,
    HealthMap,
    OfflineFeatures,
  },
  mixins: [accessibilityMixin],
  inject: ['globalState'],

  data() {
    return {
      activeTab: 'analytics',
      isOnline: navigator.onLine,
      showCloudStatus: false,
      sendingEmail: false,
      sendingBulkEmail: false,

      mainTabs: [
        { id: 'analytics', label: 'Health Analytics', icon: '📊' },
        { id: 'data', label: 'Data Management', icon: '🗂️' },
        { id: 'appointments', label: 'Appointments', icon: '📅' },
        { id: 'locations', label: 'Find Care', icon: '🗺️' },
        { id: 'offline', label: 'Offline Features', icon: '📱' },
        { id: 'api', label: 'API Management', icon: '🔌' },
        { id: 'communication', label: 'Communications', icon: '📧' },
      ],

      emailForm: {
        recipientEmail: '',
        reportType: 'comprehensive',
        message: '',
      },

      bulkEmailForm: {
        subject: '',
        content: '',
        sendToAll: false,
      },

      testResults: {
        healthStats: null,
        events: null,
      },

      // 表格列定义
      healthResourceColumns: [
        { key: 'title', label: 'Title' },
        { key: 'category', label: 'Category' },
        { key: 'author', label: 'Author' },
        { key: 'averageRating', label: 'Rating', type: 'number' },
        { key: 'downloadCount', label: 'Downloads', type: 'number' },
      ],

      userColumns: [
        { key: 'name', label: 'Name' },
        { key: 'email', label: 'Email' },
        { key: 'role', label: 'Role' },
        { key: 'createdAt', label: 'Created', type: 'date' },
      ],

      // 表格操作
      healthResourceActions: [
        {
          key: 'view',
          label: 'View',
          type: 'primary',
          handler: this.viewResource,
        },
        {
          key: 'download',
          label: 'Download',
          type: 'secondary',
          handler: this.downloadResource,
        },
      ],

      userActions: [
        {
          key: 'edit',
          label: 'Edit',
          type: 'secondary',
          handler: this.editUser,
        },
        {
          key: 'delete',
          label: 'Delete',
          type: 'danger',
          handler: this.deleteUser,
        },
      ],
    }
  },

  computed: {
    currentUser() {
      return authStore.getCurrentUser()
    },

    isAdmin() {
      return authStore.isAdmin()
    },

    healthResources() {
      return this.globalState.healthResources
    },

    users() {
      return this.globalState.users
    },

    apiStats() {
      return this.globalState.apiStats
    },
  },

  mounted() {
    this.setupDashboard()
    this.setInitialFocus()
  },

  methods: {
    setupDashboard() {
      // 监听在线/离线状态
      window.addEventListener('online', () => {
        this.isOnline = true
      })
      window.addEventListener('offline', () => {
        this.isOnline = false
      })

      // 检查用户权限并调整可见标签
      if (!this.isAdmin) {
        this.mainTabs = this.mainTabs.filter((tab) => !['api', 'communication'].includes(tab.id))
      }
    },

    // 导出功能
    async exportHealthReport() {
      const patientData = {
        name: this.currentUser?.name || 'Patient',
        age: 67,
        email: this.currentUser?.email,
      }

      const reportData = {
        vitals: [
          { metric: 'Blood Pressure', value: '128/82', unit: 'mmHg', status: 'Normal' },
          { metric: 'Heart Rate', value: '74', unit: 'BPM', status: 'Normal' },
          { metric: 'Weight', value: '68.5', unit: 'kg', status: 'Target Range' },
        ],
        recommendations:
          'Continue current medication routine, improve sleep schedule, maintain physical activity.',
      }

      const result = await exportHealthReport(patientData, reportData)
      this.announceMessage(result.success ? 'Health report exported successfully' : result.message)
    },

    async exportUserList() {
      const result = await exportUserList(this.users)
      this.announceMessage(result.success ? 'User list exported successfully' : result.message)
    },

    async exportResourcesReport() {
      const result = await exportResourcesReport(this.healthResources)
      this.announceMessage(
        result.success ? 'Resources report exported successfully' : result.message,
      )
    },

    exportDataCSV() {
      const columns = this.healthResourceColumns
      const result = exportCSV(this.healthResources, columns, 'health_resources.csv')
      this.announceMessage(result.success ? 'CSV exported successfully' : result.message)
    },

    // API测试功能
    async testHealthStats() {
      try {
        const response = await handleAPIRequest(
          'GET',
          '/health-statistics?timeRange=30days&details=true',
          { 'x-api-key': 'hc_live_sk_12345abcdef' },
        )
        this.testResults.healthStats = JSON.parse(response.body)
      } catch (error) {
        console.error('API test failed:', error)
        this.announceMessage('API test failed')
      }
    },

    async testCommunityEvents() {
      try {
        const response = await handleAPIRequest('GET', '/community-events?limit=5', {
          'x-api-key': 'hc_live_sk_12345abcdef',
        })
        this.testResults.events = JSON.parse(response.body)
      } catch (error) {
        console.error('API test failed:', error)
        this.announceMessage('API test failed')
      }
    },

    downloadAPIDoc() {
      const docs = getAPIDocumentation()
      const docContent = JSON.stringify(docs, null, 2)
      const blob = new Blob([docContent], { type: 'application/json' })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = 'api-documentation.json'
      link.click()
      window.URL.revokeObjectURL(url)
    },

    // 邮件功能
    async sendHealthReport() {
      this.sendingEmail = true

      try {
        const reportData = {
          patientName: this.currentUser?.name || 'Patient',
          date: new Date().toLocaleDateString(),
          reportType: this.emailForm.reportType,
          summary: 'Health metrics show overall positive trends',
          recommendations: 'Continue current care plan',
        }

        const result = await sendHealthReport(this.emailForm.recipientEmail, reportData)

        if (result.success) {
          this.announceMessage('Health report sent successfully')
          this.emailForm = { recipientEmail: '', reportType: 'comprehensive', message: '' }
        } else {
          this.announceMessage('Failed to send health report: ' + result.message)
        }
      } catch (error) {
        console.error('Email sending failed:', error)
        this.announceMessage('Failed to send email')
      } finally {
        this.sendingEmail = false
      }
    },

    async sendBulkEmail() {
      this.sendingBulkEmail = true

      try {
        const recipients = this.users
          .filter((user) => this.bulkEmailForm.sendToAll || user.role === 'user')
          .map((user) => ({ email: user.email, name: user.name }))

        const reminderData = {
          subject: this.bulkEmailForm.subject,
          type: 'announcement',
          message: this.bulkEmailForm.content,
          dueDate: new Date().toLocaleDateString(),
          actionRequired: 'Please read the message carefully',
        }

        const result = await sendBulkReminders(recipients, reminderData)

        if (result.success) {
          this.announceMessage(`Bulk email sent to ${result.totalSent} recipients`)
          this.bulkEmailForm = { subject: '', content: '', sendToAll: false }
        } else {
          this.announceMessage('Failed to send bulk email')
        }
      } catch (error) {
        console.error('Bulk email failed:', error)
        this.announceMessage('Failed to send bulk email')
      } finally {
        this.sendingBulkEmail = false
      }
    },

    // 表格操作处理
    viewResource(resource) {
      alert(`Viewing resource: ${resource.title}`)
    },

    downloadResource(resource) {
      this.announceMessage(`Downloading: ${resource.title}`)
    },

    editUser(user) {
      alert(`Editing user: ${user.name}`)
    },

    deleteUser(user) {
      if (confirm(`Delete user: ${user.name}?`)) {
        const index = this.users.findIndex((u) => u.id === user.id)
        if (index !== -1) {
          this.users.splice(index, 1)
          this.announceMessage('User deleted successfully')
        }
      }
    },
  },
}
</script>

<style scoped>
.comprehensive-dashboard {
  max-width: 1400px;
  margin: 0 auto;
  padding: 20px;
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  flex-wrap: wrap;
  gap: 20px;
}

.dashboard-header h1 {
  color: #2c3e50;
  margin: 0;
  font-size: 28px;
}

.header-actions {
  display: flex;
  gap: 20px;
  align-items: center;
}

.accessibility-controls {
  display: flex;
  gap: 10px;
}

.connection-status {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: #d4edda;
  border: 1px solid #c3e6cb;
  border-radius: 6px;
  font-size: 14px;
}

.connection-status.offline {
  background: #fff3cd;
  border-color: #ffeaa7;
}

.main-tabs {
  display: flex;
  gap: 2px;
  margin-bottom: 30px;
  border-bottom: 2px solid #dee2e6;
  overflow-x: auto;
}

.tab-button {
  padding: 15px 20px;
  border: none;
  background: none;
  cursor: pointer;
  font-size: 16px;
  color: #666;
  border-bottom: 3px solid transparent;
  transition: all 0.3s ease;
  white-space: nowrap;
}

.tab-button:hover {
  color: #007bff;
  background: #f8f9fa;
}

.tab-button.active {
  color: #007bff;
  border-bottom-color: #007bff;
  font-weight: bold;
}

.tab-panel {
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.data-section {
  display: flex;
  flex-direction: column;
  gap: 30px;
}

.export-section {
  background: white;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.export-buttons {
  display: flex;
  gap: 15px;
  flex-wrap: wrap;
}

.api-section {
  display: flex;
  flex-direction: column;
  gap: 30px;
}

.api-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
}

.stat-card {
  background: white;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  text-align: center;
}

.stat-value {
  font-size: 32px;
  font-weight: bold;
  color: #007bff;
  margin: 10px 0;
}

.api-testing {
  background: white;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.endpoint-tests {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.test-section {
  border: 1px solid #dee2e6;
  border-radius: 8px;
  padding: 15px;
}

.test-result {
  background: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  padding: 10px;
  margin-top: 10px;
  font-size: 12px;
  overflow-x: auto;
}

.api-docs {
  background: white;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.communication-section {
  display: flex;
  flex-direction: column;
  gap: 30px;
}

.email-section,
.bulk-email-section {
  background: white;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.email-form,
.bulk-email-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
  max-width: 600px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-label {
  font-weight: bold;
  color: #2c3e50;
}

.form-input {
  padding: 12px;
  border: 2px solid #ddd;
  border-radius: 6px;
  font-size: 16px;
}

.form-input:focus {
  outline: none;
  border-color: #007bff;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.cloud-status {
  margin-top: 30px;
  background: white;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.function-status {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.status-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  background: #f8f9fa;
  border-radius: 6px;
}

.status-indicator.operational {
  color: #28a745;
  font-weight: bold;
}

.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: bold;
  transition: all 0.3s ease;
}

.btn-primary {
  background: #007bff;
  color: white;
}

.btn-secondary {
  background: #6c757d;
  color: white;
}

.btn-outline {
  background: transparent;
  border: 2px solid #6c757d;
  color: #6c757d;
}

.btn-outline.active {
  background: #6c757d;
  color: white;
}

.btn:hover:not(:disabled) {
  opacity: 0.9;
  transform: translateY(-1px);
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .dashboard-header {
    flex-direction: column;
    align-items: stretch;
  }

  .header-actions {
    justify-content: space-between;
  }

  .main-tabs {
    flex-wrap: wrap;
  }

  .api-stats {
    grid-template-columns: 1fr;
  }

  .export-buttons {
    flex-direction: column;
  }
}
</style>

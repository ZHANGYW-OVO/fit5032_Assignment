<template>
  <div class="admin-dashboard">
    <!-- 管理员概览统计 -->
    <div class="stats-overview">
      <div class="stat-card">
        <div class="stat-icon">👥</div>
        <div class="stat-info">
          <h3>{{ users.length }}</h3>
          <p>Total Users</p>
          <div class="stat-breakdown">
            <span>👨‍💼 Admins: {{ adminCount }}</span>
            <span>🤝 Volunteers: {{ volunteerCount }}</span>
            <span>👤 Users: {{ regularUserCount }}</span>
          </div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon">📚</div>
        <div class="stat-info">
          <h3>{{ healthResources.length }}</h3>
          <p>Health Resources</p>
          <div class="stat-breakdown">
            <span>⭐ Avg Rating: {{ averageResourceRating.toFixed(1) }}</span>
            <span>📥 Downloads: {{ totalDownloads }}</span>
          </div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon">🎯</div>
        <div class="stat-info">
          <h3>{{ communityEvents.length }}</h3>
          <p>Community Events</p>
          <div class="stat-breakdown">
            <span>📅 This Month: {{ eventsThisMonth }}</span>
            <span>👥 Total Attendees: {{ totalAttendees }}</span>
          </div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon">📊</div>
        <div class="stat-info">
          <h3>{{ apiStats.todayRequests }}</h3>
          <p>API Requests Today</p>
          <div class="stat-breakdown">
            <span>📈 This Month: {{ apiStats.totalRequests }}</span>
            <span>🔌 Active APIs: 5</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 快速操作面板 -->
    <div class="quick-actions">
      <h3>🚀 Quick Actions</h3>
      <div class="action-buttons">
        <button @click="exportAllData" class="action-btn export">
          <span class="btn-icon">📤</span>
          <span class="btn-text">Export All Data</span>
        </button>
        <button @click="sendBulkHealth" class="action-btn email">
          <span class="btn-icon">📧</span>
          <span class="btn-text">Send Health Tips</span>
        </button>
        <button @click="syncCloudData" class="action-btn sync">
          <span class="btn-icon">☁️</span>
          <span class="btn-text">Sync Cloud Data</span>
        </button>
        <button @click="generateReports" class="action-btn report">
          <span class="btn-icon">📊</span>
          <span class="btn-text">Generate Reports</span>
        </button>
      </div>
    </div>

    <!-- 数据表格管理 -->
    <div class="data-management">
      <h3>🗂️ Data Management</h3>

      <!-- 用户管理表格 -->
      <div class="table-section">
        <InteractiveDataTable
          title="👥 User Management"
          :data="users"
          :columns="userColumns"
          :actions="userActions"
          :initial-page-size="10"
        />
      </div>

      <!-- 健康资源管理表格 -->
      <div class="table-section">
        <InteractiveDataTable
          title="📚 Health Resources Management"
          :data="healthResources"
          :columns="resourceColumns"
          :actions="resourceActions"
          :initial-page-size="10"
        />
      </div>

      <!-- 社区活动管理表格 -->
      <div class="table-section">
        <InteractiveDataTable
          title="🎯 Community Events Management"
          :data="communityEvents"
          :columns="eventColumns"
          :actions="eventActions"
          :initial-page-size="10"
        />
      </div>
    </div>

    <!-- 系统健康状态 -->
    <div class="system-health">
      <h3>🔧 System Health</h3>
      <div class="health-grid">
        <div class="health-item">
          <div class="health-status operational">🟢</div>
          <div class="health-info">
            <h4>Database</h4>
            <p>All connections healthy</p>
            <small>Last check: {{ formatTime(new Date()) }}</small>
          </div>
        </div>

        <div class="health-item">
          <div class="health-status operational">🟢</div>
          <div class="health-info">
            <h4>Email Service</h4>
            <p>EmailJS operational</p>
            <small>{{ emailsSentToday }} emails sent today</small>
          </div>
        </div>

        <div class="health-item">
          <div class="health-status operational">🟢</div>
          <div class="health-info">
            <h4>Firebase Functions</h4>
            <p>All functions operational</p>
            <small>Avg response: 145ms</small>
          </div>
        </div>

        <div class="health-item">
          <div class="health-status operational">🟢</div>
          <div class="health-info">
            <h4>Map Services</h4>
            <p>Geo services active</p>
            <small>{{ facilitySearches }} searches today</small>
          </div>
        </div>
      </div>
    </div>

    <!-- 最近活动日志 -->
    <div class="activity-log">
      <h3>📋 Recent Activity</h3>
      <div class="activity-list">
        <div v-for="activity in recentActivities" :key="activity.id" class="activity-item">
          <div class="activity-icon">{{ activity.icon }}</div>
          <div class="activity-content">
            <div class="activity-title">{{ activity.title }}</div>
            <div class="activity-description">{{ activity.description }}</div>
            <div class="activity-time">{{ formatTime(activity.timestamp) }}</div>
          </div>
          <div class="activity-status" :class="activity.status">
            {{ activity.status }}
          </div>
        </div>
      </div>
    </div>

    <!-- API 监控面板 -->
    <div class="api-monitoring">
      <h3>🔌 API Monitoring</h3>
      <div class="api-stats-grid">
        <div class="api-stat-item">
          <h4>Most Popular Endpoints</h4>
          <div class="endpoint-list">
            <div v-for="endpoint in popularEndpoints" :key="endpoint.path" class="endpoint-item">
              <span class="endpoint-path">{{ endpoint.path }}</span>
              <span class="endpoint-count">{{ endpoint.requests }}</span>
            </div>
          </div>
        </div>

        <div class="api-stat-item">
          <h4>Response Times</h4>
          <div class="response-times">
            <div class="time-stat">
              <span>Average:</span>
              <span class="time-value good">145ms</span>
            </div>
            <div class="time-stat">
              <span>95th percentile:</span>
              <span class="time-value ok">287ms</span>
            </div>
            <div class="time-stat">
              <span>Max:</span>
              <span class="time-value warning">1.2s</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import InteractiveDataTable from './InteractiveDataTable.vue'
import { sendBulkReminders } from '../services/emailService.js'
import { exportUserList, exportResourcesReport } from '../services/exportService.js'
import { cloudFunctionsService } from '../services/cloudFunctions.js'

export default {
  name: 'AdminDashboard',
  components: {
    InteractiveDataTable,
  },
  inject: ['globalState'],

  data() {
    return {
      emailsSentToday: 47,
      facilitySearches: 23,

      // 表格列定义
      userColumns: [
        { key: 'name', label: 'Name' },
        { key: 'email', label: 'Email' },
        {
          key: 'role',
          label: 'Role',
          render: (value) => `<span class="role-badge role-${value}">${value}</span>`,
        },
        { key: 'createdAt', label: 'Created', type: 'date' },
      ],

      resourceColumns: [
        { key: 'title', label: 'Title' },
        { key: 'category', label: 'Category' },
        { key: 'author', label: 'Author' },
        { key: 'averageRating', label: 'Rating', type: 'number' },
        { key: 'downloadCount', label: 'Downloads', type: 'number' },
      ],

      eventColumns: [
        { key: 'title', label: 'Event Title' },
        { key: 'date', label: 'Date', type: 'date' },
        { key: 'location', label: 'Location' },
        { key: 'currentParticipants', label: 'Participants', type: 'number' },
        { key: 'maxParticipants', label: 'Max Capacity', type: 'number' },
      ],

      // 表格操作
      userActions: [
        { key: 'edit', label: 'Edit', type: 'secondary', handler: this.editUser },
        { key: 'delete', label: 'Delete', type: 'danger', handler: this.deleteUser },
      ],

      resourceActions: [
        { key: 'edit', label: 'Edit', type: 'secondary', handler: this.editResource },
        { key: 'view', label: 'View Stats', type: 'primary', handler: this.viewResourceStats },
      ],

      eventActions: [
        { key: 'edit', label: 'Edit', type: 'secondary', handler: this.editEvent },
        {
          key: 'participants',
          label: 'View Participants',
          type: 'primary',
          handler: this.viewParticipants,
        },
      ],

      recentActivities: [
        {
          id: 1,
          icon: '👤',
          title: 'New User Registration',
          description: 'John Smith registered as a volunteer',
          timestamp: new Date(Date.now() - 5 * 60 * 1000),
          status: 'success',
        },
        {
          id: 2,
          icon: '📚',
          title: 'Resource Updated',
          description: 'Heart Health Guidelines content was updated',
          timestamp: new Date(Date.now() - 15 * 60 * 1000),
          status: 'info',
        },
        {
          id: 3,
          icon: '📧',
          title: 'Bulk Email Sent',
          description: 'Health tips sent to 245 community members',
          timestamp: new Date(Date.now() - 45 * 60 * 1000),
          status: 'success',
        },
        {
          id: 4,
          icon: '🔧',
          title: 'System Maintenance',
          description: 'Database optimization completed',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
          status: 'warning',
        },
      ],

      popularEndpoints: [
        { path: '/api/v1/health-statistics', requests: 89 },
        { path: '/api/v1/community-events', requests: 67 },
        { path: '/api/v1/health-resources', requests: 45 },
        { path: '/api/v1/appointment-slots', requests: 32 },
      ],
    }
  },

  computed: {
    users() {
      return this.globalState.users
    },

    healthResources() {
      return this.globalState.healthResources
    },

    communityEvents() {
      return this.globalState.communityEvents
    },

    apiStats() {
      return this.globalState.apiStats
    },

    adminCount() {
      return this.users.filter((u) => u.role === 'admin').length
    },

    volunteerCount() {
      return this.users.filter((u) => u.role === 'volunteer').length
    },

    regularUserCount() {
      return this.users.filter((u) => u.role === 'user').length
    },

    averageResourceRating() {
      if (this.healthResources.length === 0) return 0
      const total = this.healthResources.reduce((sum, r) => sum + r.averageRating, 0)
      return total / this.healthResources.length
    },

    totalDownloads() {
      return this.healthResources.reduce((sum, r) => sum + (r.downloadCount || 0), 0)
    },

    eventsThisMonth() {
      const thisMonth = new Date().getMonth()
      return this.communityEvents.filter((e) => new Date(e.date).getMonth() === thisMonth).length
    },

    totalAttendees() {
      return this.communityEvents.reduce((sum, e) => sum + (e.currentParticipants || 0), 0)
    },
  },

  methods: {
    // 快速操作方法
    async exportAllData() {
      try {
        // 导出用户数据
        await exportUserList(this.users, 'all_users.pdf')

        // 导出资源报告
        await exportResourcesReport(this.healthResources, 'resources_report.pdf')

        alert('All data exported successfully!')
      } catch (error) {
        console.error('Export failed:', error)
        alert('Export failed. Please try again.')
      }
    },

    async sendBulkHealth() {
      try {
        const recipients = this.users
          .filter((u) => u.role === 'user')
          .map((u) => ({ email: u.email, name: u.name }))

        const healthTip = {
          subject: 'Weekly Health Tip',
          type: 'health_tip',
          message:
            'Remember to take your daily walk and stay hydrated. Regular exercise and proper hydration are key to maintaining good health as we age.',
          dueDate: new Date().toLocaleDateString(),
          actionRequired: 'Practice the health tip this week',
        }

        const result = await sendBulkReminders(recipients, healthTip)
        alert(`Health tips sent to ${result.totalSent} users successfully!`)
      } catch (error) {
        console.error('Bulk email failed:', error)
        alert('Failed to send bulk email.')
      }
    },

    async syncCloudData() {
      try {
        const result = await cloudFunctionsService.syncPatientData({}, Date.now())
        if (result.success) {
          alert('Cloud data synchronized successfully!')
        } else {
          alert('Sync failed: ' + result.message)
        }
      } catch (error) {
        console.error('Sync failed:', error)
        alert('Sync failed. Please try again.')
      }
    },

    generateReports() {
      alert('Report generation feature would create comprehensive analytics reports.')
    },

    // 表格操作方法
    editUser(user) {
      alert(`Edit user: ${user.name}`)
    },

    deleteUser(user) {
      if (confirm(`Are you sure you want to delete user: ${user.name}?`)) {
        const index = this.users.findIndex((u) => u.id === user.id)
        if (index !== -1) {
          this.users.splice(index, 1)
          alert('User deleted successfully!')
        }
      }
    },

    editResource(resource) {
      alert(`Edit resource: ${resource.title}`)
    },

    viewResourceStats(resource) {
      alert(
        `Resource "${resource.title}" has been downloaded ${resource.downloadCount || 0} times with an average rating of ${resource.averageRating}.`,
      )
    },

    editEvent(event) {
      alert(`Edit event: ${event.title}`)
    },

    viewParticipants(event) {
      alert(
        `Event "${event.title}" has ${event.currentParticipants} participants out of ${event.maxParticipants} maximum capacity.`,
      )
    },

    formatTime(timestamp) {
      return new Date(timestamp).toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    },
  },
}
</script>

<style scoped>
.admin-dashboard {
  max-width: 1400px;
  margin: 0 auto;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 30px;
}

.stats-overview {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
}

.stat-card {
  background: white;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: flex-start;
  gap: 16px;
}

.stat-icon {
  font-size: 40px;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 50%;
  flex-shrink: 0;
}

.stat-info {
  flex: 1;
}

.stat-info h3 {
  font-size: 32px;
  font-weight: bold;
  color: #2c3e50;
  margin: 0 0 4px 0;
}

.stat-info p {
  color: #666;
  margin: 0 0 12px 0;
  font-size: 16px;
}

.stat-breakdown {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.stat-breakdown span {
  font-size: 12px;
  color: #888;
}

.quick-actions {
  background: white;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.quick-actions h3 {
  color: #2c3e50;
  margin-bottom: 20px;
}

.action-buttons {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 20px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.3s ease;
}

.action-btn.export {
  background: #28a745;
  color: white;
}

.action-btn.email {
  background: #007bff;
  color: white;
}

.action-btn.sync {
  background: #17a2b8;
  color: white;
}

.action-btn.report {
  background: #6f42c1;
  color: white;
}

.action-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.btn-icon {
  font-size: 18px;
}

.data-management {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.data-management h3 {
  color: #2c3e50;
  margin-bottom: 0;
}

.table-section {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.system-health {
  background: white;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.system-health h3 {
  color: #2c3e50;
  margin-bottom: 20px;
}

.health-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 16px;
}

.health-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
}

.health-status {
  font-size: 20px;
  flex-shrink: 0;
}

.health-info h4 {
  margin: 0 0 4px 0;
  color: #2c3e50;
  font-size: 16px;
}

.health-info p {
  margin: 0 0 4px 0;
  color: #666;
  font-size: 14px;
}

.health-info small {
  color: #888;
  font-size: 12px;
}

.activity-log {
  background: white;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.activity-log h3 {
  color: #2c3e50;
  margin-bottom: 20px;
}

.activity-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.activity-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 8px;
}

.activity-icon {
  font-size: 20px;
  padding: 8px;
  background: white;
  border-radius: 50%;
  flex-shrink: 0;
}

.activity-content {
  flex: 1;
}

.activity-title {
  font-weight: bold;
  color: #2c3e50;
  margin-bottom: 2px;
}

.activity-description {
  color: #666;
  font-size: 14px;
  margin-bottom: 2px;
}

.activity-time {
  color: #888;
  font-size: 12px;
}

.activity-status {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: bold;
  text-transform: uppercase;
}

.activity-status.success {
  background: #d4edda;
  color: #155724;
}

.activity-status.info {
  background: #d1ecf1;
  color: #0c5460;
}

.activity-status.warning {
  background: #fff3cd;
  color: #856404;
}

.api-monitoring {
  background: white;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.api-monitoring h3 {
  color: #2c3e50;
  margin-bottom: 20px;
}

.api-stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
}

.api-stat-item {
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
}

.api-stat-item h4 {
  margin: 0 0 12px 0;
  color: #2c3e50;
}

.endpoint-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.endpoint-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: white;
  border-radius: 4px;
  font-size: 13px;
}

.endpoint-path {
  font-family: monospace;
  color: #2c3e50;
}

.endpoint-count {
  font-weight: bold;
  color: #007bff;
}

.response-times {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.time-stat {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: white;
  border-radius: 4px;
}

.time-value {
  font-weight: bold;
  font-family: monospace;
}

.time-value.good {
  color: #28a745;
}

.time-value.ok {
  color: #ffc107;
}

.time-value.warning {
  color: #dc3545;
}

/* 角色徽章样式 */
.role-badge {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: bold;
  text-transform: uppercase;
}

.role-admin {
  background: #e74c3c;
  color: white;
}

.role-volunteer {
  background: #f39c12;
  color: white;
}

.role-user {
  background: #27ae60;
  color: white;
}

@media (max-width: 768px) {
  .stats-overview {
    grid-template-columns: 1fr;
  }

  .action-buttons {
    grid-template-columns: 1fr;
  }

  .health-grid {
    grid-template-columns: 1fr;
  }

  .api-stats-grid {
    grid-template-columns: 1fr;
  }

  .stat-card {
    flex-direction: column;
    text-align: center;
  }
}
</style>

<template>
  <div class="admin-page">
    <div class="container">
      <!-- 管理员头部 -->
      <div class="admin-header">
        <h1>Administrator Panel</h1>
        <p>Comprehensive system management and oversight</p>
      </div>

      <!-- 选项卡导航 -->
      <div class="admin-tabs">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          class="tab-button"
          :class="{ active: activeTab === tab.id }"
          @click="activeTab = tab.id"
        >
          {{ tab.label }}
        </button>
      </div>

      <!-- 选项卡内容 -->
      <div class="tab-content">
        <!-- 仪表板概览 -->
        <div v-if="activeTab === 'overview'" class="tab-panel">
          <AdminDashboard />
        </div>

        <!-- 用户管理 -->
        <div v-if="activeTab === 'users'" class="tab-panel">
          <div class="panel-header">
            <h2>User Management</h2>
            <button class="btn btn-primary" @click="showAddUserModal = true">Add New User</button>
          </div>

          <div class="users-table">
            <div class="table-header">
              <div class="table-cell">Name</div>
              <div class="table-cell">Email</div>
              <div class="table-cell">Role</div>
              <div class="table-cell">Actions</div>
            </div>
            <div v-for="user in users" :key="user.id" class="table-row">
              <div class="table-cell">{{ user.name }}</div>
              <div class="table-cell">{{ user.email }}</div>
              <div class="table-cell">
                <span class="role-badge" :class="`role-${user.role}`">{{ user.role }}</span>
              </div>
              <div class="table-cell">
                <button class="btn btn-secondary btn-sm" @click="editUser(user)">Edit</button>
                <button class="btn btn-danger btn-sm" @click="deleteUser(user.id)">Delete</button>
              </div>
            </div>
          </div>
        </div>

        <!-- 内容管理 -->
        <div v-if="activeTab === 'content'" class="tab-panel">
          <div class="panel-header">
            <h2>Content Management</h2>
            <button class="btn btn-primary" @click="showAddResourceModal = true">
              Add New Resource
            </button>
          </div>

          <div class="content-grid">
            <div v-for="resource in healthResources" :key="resource.id" class="content-card">
              <div class="content-header">
                <h4>{{ resource.title }}</h4>
                <span class="content-category">{{ resource.category }}</span>
              </div>
              <p class="content-preview">{{ resource.content.substring(0, 100) }}...</p>
              <div class="content-stats">
                <span class="rating">⭐ {{ resource.averageRating.toFixed(1) }}</span>
                <span class="reviews">({{ resource.ratings.length }} reviews)</span>
              </div>
              <div class="content-actions">
                <button class="btn btn-secondary btn-sm" @click="editResource(resource)">
                  Edit
                </button>
                <button class="btn btn-danger btn-sm" @click="deleteResource(resource.id)">
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- 事件管理 -->
        <div v-if="activeTab === 'events'" class="tab-panel">
          <div class="panel-header">
            <h2>Event Management</h2>
            <button class="btn btn-primary" @click="showAddEventModal = true">Add New Event</button>
          </div>

          <div class="events-list">
            <div v-for="event in communityEvents" :key="event.id" class="event-card">
              <div class="event-date">
                {{ formatDate(event.date) }}
              </div>
              <div class="event-details">
                <h4>{{ event.title }}</h4>
                <p>{{ event.description }}</p>
                <p class="event-location">📍 {{ event.location }}</p>
              </div>
              <div class="event-actions">
                <button class="btn btn-secondary btn-sm" @click="editEvent(event)">Edit</button>
                <button class="btn btn-danger btn-sm" @click="deleteEvent(event.id)">Delete</button>
              </div>
            </div>
          </div>
        </div>

        <!-- 系统设置 -->
        <div v-if="activeTab === 'settings'" class="tab-panel">
          <div class="settings-section">
            <h2>System Settings</h2>

            <div class="settings-group">
              <h3>General Settings</h3>
              <div class="setting-item">
                <label class="setting-label">Site Name</label>
                <input type="text" v-model="siteSettings.siteName" class="form-input" />
              </div>
              <div class="setting-item">
                <label class="setting-label">Contact Email</label>
                <input type="email" v-model="siteSettings.contactEmail" class="form-input" />
              </div>
              <div class="setting-item">
                <label class="setting-label">Support Phone</label>
                <input type="tel" v-model="siteSettings.supportPhone" class="form-input" />
              </div>
            </div>

            <div class="settings-group">
              <h3>Security Settings</h3>
              <div class="setting-item">
                <label class="checkbox-label">
                  <input type="checkbox" v-model="siteSettings.requireEmailVerification" />
                  <span>Require email verification for new accounts</span>
                </label>
              </div>
              <div class="setting-item">
                <label class="checkbox-label">
                  <input type="checkbox" v-model="siteSettings.enableTwoFactor" />
                  <span>Enable two-factor authentication</span>
                </label>
              </div>
            </div>

            <div class="settings-actions">
              <button class="btn btn-primary" @click="saveSettings">Save Settings</button>
              <button class="btn btn-secondary" @click="resetSettings">Reset to Default</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 添加用户模态框 -->
    <div v-if="showAddUserModal" class="modal-overlay" @click="showAddUserModal = false">
      <div class="modal-content" @click.stop>
        <h3>Add New User</h3>
        <form @submit.prevent="addUser">
          <div class="form-group">
            <label class="form-label">Name</label>
            <input type="text" v-model="newUser.name" class="form-input" required />
          </div>
          <div class="form-group">
            <label class="form-label">Email</label>
            <input type="email" v-model="newUser.email" class="form-input" required />
          </div>
          <div class="form-group">
            <label class="form-label">Role</label>
            <select v-model="newUser.role" class="form-input" required>
              <option value="user">User</option>
              <option value="volunteer">Volunteer</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div class="modal-actions">
            <button type="submit" class="btn btn-primary">Add User</button>
            <button type="button" class="btn btn-secondary" @click="showAddUserModal = false">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import AdminDashboard from '../components/AdminDashboard.vue'

export default {
  name: 'AdminPage',
  components: {
    AdminDashboard,
  },
  inject: ['globalState'],
  data() {
    return {
      activeTab: 'overview',
      showAddUserModal: false,
      showAddResourceModal: false,
      showAddEventModal: false,
      tabs: [
        { id: 'overview', label: 'Dashboard' },
        { id: 'users', label: 'Users' },
        { id: 'content', label: 'Content' },
        { id: 'events', label: 'Events' },
        { id: 'settings', label: 'Settings' },
      ],
      newUser: {
        name: '',
        email: '',
        role: 'user',
      },
      siteSettings: {
        siteName: 'Elderly Health Charity',
        contactEmail: 'support@elderlyhealth.org',
        supportPhone: '(555) 123-4567',
        requireEmailVerification: true,
        enableTwoFactor: false,
      },
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
  },
  mounted() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'))
    if (!currentUser || currentUser.role !== 'admin') {
      this.$router.push('/dashboard')
    }
  },
  methods: {
    formatDate(dateString) {
      const date = new Date(dateString)
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    },
    addUser() {
      const newUserData = {
        id: this.users.length + 1,
        name: this.newUser.name,
        email: this.newUser.email,
        password: 'defaultpass123',
        role: this.newUser.role,
      }

      this.globalState.users.push(newUserData)

      // 重置表单
      this.newUser = {
        name: '',
        email: '',
        role: 'user',
      }

      this.showAddUserModal = false
      alert('User added successfully!')
    },
    editUser(user) {
      // 这里可以打开编辑用户的模态框
      alert(`Edit user: ${user.name}`)
    },
    deleteUser(userId) {
      if (confirm('Are you sure you want to delete this user?')) {
        const index = this.globalState.users.findIndex((u) => u.id === userId)
        if (index !== -1) {
          this.globalState.users.splice(index, 1)
          alert('User deleted successfully!')
        }
      }
    },
    editResource(resource) {
      alert(`Edit resource: ${resource.title}`)
    },
    deleteResource(resourceId) {
      if (confirm('Are you sure you want to delete this resource?')) {
        const index = this.globalState.healthResources.findIndex((r) => r.id === resourceId)
        if (index !== -1) {
          this.globalState.healthResources.splice(index, 1)
          alert('Resource deleted successfully!')
        }
      }
    },
    editEvent(event) {
      alert(`Edit event: ${event.title}`)
    },
    deleteEvent(eventId) {
      if (confirm('Are you sure you want to delete this event?')) {
        const index = this.globalState.communityEvents.findIndex((e) => e.id === eventId)
        if (index !== -1) {
          this.globalState.communityEvents.splice(index, 1)
          alert('Event deleted successfully!')
        }
      }
    },
    saveSettings() {
      // 保存设置到localStorage
      localStorage.setItem('siteSettings', JSON.stringify(this.siteSettings))
      alert('Settings saved successfully!')
    },
    resetSettings() {
      this.siteSettings = {
        siteName: 'Elderly Health Charity',
        contactEmail: 'support@elderlyhealth.org',
        supportPhone: '(555) 123-4567',
        requireEmailVerification: true,
        enableTwoFactor: false,
      }
      alert('Settings reset to default!')
    },
  },
}
</script>

<style scoped>
.admin-page {
  padding: 40px 0;
}

.admin-header {
  text-align: center;
  margin-bottom: 40px;
}

.admin-header h1 {
  font-size: 36px;
  color: #2c3e50;
  margin-bottom: 10px;
}

.admin-header p {
  font-size: 16px;
  color: #666;
}

/* 选项卡 */
.admin-tabs {
  display: flex;
  justify-content: center;
  margin-bottom: 40px;
  border-bottom: 2px solid #eee;
}

.tab-button {
  padding: 15px 30px;
  border: none;
  background: none;
  font-size: 16px;
  color: #666;
  cursor: pointer;
  border-bottom: 3px solid transparent;
  transition: all 0.3s ease;
}

.tab-button:hover {
  color: #3498db;
}

.tab-button.active {
  color: #3498db;
  border-bottom-color: #3498db;
  font-weight: bold;
}

.tab-content {
  min-height: 500px;
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

/* 面板头部 */
.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.panel-header h2 {
  color: #2c3e50;
  font-size: 24px;
}

/* 用户表格 */
.users-table {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.table-header {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr;
  background-color: #f8f9fa;
  padding: 20px;
  font-weight: bold;
  color: #2c3e50;
}

.table-row {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr;
  padding: 20px;
  border-bottom: 1px solid #eee;
  align-items: center;
}

.table-row:last-child {
  border-bottom: none;
}

.table-cell {
  display: flex;
  align-items: center;
  gap: 10px;
}

.role-badge {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: bold;
  text-transform: uppercase;
}

.role-admin {
  background-color: #e74c3c;
  color: white;
}

.role-volunteer {
  background-color: #f39c12;
  color: white;
}

.role-user {
  background-color: #27ae60;
  color: white;
}

/* 内容网格 */
.content-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.content-card {
  background: white;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.content-header {
  margin-bottom: 15px;
}

.content-header h4 {
  color: #2c3e50;
  margin-bottom: 8px;
}

.content-category {
  background-color: #3498db;
  color: white;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: bold;
}

.content-preview {
  color: #666;
  margin-bottom: 15px;
  line-height: 1.5;
}

.content-stats {
  display: flex;
  gap: 10px;
  margin-bottom: 15px;
  font-size: 14px;
}

.rating {
  color: #f39c12;
  font-weight: bold;
}

.reviews {
  color: #666;
}

.content-actions {
  display: flex;
  gap: 10px;
}

/* 事件列表 */
.events-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.event-card {
  background: white;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  display: flex;
  gap: 20px;
  align-items: flex-start;
}

.event-date {
  background-color: #3498db;
  color: white;
  padding: 15px;
  border-radius: 8px;
  text-align: center;
  font-weight: bold;
  min-width: 100px;
}

.event-details {
  flex: 1;
}

.event-details h4 {
  color: #2c3e50;
  margin-bottom: 8px;
}

.event-details p {
  color: #666;
  margin-bottom: 5px;
}

.event-location {
  color: #3498db;
  font-weight: bold;
}

.event-actions {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

/* 设置部分 */
.settings-section {
  max-width: 600px;
  margin: 0 auto;
}

.settings-section h2 {
  color: #2c3e50;
  margin-bottom: 30px;
  text-align: center;
}

.settings-group {
  background: white;
  padding: 30px;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  margin-bottom: 30px;
}

.settings-group h3 {
  color: #2c3e50;
  margin-bottom: 20px;
  font-size: 18px;
}

.setting-item {
  margin-bottom: 20px;
}

.setting-label {
  display: block;
  margin-bottom: 8px;
  font-weight: bold;
  color: #2c3e50;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
}

.settings-actions {
  display: flex;
  justify-content: center;
  gap: 15px;
}

/* 模态框 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  padding: 30px;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  max-width: 400px;
  width: 90%;
}

.modal-content h3 {
  color: #2c3e50;
  margin-bottom: 20px;
  text-align: center;
}

.modal-actions {
  display: flex;
  gap: 10px;
  justify-content: center;
  margin-top: 20px;
}

.btn-sm {
  padding: 6px 12px;
  font-size: 14px;
}

.btn-danger {
  background-color: #e74c3c;
  color: white;
}

.btn-danger:hover {
  background-color: #c0392b;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .admin-tabs {
    flex-wrap: wrap;
    justify-content: flex-start;
  }

  .tab-button {
    padding: 10px 15px;
    font-size: 14px;
  }

  .panel-header {
    flex-direction: column;
    gap: 15px;
    align-items: flex-start;
  }

  .table-header,
  .table-row {
    grid-template-columns: 1fr;
    gap: 10px;
  }

  .table-cell {
    flex-direction: column;
    align-items: flex-start;
  }

  .content-grid {
    grid-template-columns: 1fr;
  }

  .event-card {
    flex-direction: column;
  }

  .event-actions {
    flex-direction: row;
  }
}
</style>

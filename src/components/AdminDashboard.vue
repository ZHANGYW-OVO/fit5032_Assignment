<template>
  <div class="admin-dashboard">
    <!-- 统计卡片 -->
    <div class="stats-cards">
      <div class="stat-card">
        <div class="stat-icon">👥</div>
        <div class="stat-info">
          <h3>{{ users.length }}</h3>
          <p>Total Users</p>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">📚</div>
        <div class="stat-info">
          <h3>{{ healthResources.length }}</h3>
          <p>Health Resources</p>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">🎯</div>
        <div class="stat-info">
          <h3>{{ communityEvents.length }}</h3>
          <p>Community Events</p>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">⭐</div>
        <div class="stat-info">
          <h3>{{ averageRating.toFixed(1) }}</h3>
          <p>Average Rating</p>
        </div>
      </div>
    </div>

    <!-- 管理功能 -->
    <div class="admin-sections">
      <div class="admin-section">
        <h2>User Management</h2>
        <div class="user-list">
          <div v-for="user in users" :key="user.id" class="user-item">
            <div class="user-info">
              <strong>{{ user.name }}</strong>
              <span class="user-email">{{ user.email }}</span>
              <span class="user-role" :class="`role-${user.role}`">{{ user.role }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="admin-section">
        <h2>Health Resources Management</h2>
        <div class="resource-list">
          <div v-for="resource in healthResources" :key="resource.id" class="resource-item">
            <div class="resource-info">
              <strong>{{ resource.title }}</strong>
              <span class="resource-category">{{ resource.category }}</span>
              <div class="resource-rating">
                <span class="stars">{{ '★'.repeat(Math.round(resource.averageRating)) }}</span>
                <span class="rating-value">{{ resource.averageRating.toFixed(1) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="admin-section">
        <h2>System Activity</h2>
        <div class="activity-list">
          <div class="activity-item">
            <div class="activity-time">2 hours ago</div>
            <div class="activity-message">
              New user registered: {{ users[users.length - 1]?.name }}
            </div>
          </div>
          <div class="activity-item">
            <div class="activity-time">5 hours ago</div>
            <div class="activity-message">Health resource updated: Heart Health Guidelines</div>
          </div>
          <div class="activity-item">
            <div class="activity-time">1 day ago</div>
            <div class="activity-message">Community event scheduled: Weekly Health Check</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'AdminDashboard',
  inject: ['globalState'],
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
    averageRating() {
      if (this.healthResources.length === 0) return 0
      const totalRating = this.healthResources.reduce(
        (sum, resource) => sum + resource.averageRating,
        0,
      )
      return totalRating / this.healthResources.length
    },
  },
}
</script>

<style scoped>
.admin-dashboard {
  max-width: 1200px;
  margin: 0 auto;
}

.stats-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 40px;
}

.stat-card {
  background: white;
  padding: 30px;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 20px;
}

.stat-icon {
  font-size: 48px;
}

.stat-info h3 {
  font-size: 32px;
  color: #2c3e50;
  margin-bottom: 5px;
}

.stat-info p {
  color: #666;
  font-size: 14px;
}

.admin-sections {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 30px;
}

.admin-section {
  background: white;
  padding: 30px;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.admin-section h2 {
  color: #2c3e50;
  margin-bottom: 20px;
  font-size: 20px;
}

.user-item,
.resource-item,
.activity-item {
  padding: 15px 0;
  border-bottom: 1px solid #eee;
}

.user-item:last-child,
.resource-item:last-child,
.activity-item:last-child {
  border-bottom: none;
}

.user-info,
.resource-info {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.user-email,
.resource-category {
  color: #666;
  font-size: 14px;
}

.user-role {
  display: inline-block;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: bold;
  text-transform: uppercase;
  width: fit-content;
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

.resource-rating {
  display: flex;
  align-items: center;
  gap: 8px;
}

.stars {
  color: #f39c12;
  font-size: 16px;
}

.rating-value {
  color: #666;
  font-size: 14px;
}

.activity-item {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.activity-time {
  color: #666;
  font-size: 12px;
}

.activity-message {
  color: #2c3e50;
  font-size: 14px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .stats-cards {
    grid-template-columns: repeat(2, 1fr);
  }

  .admin-sections {
    grid-template-columns: 1fr;
  }

  .stat-card {
    padding: 20px;
  }

  .stat-icon {
    font-size: 36px;
  }

  .stat-info h3 {
    font-size: 24px;
  }
}
</style>

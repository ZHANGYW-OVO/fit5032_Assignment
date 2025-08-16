<template>
  <div class="volunteer-dashboard">
    <!-- 志愿者概览 -->
    <div class="volunteer-overview">
      <div class="overview-card">
        <div class="overview-icon">🎯</div>
        <div class="overview-info">
          <h3>My Tasks</h3>
          <p class="overview-number">{{ volunteerTasks.length }}</p>
          <p class="overview-desc">Active assignments</p>
        </div>
      </div>
      <div class="overview-card">
        <div class="overview-icon">👥</div>
        <div class="overview-info">
          <h3>People Helped</h3>
          <p class="overview-number">{{ peopleHelped }}</p>
          <p class="overview-desc">This month</p>
        </div>
      </div>
      <div class="overview-card">
        <div class="overview-icon">⏰</div>
        <div class="overview-info">
          <h3>Hours Volunteered</h3>
          <p class="overview-number">{{ hoursVolunteered }}</p>
          <p class="overview-desc">This month</p>
        </div>
      </div>
    </div>

    <!-- 主要功能区域 -->
    <div class="volunteer-sections">
      <!-- 我的任务 -->
      <div class="volunteer-section">
        <h2>My Current Tasks</h2>
        <div class="task-list">
          <div v-for="task in volunteerTasks" :key="task.id" class="task-item">
            <div class="task-header">
              <h4>{{ task.title }}</h4>
              <span class="task-priority" :class="`priority-${task.priority}`">{{
                task.priority
              }}</span>
            </div>
            <p class="task-description">{{ task.description }}</p>
            <div class="task-footer">
              <span class="task-due">Due: {{ task.dueDate }}</span>
              <button class="btn btn-primary btn-sm" @click="completeTask(task.id)">
                Mark Complete
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 社区活动 -->
      <div class="volunteer-section">
        <h2>Upcoming Community Events</h2>
        <div class="event-list">
          <div v-for="event in communityEvents" :key="event.id" class="event-item">
            <div class="event-date">
              {{ formatDate(event.date) }}
            </div>
            <div class="event-info">
              <h4>{{ event.title }}</h4>
              <p>{{ event.description }}</p>
              <p class="event-location">📍 {{ event.location }}</p>
            </div>
            <button class="btn btn-secondary btn-sm">Register</button>
          </div>
        </div>
      </div>

      <!-- 资源管理 -->
      <div class="volunteer-section">
        <h2>Health Resources</h2>
        <div class="resource-list">
          <div v-for="resource in healthResources" :key="resource.id" class="resource-item">
            <div class="resource-info">
              <h4>{{ resource.title }}</h4>
              <span class="resource-category">{{ resource.category }}</span>
              <div class="resource-rating">
                <span class="stars">{{ '★'.repeat(Math.round(resource.averageRating)) }}</span>
                <span class="rating-value">{{ resource.averageRating.toFixed(1) }}</span>
              </div>
            </div>
            <button class="btn btn-secondary btn-sm">Edit</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'VolunteerDashboard',
  inject: ['globalState'],
  data() {
    return {
      volunteerTasks: [
        {
          id: 1,
          title: 'Health screening coordination',
          description: 'Coordinate weekly health screening appointments for community members',
          priority: 'high',
          dueDate: '2025-07-25',
        },
        {
          id: 2,
          title: 'Nutrition workshop preparation',
          description: 'Prepare materials and setup for nutrition education workshop',
          priority: 'medium',
          dueDate: '2025-07-28',
        },
        {
          id: 3,
          title: 'Community outreach calls',
          description: 'Follow up with elderly community members for wellness check',
          priority: 'low',
          dueDate: '2025-07-30',
        },
      ],
      peopleHelped: 47,
      hoursVolunteered: 32,
    }
  },
  computed: {
    communityEvents() {
      return this.globalState.communityEvents
    },
    healthResources() {
      return this.globalState.healthResources
    },
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
    completeTask(taskId) {
      this.volunteerTasks = this.volunteerTasks.filter((task) => task.id !== taskId)
      // 这里可以添加完成任务的逻辑
    },
  },
}
</script>

<style scoped>
.volunteer-dashboard {
  max-width: 1200px;
  margin: 0 auto;
}

.volunteer-overview {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 40px;
}

.overview-card {
  background: white;
  padding: 30px;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 20px;
}

.overview-icon {
  font-size: 48px;
}

.overview-info h3 {
  color: #2c3e50;
  margin-bottom: 5px;
  font-size: 16px;
}

.overview-number {
  font-size: 32px;
  font-weight: bold;
  color: #3498db;
  margin-bottom: 5px;
}

.overview-desc {
  color: #666;
  font-size: 14px;
}

.volunteer-sections {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 30px;
}

.volunteer-section {
  background: white;
  padding: 30px;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.volunteer-section h2 {
  color: #2c3e50;
  margin-bottom: 20px;
  font-size: 20px;
}

.task-item,
.event-item,
.resource-item {
  padding: 20px 0;
  border-bottom: 1px solid #eee;
}

.task-item:last-child,
.event-item:last-child,
.resource-item:last-child {
  border-bottom: none;
}

.task-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.task-header h4 {
  color: #2c3e50;
  margin: 0;
}

.task-priority {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: bold;
  text-transform: uppercase;
}

.priority-high {
  background-color: #e74c3c;
  color: white;
}

.priority-medium {
  background-color: #f39c12;
  color: white;
}

.priority-low {
  background-color: #27ae60;
  color: white;
}

.task-description {
  color: #666;
  margin-bottom: 15px;
  line-height: 1.5;
}

.task-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.task-due {
  color: #666;
  font-size: 14px;
}

.event-item {
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

.event-info {
  flex: 1;
}

.event-info h4 {
  color: #2c3e50;
  margin-bottom: 8px;
}

.event-info p {
  color: #666;
  margin-bottom: 5px;
}

.event-location {
  color: #3498db;
  font-weight: bold;
}

.resource-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.resource-info h4 {
  color: #2c3e50;
  margin-bottom: 5px;
}

.resource-category {
  color: #666;
  font-size: 14px;
  margin-bottom: 5px;
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

.btn-sm {
  padding: 8px 16px;
  font-size: 14px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .volunteer-overview {
    grid-template-columns: 1fr;
  }

  .volunteer-sections {
    grid-template-columns: 1fr;
  }

  .event-item {
    flex-direction: column;
    align-items: stretch;
  }

  .event-date {
    min-width: auto;
    text-align: left;
  }

  .resource-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;
  }
}
</style>

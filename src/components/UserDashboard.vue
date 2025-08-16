<template>
  <div class="user-dashboard">
    <!-- 个人健康概览 -->
    <div class="health-overview">
      <div class="overview-card">
        <div class="overview-icon">❤️</div>
        <div class="overview-info">
          <h3>Health Score</h3>
          <p class="overview-number">{{ healthScore }}/100</p>
          <p class="overview-desc">Overall wellness</p>
        </div>
      </div>
      <div class="overview-card">
        <div class="overview-icon">📅</div>
        <div class="overview-info">
          <h3>Next Appointment</h3>
          <p class="overview-number">{{ nextAppointment.day }}</p>
          <p class="overview-desc">{{ nextAppointment.type }}</p>
        </div>
      </div>
      <div class="overview-card">
        <div class="overview-icon">📚</div>
        <div class="overview-info">
          <h3>Resources Read</h3>
          <p class="overview-number">{{ resourcesRead }}</p>
          <p class="overview-desc">This month</p>
        </div>
      </div>
    </div>

    <!-- 主要功能区域 -->
    <div class="user-sections">
      <!-- 推荐的健康资源 -->
      <div class="user-section">
        <h2>Recommended Health Resources</h2>
        <div class="resource-list">
          <div v-for="resource in healthResources" :key="resource.id" class="resource-item">
            <div class="resource-info">
              <h4>{{ resource.title }}</h4>
              <p class="resource-content">{{ resource.content.substring(0, 100) }}...</p>
              <span class="resource-category">{{ resource.category }}</span>
              <div class="resource-rating">
                <span class="stars">{{ '★'.repeat(Math.round(resource.averageRating)) }}</span>
                <span class="rating-value">{{ resource.averageRating.toFixed(1) }}</span>
              </div>
            </div>
            <div class="resource-actions">
              <button class="btn btn-primary btn-sm" @click="readResource(resource.id)">
                Read More
              </button>
              <button class="btn btn-secondary btn-sm" @click="showRatingModal(resource)">
                Rate
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 即将到来的社区活动 -->
      <div class="user-section">
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
            <button class="btn btn-primary btn-sm">Join Event</button>
          </div>
        </div>
      </div>

      <!-- 个人健康记录 -->
      <div class="user-section">
        <h2>My Health Records</h2>
        <div class="health-records">
          <div class="record-item">
            <div class="record-date">July 20, 2025</div>
            <div class="record-info">
              <h4>Blood Pressure Check</h4>
              <p>120/80 mmHg - Normal range</p>
            </div>
          </div>
          <div class="record-item">
            <div class="record-date">July 15, 2025</div>
            <div class="record-info">
              <h4>Cholesterol Test</h4>
              <p>180 mg/dL - Within normal limits</p>
            </div>
          </div>
          <div class="record-item">
            <div class="record-date">July 10, 2025</div>
            <div class="record-info">
              <h4>Weight Check</h4>
              <p>72 kg - Stable</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 评分模态框 -->
    <div v-if="showRating" class="modal-overlay" @click="closeRatingModal">
      <div class="modal-content" @click.stop>
        <h3>Rate: {{ selectedResource?.title }}</h3>
        <div class="rating-stars">
          <span
            v-for="star in 5"
            :key="star"
            class="star"
            :class="{ active: star <= userRating }"
            @click="setRating(star)"
          >
            ★
          </span>
        </div>
        <div class="rating-actions">
          <button class="btn btn-primary" @click="submitRating">Submit Rating</button>
          <button class="btn btn-secondary" @click="closeRatingModal">Cancel</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'UserDashboard',
  inject: ['globalState'],
  data() {
    return {
      healthScore: 85,
      nextAppointment: {
        day: 'Jul 25',
        type: 'Health Check',
      },
      resourcesRead: 12,
      showRating: false,
      selectedResource: null,
      userRating: 0,
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
      })
    },
    readResource(resourceId) {
      // 这里可以跳转到详细页面或显示详细内容
      console.log('Reading resource:', resourceId)
    },
    showRatingModal(resource) {
      this.selectedResource = resource
      this.userRating = 0
      this.showRating = true
    },
    closeRatingModal() {
      this.showRating = false
      this.selectedResource = null
      this.userRating = 0
    },
    setRating(rating) {
      this.userRating = rating
    },
    submitRating() {
      if (this.selectedResource && this.userRating > 0) {
        // 添加用户评分到资源
        this.selectedResource.ratings.push(this.userRating)

        // 重新计算平均评分
        const totalRating = this.selectedResource.ratings.reduce((sum, rating) => sum + rating, 0)
        this.selectedResource.averageRating = totalRating / this.selectedResource.ratings.length

        this.closeRatingModal()
      }
    },
  },
}
</script>

<style scoped>
.user-dashboard {
  max-width: 1200px;
  margin: 0 auto;
}

.health-overview {
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
  color: #27ae60;
  margin-bottom: 5px;
}

.overview-desc {
  color: #666;
  font-size: 14px;
}

.user-sections {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 30px;
}

.user-section {
  background: white;
  padding: 30px;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.user-section h2 {
  color: #2c3e50;
  margin-bottom: 20px;
  font-size: 20px;
}

.resource-item,
.event-item,
.record-item {
  padding: 20px 0;
  border-bottom: 1px solid #eee;
}

.resource-item:last-child,
.event-item:last-child,
.record-item:last-child {
  border-bottom: none;
}

.resource-item {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 20px;
}

.resource-info h4 {
  color: #2c3e50;
  margin-bottom: 8px;
}

.resource-content {
  color: #666;
  margin-bottom: 8px;
  line-height: 1.5;
}

.resource-category {
  color: #3498db;
  font-size: 14px;
  font-weight: bold;
  margin-bottom: 8px;
  display: block;
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

.resource-actions {
  display: flex;
  flex-direction: column;
  gap: 10px;
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
  min-width: 80px;
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

.record-item {
  display: flex;
  gap: 20px;
  align-items: flex-start;
}

.record-date {
  color: #666;
  font-size: 14px;
  min-width: 100px;
}

.record-info h4 {
  color: #2c3e50;
  margin-bottom: 5px;
}

.record-info p {
  color: #666;
}

.btn-sm {
  padding: 8px 16px;
  font-size: 14px;
}

/* 模态框样式 */
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
  text-align: center;
  max-width: 400px;
  width: 90%;
}

.modal-content h3 {
  color: #2c3e50;
  margin-bottom: 20px;
}

.rating-stars {
  margin: 20px 0;
}

.star {
  font-size: 32px;
  color: #ddd;
  cursor: pointer;
  margin: 0 5px;
  transition: color 0.2s ease;
}

.star.active {
  color: #f39c12;
}

.star:hover {
  color: #f39c12;
}

.rating-actions {
  display: flex;
  gap: 10px;
  justify-content: center;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .health-overview {
    grid-template-columns: 1fr;
  }

  .user-sections {
    grid-template-columns: 1fr;
  }

  .resource-item {
    flex-direction: column;
    align-items: stretch;
  }

  .resource-actions {
    flex-direction: row;
    justify-content: flex-start;
  }

  .event-item {
    flex-direction: column;
    align-items: stretch;
  }

  .event-date {
    min-width: auto;
    text-align: left;
  }
}
</style>

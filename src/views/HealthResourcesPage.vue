<template>
  <div class="health-resources-page">
    <div class="container">
      <!-- 页面头部 -->
      <div class="page-header">
        <h1>Health Resources</h1>
        <p>Comprehensive health information and resources for elderly care</p>
      </div>

      <!-- 搜索和筛选 -->
      <div class="filters">
        <div class="search-box">
          <input
            type="text"
            v-model="searchQuery"
            placeholder="Search health resources..."
            class="search-input"
          />
        </div>
        <div class="category-filter">
          <label class="filter-label">Category:</label>
          <select v-model="selectedCategory" class="filter-select">
            <option value="">All Categories</option>
            <option value="Heart Health">Heart Health</option>
            <option value="Diabetes">Diabetes</option>
            <option value="Mental Health">Mental Health</option>
          </select>
        </div>
      </div>

      <!-- 资源列表 -->
      <div class="resources-grid">
        <div v-for="resource in filteredResources" :key="resource.id" class="resource-card">
          <div class="resource-header">
            <h3>{{ resource.title }}</h3>
            <span class="resource-category">{{ resource.category }}</span>
          </div>

          <div class="resource-content">
            <p>{{ resource.content }}</p>
          </div>

          <div class="resource-rating">
            <div class="rating-display">
              <span class="stars">{{ '★'.repeat(Math.round(resource.averageRating)) }}</span>
              <span class="rating-value">{{ resource.averageRating.toFixed(1) }}</span>
              <span class="rating-count">({{ resource.ratings.length }} reviews)</span>
            </div>
            <button
              v-if="currentUser"
              class="btn btn-secondary btn-sm"
              @click="showRatingModal(resource)"
            >
              Rate This Resource
            </button>
          </div>
        </div>
      </div>

      <!-- 如果没有找到资源 -->
      <div v-if="filteredResources.length === 0" class="no-resources">
        <div class="no-resources-icon">📚</div>
        <h3>No resources found</h3>
        <p>Try adjusting your search or filter criteria</p>
      </div>
    </div>

    <!-- 评分模态框 -->
    <div v-if="showRating" class="modal-overlay" @click="closeRatingModal">
      <div class="modal-content" @click.stop>
        <h3>Rate: {{ selectedResource?.title }}</h3>
        <p class="modal-description">How helpful was this resource for you?</p>

        <div class="rating-stars">
          <span
            v-for="star in 5"
            :key="star"
            class="star"
            :class="{ active: star <= userRating }"
            @click="setRating(star)"
            @mouseover="hoverRating = star"
            @mouseleave="hoverRating = 0"
          >
            ★
          </span>
        </div>

        <div class="rating-labels">
          <span v-if="userRating === 1">Poor</span>
          <span v-else-if="userRating === 2">Fair</span>
          <span v-else-if="userRating === 3">Good</span>
          <span v-else-if="userRating === 4">Very Good</span>
          <span v-else-if="userRating === 5">Excellent</span>
          <span v-else>Click a star to rate</span>
        </div>

        <div class="rating-actions">
          <button class="btn btn-primary" @click="submitRating" :disabled="userRating === 0">
            Submit Rating
          </button>
          <button class="btn btn-secondary" @click="closeRatingModal">Cancel</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'HealthResourcesPage',
  inject: ['globalState'],
  data() {
    return {
      searchQuery: '',
      selectedCategory: '',
      showRating: false,
      selectedResource: null,
      userRating: 0,
      hoverRating: 0,
      currentUser: null,
    }
  },
  computed: {
    filteredResources() {
      let resources = this.globalState.healthResources

      // 按搜索查询筛选
      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase()
        resources = resources.filter(
          (resource) =>
            resource.title.toLowerCase().includes(query) ||
            resource.content.toLowerCase().includes(query) ||
            resource.category.toLowerCase().includes(query),
        )
      }

      // 按类别筛选
      if (this.selectedCategory) {
        resources = resources.filter((resource) => resource.category === this.selectedCategory)
      }

      return resources
    },
  },
  mounted() {
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'))
  },
  methods: {
    showRatingModal(resource) {
      if (!this.currentUser) {
        this.$router.push('/login')
        return
      }

      this.selectedResource = resource
      this.userRating = 0
      this.hoverRating = 0
      this.showRating = true
    },
    closeRatingModal() {
      this.showRating = false
      this.selectedResource = null
      this.userRating = 0
      this.hoverRating = 0
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

        // 显示成功消息
        alert('Thank you for your rating!')
      }
    },
  },
}
</script>

<style scoped>
.health-resources-page {
  padding: 40px 0;
}

.page-header {
  text-align: center;
  margin-bottom: 50px;
}

.page-header h1 {
  font-size: 42px;
  color: #2c3e50;
  margin-bottom: 10px;
}

.page-header p {
  font-size: 18px;
  color: #666;
}

.filters {
  display: flex;
  gap: 30px;
  margin-bottom: 40px;
  flex-wrap: wrap;
}

.search-box {
  flex: 1;
  min-width: 300px;
}

.search-input {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #ddd;
  border-radius: 8px;
  font-size: 16px;
  transition: border-color 0.3s ease;
}

.search-input:focus {
  outline: none;
  border-color: #3498db;
}

.category-filter {
  display: flex;
  align-items: center;
  gap: 10px;
}

.filter-label {
  font-weight: bold;
  color: #2c3e50;
}

.filter-select {
  padding: 12px 16px;
  border: 2px solid #ddd;
  border-radius: 8px;
  font-size: 16px;
  background-color: white;
}

.resources-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 30px;
  margin-bottom: 40px;
}

.resource-card {
  background: white;
  border-radius: 12px;
  padding: 30px;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.1);
  transition:
    transform 0.3s ease,
    box-shadow 0.3s ease;
}

.resource-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
}

.resource-header {
  margin-bottom: 20px;
}

.resource-header h3 {
  color: #2c3e50;
  font-size: 22px;
  margin-bottom: 8px;
}

.resource-category {
  background-color: #3498db;
  color: white;
  padding: 6px 12px;
  border-radius: 16px;
  font-size: 12px;
  font-weight: bold;
  text-transform: uppercase;
}

.resource-content {
  margin-bottom: 25px;
}

.resource-content p {
  color: #666;
  line-height: 1.6;
  font-size: 16px;
}

.resource-rating {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 15px;
}

.rating-display {
  display: flex;
  align-items: center;
  gap: 8px;
}

.stars {
  color: #f39c12;
  font-size: 20px;
}

.rating-value {
  font-weight: bold;
  color: #2c3e50;
  font-size: 16px;
}

.rating-count {
  color: #666;
  font-size: 14px;
}

.no-resources {
  text-align: center;
  padding: 60px 20px;
  color: #666;
}

.no-resources-icon {
  font-size: 80px;
  margin-bottom: 20px;
}

.no-resources h3 {
  font-size: 24px;
  margin-bottom: 10px;
  color: #2c3e50;
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
  padding: 40px;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  text-align: center;
  max-width: 450px;
  width: 90%;
}

.modal-content h3 {
  color: #2c3e50;
  margin-bottom: 10px;
  font-size: 22px;
}

.modal-description {
  color: #666;
  margin-bottom: 30px;
}

.rating-stars {
  margin: 30px 0;
}

.star {
  font-size: 48px;
  color: #ddd;
  cursor: pointer;
  margin: 0 8px;
  transition:
    color 0.2s ease,
    transform 0.2s ease;
}

.star.active {
  color: #f39c12;
}

.star:hover {
  color: #f39c12;
  transform: scale(1.1);
}

.rating-labels {
  margin-bottom: 30px;
  height: 24px;
  font-size: 16px;
  font-weight: bold;
  color: #3498db;
}

.rating-actions {
  display: flex;
  gap: 15px;
  justify-content: center;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-sm {
  padding: 8px 16px;
  font-size: 14px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .page-header h1 {
    font-size: 32px;
  }

  .filters {
    flex-direction: column;
    gap: 20px;
  }

  .search-box {
    min-width: auto;
  }

  .category-filter {
    flex-direction: column;
    align-items: flex-start;
  }

  .resources-grid {
    grid-template-columns: 1fr;
  }

  .resource-rating {
    flex-direction: column;
    align-items: flex-start;
  }

  .modal-content {
    padding: 30px 20px;
  }

  .star {
    font-size: 36px;
    margin: 0 5px;
  }

  .rating-actions {
    flex-direction: column;
  }
}
</style>

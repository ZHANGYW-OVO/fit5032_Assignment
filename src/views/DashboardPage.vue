<template>
  <div class="dashboard-page">
    <div class="container">
      <div class="dashboard-header">
        <h1>Welcome, {{ currentUser?.name }}!</h1>
        <p class="role-badge" :class="`role-${currentUser?.role}`">
          {{ getRoleLabel(currentUser?.role) }}
        </p>
      </div>

      <!-- 根据用户角色显示不同的仪表板 -->
      <AdminDashboard v-if="currentUser?.role === 'admin'" />
      <VolunteerDashboard v-else-if="currentUser?.role === 'volunteer'" />
      <UserDashboard v-else />
    </div>
  </div>
</template>

<script>
import { authStore } from '../stores/auth.js'
import AdminDashboard from '../components/AdminDashboard.vue'
import VolunteerDashboard from '../components/VolunteerDashboard.vue'
import UserDashboard from '../components/UserDashboard.vue'

export default {
  name: 'DashboardPage',
  components: {
    AdminDashboard,
    VolunteerDashboard,
    UserDashboard,
  },
  data() {
    return {
      currentUser: null,
    }
  },
  mounted() {
    // 使用 authStore 检查用户登录状态
    this.currentUser = authStore.getCurrentUser()

    if (!this.currentUser) {
      this.$router.push('/login')
    }
  },
  methods: {
    getRoleLabel(role) {
      const roleLabels = {
        admin: 'Administrator',
        volunteer: 'Volunteer',
        user: 'Community Member',
      }
      return roleLabels[role] || 'User'
    },
  },
}
</script>

<style scoped>
.dashboard-page {
  padding: 40px 0;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.dashboard-header {
  text-align: center;
  margin-bottom: 40px;
}

.dashboard-header h1 {
  font-size: 36px;
  color: #2c3e50;
  margin-bottom: 10px;
}

.role-badge {
  display: inline-block;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 14px;
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

/* 响应式设计 */
@media (max-width: 768px) {
  .dashboard-header h1 {
    font-size: 28px;
  }

  .dashboard-page {
    padding: 20px 0;
  }
}
</style>

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

// 全局状态管理
const globalState = {
  currentUser: null,
  users: [
    { id: 1, email: 'admin@charity.com', password: 'admin123', role: 'admin', name: 'Admin User' },
    {
      id: 2,
      email: 'volunteer@charity.com',
      password: 'volunteer123',
      role: 'volunteer',
      name: 'Volunteer User',
    },
    { id: 3, email: 'user@charity.com', password: 'user123', role: 'user', name: 'Regular User' },
  ],
  healthResources: [
    {
      id: 1,
      title: 'Heart Health Guidelines',
      content: 'Important information about maintaining heart health in elderly years.',
      category: 'Heart Health',
      ratings: [4, 5, 4, 5, 4],
      averageRating: 4.4,
    },
    {
      id: 2,
      title: 'Diabetes Management',
      content: 'Comprehensive guide for managing diabetes in senior adults.',
      category: 'Diabetes',
      ratings: [5, 4, 5, 4, 5],
      averageRating: 4.6,
    },
    {
      id: 3,
      title: 'Mental Health Support',
      content: 'Resources and support for mental health challenges in elderly populations.',
      category: 'Mental Health',
      ratings: [4, 4, 5, 4, 4],
      averageRating: 4.2,
    },
  ],
  communityEvents: [
    {
      id: 1,
      title: 'Weekly Health Check',
      date: '2025-07-25',
      description: 'Free health screening for community members',
      location: 'Community Center',
    },
    {
      id: 2,
      title: 'Nutrition Workshop',
      date: '2025-07-28',
      description: 'Learn about healthy eating for seniors',
      location: 'Health Center',
    },
  ],
}

const app = createApp(App)

// 提供全局状态
app.provide('globalState', globalState)

app.use(router)
app.mount('#app')

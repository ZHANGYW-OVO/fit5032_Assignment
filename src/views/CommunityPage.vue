<template>
  <div class="community-page">
    <div class="container">
      <!-- 页面头部 -->
      <div class="page-header">
        <h1>Community & Events</h1>
        <p>Connect with others and participate in community activities</p>
      </div>

      <!-- 即将到来的活动 -->
      <section class="upcoming-events">
        <h2 class="section-title">Upcoming Events</h2>
        <div class="events-grid">
          <div v-for="event in communityEvents" :key="event.id" class="event-card">
            <div class="event-date">
              <div class="event-month">{{ getMonth(event.date) }}</div>
              <div class="event-day">{{ getDay(event.date) }}</div>
            </div>
            <div class="event-details">
              <h3>{{ event.title }}</h3>
              <p class="event-description">{{ event.description }}</p>
              <div class="event-info">
                <span class="event-location">📍 {{ event.location }}</span>
                <span class="event-time">🕐 {{ formatEventTime(event.date) }}</span>
              </div>
            </div>
            <div class="event-actions">
              <button
                class="btn btn-primary"
                @click="registerForEvent(event.id)"
                :disabled="isRegistered(event.id)"
              >
                {{ isRegistered(event.id) ? 'Registered' : 'Register' }}
              </button>
            </div>
          </div>
        </div>
      </section>

      <!-- 社区论坛 -->
      <section class="community-forum">
        <h2 class="section-title">Community Forum</h2>

        <!-- 发布新话题 -->
        <div v-if="currentUser" class="new-post-form">
          <h3>Start a New Discussion</h3>
          <form @submit.prevent="submitPost">
            <div class="form-group">
              <input
                type="text"
                v-model="newPost.title"
                placeholder="Discussion title..."
                class="form-input"
                maxlength="100"
              />
            </div>
            <div class="form-group">
              <textarea
                v-model="newPost.content"
                placeholder="Share your thoughts, ask questions, or start a discussion..."
                class="form-textarea"
                rows="4"
                maxlength="500"
              ></textarea>
            </div>
            <button type="submit" class="btn btn-primary" :disabled="!canSubmitPost">
              Post Discussion
            </button>
          </form>
        </div>

        <!-- 讨论列表 -->
        <div class="discussions">
          <div v-for="discussion in discussions" :key="discussion.id" class="discussion-item">
            <div class="discussion-header">
              <h4>{{ discussion.title }}</h4>
              <div class="discussion-meta">
                <span class="author">By {{ discussion.author }}</span>
                <span class="date">{{ formatDate(discussion.date) }}</span>
              </div>
            </div>
            <p class="discussion-content">{{ discussion.content }}</p>
            <div class="discussion-stats">
              <span class="replies">💬 {{ discussion.replies }} replies</span>
              <span class="likes">❤️ {{ discussion.likes }} likes</span>
              <button
                class="btn btn-secondary btn-sm"
                @click="likeDiscussion(discussion.id)"
                :disabled="!currentUser"
              >
                {{ hasLiked(discussion.id) ? 'Liked' : 'Like' }}
              </button>
            </div>
          </div>
        </div>
      </section>

      <!-- 社区指导 -->
      <section class="community-guidelines">
        <h2 class="section-title">Community Guidelines</h2>
        <div class="guidelines-card">
          <div class="guideline-item">
            <div class="guideline-icon">🤝</div>
            <div class="guideline-content">
              <h4>Be Respectful</h4>
              <p>Treat all community members with kindness and respect</p>
            </div>
          </div>
          <div class="guideline-item">
            <div class="guideline-icon">💬</div>
            <div class="guideline-content">
              <h4>Stay On Topic</h4>
              <p>Keep discussions relevant to health and community topics</p>
            </div>
          </div>
          <div class="guideline-item">
            <div class="guideline-icon">🔒</div>
            <div class="guideline-content">
              <h4>Protect Privacy</h4>
              <p>Don't share personal medical information or private details</p>
            </div>
          </div>
          <div class="guideline-item">
            <div class="guideline-icon">✨</div>
            <div class="guideline-content">
              <h4>Be Supportive</h4>
              <p>Offer encouragement and support to fellow community members</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script>
import { authStore } from '../stores/auth.js'

export default {
  name: 'CommunityPage',
  inject: ['globalState'],
  data() {
    return {
      currentUser: null,
      registeredEvents: [],
      likedDiscussions: [],
      newPost: {
        title: '',
        content: '',
      },
      discussions: [
        {
          id: 1,
          title: 'Tips for Managing Blood Pressure',
          content:
            "I've been working on managing my blood pressure naturally. What methods have worked for you?",
          author: 'Sarah M.',
          date: '2025-07-22',
          replies: 15,
          likes: 23,
        },
        {
          id: 2,
          title: 'Exercise Routines for Seniors',
          content:
            'Looking for gentle exercise routines that are safe and effective for seniors. Any recommendations?',
          author: 'John D.',
          date: '2025-07-21',
          replies: 8,
          likes: 17,
        },
        {
          id: 3,
          title: 'Healthy Recipe Sharing',
          content:
            "Let's share our favorite healthy recipes that are easy to prepare and senior-friendly!",
          author: 'Mary K.',
          date: '2025-07-20',
          replies: 22,
          likes: 31,
        },
        {
          id: 4,
          title: 'Medication Management Tips',
          content:
            'How do you keep track of multiple medications? Looking for practical organization tips.',
          author: 'Robert L.',
          date: '2025-07-19',
          replies: 12,
          likes: 19,
        },
      ],
    }
  },
  computed: {
    communityEvents() {
      return this.globalState.communityEvents
    },
    canSubmitPost() {
      return this.newPost.title.trim() && this.newPost.content.trim()
    },
  },
  mounted() {
    this.currentUser = authStore.getCurrentUser()
    this.loadUserData()

    window.addEventListener('user-login', this.handleUserLogin)
    window.addEventListener('user-logout', this.handleUserLogout)
  },
  beforeUnmount() {
    window.removeEventListener('user-login', this.handleUserLogin)
    window.removeEventListener('user-logout', this.handleUserLogout)
  },
  methods: {
    loadUserData() {
      console.log('Loading user data. Current user:', this.currentUser)

      if (this.currentUser) {
        const userDataKey = `userData_${this.currentUser.id}`
        const userData = JSON.parse(localStorage.getItem(userDataKey) || '{}')

        this.registeredEvents = userData.registeredEvents || []
        this.likedDiscussions = userData.likedDiscussions || []

        console.log(`Loaded data for user ${this.currentUser.id}:`, {
          registeredEvents: this.registeredEvents,
          likedDiscussions: this.likedDiscussions,
        })
      } else {
        this.registeredEvents = []
        this.likedDiscussions = []
        console.log('No user logged in, cleared all data')
      }
    },
    saveUserData() {
      if (this.currentUser) {
        const userDataKey = `userData_${this.currentUser.id}`
        const userData = {
          registeredEvents: this.registeredEvents,
          likedDiscussions: this.likedDiscussions,
        }
        localStorage.setItem(userDataKey, JSON.stringify(userData))
        console.log(`Saved data for user ${this.currentUser.id}:`, userData)
      }
    },
    handleUserLogin(event) {
      this.currentUser = event.detail || authStore.getCurrentUser()
      console.log('User logged in:', this.currentUser)
      this.loadUserData()
    },
    handleUserLogout() {
      console.log('User logged out')
      this.currentUser = null
      this.loadUserData()
    },
    getMonth(dateString) {
      const date = new Date(dateString)
      return date.toLocaleDateString('en-US', { month: 'short' }).toUpperCase()
    },
    getDay(dateString) {
      const date = new Date(dateString)
      return date.getDate()
    },
    formatEventTime(dateString) {
      const date = new Date(dateString)
      return date.toLocaleDateString('en-US', {
        weekday: 'long',
        hour: '2-digit',
        minute: '2-digit',
      })
    },
    formatDate(dateString) {
      const date = new Date(dateString)
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    },
    registerForEvent(eventId) {
      console.log('Register for event:', eventId, 'Current user:', this.currentUser)

      if (!this.currentUser) {
        alert('Please login to register for events.')
        this.$router.push('/login')
        return
      }

      if (!this.registeredEvents.includes(eventId)) {
        this.registeredEvents.push(eventId)
        this.saveUserData()
        console.log('Event registered. User events:', this.registeredEvents)
        alert('Successfully registered for the event!')
      } else {
        alert('You are already registered for this event.')
      }
    },
    isRegistered(eventId) {
      if (!this.currentUser) {
        console.log(`Event ${eventId}: No user logged in, showing as not registered`)
        return false
      }

      const isReg = this.registeredEvents.includes(eventId)
      console.log(
        `Event ${eventId} registration status for user ${this.currentUser.id}:`,
        isReg,
        'Registered events:',
        this.registeredEvents,
      )
      return isReg
    },
    submitPost() {
      if (!this.canSubmitPost) return

      const newDiscussion = {
        id: this.discussions.length + 1,
        title: this.newPost.title.trim(),
        content: this.newPost.content.trim(),
        author: this.currentUser.name,
        date: new Date().toISOString().split('T')[0],
        replies: 0,
        likes: 0,
      }

      this.discussions.unshift(newDiscussion)

      this.newPost.title = ''
      this.newPost.content = ''

      alert('Your discussion has been posted!')
    },
    likeDiscussion(discussionId) {
      if (!this.currentUser) {
        alert('Please login to like discussions.')
        this.$router.push('/login')
        return
      }

      const discussion = this.discussions.find((d) => d.id === discussionId)
      if (discussion && !this.hasLiked(discussionId)) {
        discussion.likes++
        this.likedDiscussions.push(discussionId)
        this.saveUserData()
        console.log('Discussion liked. User liked discussions:', this.likedDiscussions)
      }
    },
    hasLiked(discussionId) {
      if (!this.currentUser) {
        return false
      }

      const hasLiked = this.likedDiscussions.includes(discussionId)
      console.log(
        `Discussion ${discussionId} like status for user ${this.currentUser.id}:`,
        hasLiked,
      )
      return hasLiked
    },
  },
}
</script>

<style scoped>
.community-page {
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

.section-title {
  font-size: 28px;
  color: #2c3e50;
  margin-bottom: 30px;
  text-align: center;
}

/* 活动部分 */
.upcoming-events {
  margin-bottom: 60px;
}

.events-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 30px;
}

.event-card {
  background: white;
  border-radius: 12px;
  padding: 30px;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.1);
  display: flex;
  gap: 20px;
  align-items: flex-start;
  transition: transform 0.3s ease;
}

.event-card:hover {
  transform: translateY(-3px);
}

.event-date {
  background: linear-gradient(135deg, #3498db, #2980b9);
  color: white;
  padding: 20px;
  border-radius: 12px;
  text-align: center;
  min-width: 80px;
}

.event-month {
  font-size: 14px;
  font-weight: bold;
}

.event-day {
  font-size: 32px;
  font-weight: bold;
  margin-top: 5px;
}

.event-details {
  flex: 1;
}

.event-details h3 {
  color: #2c3e50;
  margin-bottom: 10px;
  font-size: 20px;
}

.event-description {
  color: #666;
  margin-bottom: 15px;
  line-height: 1.5;
}

.event-info {
  display: flex;
  flex-direction: column;
  gap: 5px;
  margin-bottom: 15px;
}

.event-location,
.event-time {
  color: #3498db;
  font-size: 14px;
}

.event-actions {
  display: flex;
  align-items: center;
}

/* 社区论坛部分 */
.community-forum {
  margin-bottom: 60px;
}

.new-post-form {
  background: white;
  padding: 30px;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  margin-bottom: 40px;
}

.new-post-form h3 {
  color: #2c3e50;
  margin-bottom: 20px;
}

.form-textarea {
  width: 100%;
  padding: 12px;
  border: 2px solid #ddd;
  border-radius: 6px;
  font-size: 16px;
  font-family: inherit;
  resize: vertical;
}

.form-textarea:focus {
  outline: none;
  border-color: #3498db;
}

.discussions {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.discussion-item {
  background: white;
  padding: 30px;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.discussion-header {
  margin-bottom: 15px;
}

.discussion-header h4 {
  color: #2c3e50;
  margin-bottom: 8px;
  font-size: 18px;
}

.discussion-meta {
  display: flex;
  gap: 15px;
  font-size: 14px;
  color: #666;
}

.discussion-content {
  color: #666;
  line-height: 1.6;
  margin-bottom: 20px;
}

.discussion-stats {
  display: flex;
  align-items: center;
  gap: 20px;
  padding-top: 15px;
  border-top: 1px solid #eee;
}

.replies,
.likes {
  color: #666;
  font-size: 14px;
}

/* 社区指导部分 */
.community-guidelines {
  margin-bottom: 40px;
}

.guidelines-card {
  background: white;
  padding: 40px;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 30px;
}

.guideline-item {
  display: flex;
  align-items: flex-start;
  gap: 15px;
}

.guideline-icon {
  font-size: 32px;
  flex-shrink: 0;
}

.guideline-content h4 {
  color: #2c3e50;
  margin-bottom: 8px;
  font-size: 16px;
}

.guideline-content p {
  color: #666;
  line-height: 1.5;
  font-size: 14px;
}

.btn-sm {
  padding: 6px 12px;
  font-size: 14px;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .page-header h1 {
    font-size: 32px;
  }

  .section-title {
    font-size: 24px;
  }

  .events-grid {
    grid-template-columns: 1fr;
  }

  .event-card {
    flex-direction: column;
    text-align: center;
  }

  .event-date {
    align-self: center;
  }

  .discussion-meta {
    flex-direction: column;
    gap: 8px;
  }

  .discussion-stats {
    flex-wrap: wrap;
  }

  .guidelines-card {
    grid-template-columns: 1fr;
    padding: 30px 20px;
  }
}
</style>

<template>
  <div class="home">
    <!-- Hero Section -->
    <section class="hero">
      <div class="hero-content">
        <h1 class="hero-title">Supporting Elderly Health & Wellbeing</h1>
        <p class="hero-subtitle">
          Dedicated to improving the health and well-being of elderly communities through accessible
          resources, support, and innovative care solutions.
        </p>
        <div class="hero-buttons">
          <router-link to="/health-resources" class="btn btn-primary"
            >Explore Resources</router-link
          >
          <router-link to="/support" class="btn btn-secondary">Get Support</router-link>
        </div>
      </div>
    </section>

    <!-- Services Section -->
    <section class="services">
      <div class="container">
        <h2 class="section-title">Our Services</h2>
        <div class="services-grid">
          <div class="service-card">
            <div class="service-icon">🏥</div>
            <h3>Health Resources</h3>
            <p>
              Access comprehensive health information, guidelines, and educational materials
              specifically designed for elderly care.
            </p>
            <router-link to="/health-resources" class="service-link">Learn More</router-link>
          </div>

          <div class="service-card">
            <div class="service-icon">👥</div>
            <h3>Community Support</h3>
            <p>
              Connect with others in your community, participate in events, and build meaningful
              relationships.
            </p>
            <router-link to="/community" class="service-link">Join Community</router-link>
          </div>

          <div class="service-card">
            <div class="service-icon">📞</div>
            <h3>24/7 Support</h3>
            <p>
              Get help when you need it most with our dedicated support team available around the
              clock.
            </p>
            <router-link to="/support" class="service-link">Contact Support</router-link>
          </div>
        </div>
      </div>
    </section>

    <!-- Stats Section -->
    <section class="stats">
      <div class="container">
        <div class="stats-grid">
          <div class="stat-item">
            <div class="stat-number">10,000+</div>
            <div class="stat-label">People Helped</div>
          </div>
          <div class="stat-item">
            <div class="stat-number">500+</div>
            <div class="stat-label">Health Resources</div>
          </div>
          <div class="stat-item">
            <div class="stat-number">50+</div>
            <div class="stat-label">Community Events</div>
          </div>
          <div class="stat-item">
            <div class="stat-number">24/7</div>
            <div class="stat-label">Support Available</div>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="cta">
      <div class="container">
        <div class="cta-content">
          <h2>Ready to Get Started?</h2>
          <p>Join our community today and access the support and resources you need.</p>
          <router-link v-if="!currentUser" to="/register" class="btn btn-primary large"
            >Join Now</router-link
          >
          <router-link v-else to="/dashboard" class="btn btn-primary large"
            >Go to Dashboard</router-link
          >
        </div>
      </div>
    </section>
  </div>
</template>

<script>
export default {
  name: 'HomePage',
  data() {
    return {
      currentUser: null,
    }
  },
  mounted() {
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'))
  },
}
</script>

<style scoped>
.hero {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 100px 0;
  text-align: center;
}

.hero-content {
  max-width: 800px;
  margin: 0 auto;
  padding: 0 20px;
}

.hero-title {
  font-size: 48px;
  margin-bottom: 20px;
  font-weight: bold;
}

.hero-subtitle {
  font-size: 20px;
  margin-bottom: 40px;
  line-height: 1.6;
}

.hero-buttons {
  display: flex;
  justify-content: center;
  gap: 20px;
  flex-wrap: wrap;
}

.services {
  padding: 80px 0;
  background-color: white;
}

.section-title {
  text-align: center;
  font-size: 36px;
  margin-bottom: 60px;
  color: #2c3e50;
}

.services-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 40px;
}

.service-card {
  text-align: center;
  padding: 40px 20px;
  border-radius: 12px;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;
}

.service-card:hover {
  transform: translateY(-5px);
}

.service-icon {
  font-size: 60px;
  margin-bottom: 20px;
}

.service-card h3 {
  font-size: 24px;
  margin-bottom: 16px;
  color: #2c3e50;
}

.service-card p {
  font-size: 16px;
  line-height: 1.6;
  margin-bottom: 24px;
  color: #666;
}

.service-link {
  color: #3498db;
  text-decoration: none;
  font-weight: bold;
  font-size: 16px;
}

.service-link:hover {
  color: #2980b9;
}

.stats {
  background-color: #f8f9fa;
  padding: 60px 0;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 40px;
  text-align: center;
}

.stat-number {
  font-size: 48px;
  font-weight: bold;
  color: #3498db;
  margin-bottom: 8px;
}

.stat-label {
  font-size: 18px;
  color: #666;
}

.cta {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 80px 0;
  text-align: center;
}

.cta-content h2 {
  font-size: 36px;
  margin-bottom: 20px;
}

.cta-content p {
  font-size: 18px;
  margin-bottom: 40px;
}

.btn.large {
  padding: 16px 32px;
  font-size: 18px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .hero-title {
    font-size: 32px;
  }

  .hero-subtitle {
    font-size: 18px;
  }

  .hero-buttons {
    flex-direction: column;
    align-items: center;
  }

  .section-title {
    font-size: 28px;
  }

  .services-grid {
    grid-template-columns: 1fr;
  }

  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .stat-number {
    font-size: 36px;
  }

  .cta-content h2 {
    font-size: 28px;
  }
}
</style>

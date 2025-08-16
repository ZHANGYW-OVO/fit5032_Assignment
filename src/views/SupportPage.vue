<template>
  <div class="support-page">
    <div class="container">
      <!-- 页面头部 -->
      <div class="page-header">
        <h1>Support & Contact</h1>
        <p>We're here to help you with any questions or concerns</p>
      </div>

      <!-- 紧急联系方式 -->
      <section class="emergency-contact">
        <div class="emergency-card">
          <div class="emergency-icon">🚨</div>
          <div class="emergency-content">
            <h2>Emergency Contact</h2>
            <p>If you have a medical emergency, please call:</p>
            <div class="emergency-numbers">
              <div class="emergency-number">
                <strong>Emergency Services: 911</strong>
              </div>
              <div class="emergency-number">
                <strong>24/7 Health Hotline: 1-800-HEALTH-1</strong>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- 联系方式 -->
      <section class="contact-methods">
        <h2 class="section-title">Get in Touch</h2>
        <div class="contact-grid">
          <div class="contact-card">
            <div class="contact-icon">📞</div>
            <h3>Phone Support</h3>
            <p>
              Monday - Friday: 8:00 AM - 6:00 PM<br />
              Saturday: 9:00 AM - 4:00 PM
            </p>
            <div class="contact-info">
              <strong>(555) 123-4567</strong>
            </div>
          </div>

          <div class="contact-card">
            <div class="contact-icon">✉️</div>
            <h3>Email Support</h3>
            <p>Send us your questions and we'll respond within 24 hours</p>
            <div class="contact-info">
              <strong>support@elderlyhealth.org</strong>
            </div>
          </div>

          <div class="contact-card">
            <div class="contact-icon">💬</div>
            <h3>Live Chat</h3>
            <p>Available during business hours for immediate assistance</p>
            <button class="btn btn-primary" @click="startLiveChat">Start Chat</button>
          </div>

          <div class="contact-card">
            <div class="contact-icon">📍</div>
            <h3>Visit Us</h3>
            <p>
              123 Health Street<br />
              Los Angeles, CA 90210
            </p>
            <div class="contact-info">
              <strong>Open Mon-Fri 9AM-5PM</strong>
            </div>
          </div>
        </div>
      </section>

      <!-- 联系表单 -->
      <section class="contact-form-section">
        <h2 class="section-title">Send Us a Message</h2>
        <div class="form-container">
          <form @submit.prevent="submitContactForm" class="contact-form">
            <div class="form-row">
              <div class="form-group">
                <label for="name" class="form-label">Full Name *</label>
                <input
                  type="text"
                  id="name"
                  v-model="contactForm.name"
                  class="form-input"
                  :class="{ error: errors.name }"
                  @blur="validateName"
                />
                <div v-if="errors.name" class="error-message">{{ errors.name }}</div>
              </div>

              <div class="form-group">
                <label for="email" class="form-label">Email Address *</label>
                <input
                  type="email"
                  id="email"
                  v-model="contactForm.email"
                  class="form-input"
                  :class="{ error: errors.email }"
                  @blur="validateEmail"
                />
                <div v-if="errors.email" class="error-message">{{ errors.email }}</div>
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label for="phone" class="form-label">Phone Number</label>
                <input
                  type="tel"
                  id="phone"
                  v-model="contactForm.phone"
                  class="form-input"
                  placeholder="(555) 123-4567"
                />
              </div>

              <div class="form-group">
                <label for="subject" class="form-label">Subject *</label>
                <select
                  id="subject"
                  v-model="contactForm.subject"
                  class="form-input"
                  :class="{ error: errors.subject }"
                  @change="validateSubject"
                >
                  <option value="">Select a subject</option>
                  <option value="general">General Inquiry</option>
                  <option value="health">Health Resources Question</option>
                  <option value="technical">Technical Support</option>
                  <option value="emergency">Non-Emergency Health Concern</option>
                  <option value="feedback">Feedback or Suggestion</option>
                </select>
                <div v-if="errors.subject" class="error-message">{{ errors.subject }}</div>
              </div>
            </div>

            <div class="form-group">
              <label for="message" class="form-label">Message *</label>
              <textarea
                id="message"
                v-model="contactForm.message"
                class="form-textarea"
                :class="{ error: errors.message }"
                rows="6"
                placeholder="Please describe your question or concern in detail..."
                @blur="validateMessage"
              ></textarea>
              <div v-if="errors.message" class="error-message">{{ errors.message }}</div>
            </div>

            <div class="form-group">
              <label class="checkbox-label">
                <input type="checkbox" v-model="contactForm.newsletter" class="checkbox-input" />
                <span class="checkbox-text">
                  I would like to receive health tips and updates via email
                </span>
              </label>
            </div>

            <div class="form-actions">
              <button type="submit" class="btn btn-primary" :disabled="!isFormValid">
                Send Message
              </button>
              <button type="button" class="btn btn-secondary" @click="resetForm">Clear Form</button>
            </div>
          </form>

          <div v-if="formSubmitted" class="success-card">
            <div class="success-icon">✅</div>
            <h3>Message Sent Successfully!</h3>
            <p>Thank you for contacting us. We'll get back to you within 24 hours.</p>
          </div>
        </div>
      </section>

      <!-- 常见问题 -->
      <section class="faq-section">
        <h2 class="section-title">Frequently Asked Questions</h2>
        <div class="faq-list">
          <div
            v-for="faq in faqs"
            :key="faq.id"
            class="faq-item"
            :class="{ active: activeFaq === faq.id }"
          >
            <div class="faq-question" @click="toggleFaq(faq.id)">
              <h4>{{ faq.question }}</h4>
              <span class="faq-toggle">{{ activeFaq === faq.id ? '−' : '+' }}</span>
            </div>
            <div v-if="activeFaq === faq.id" class="faq-answer">
              <p>{{ faq.answer }}</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script>
export default {
  name: 'SupportPage',
  data() {
    return {
      contactForm: {
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: '',
        newsletter: false,
      },
      errors: {
        name: '',
        email: '',
        subject: '',
        message: '',
      },
      formSubmitted: false,
      activeFaq: null,
      faqs: [
        {
          id: 1,
          question: 'How do I register for an account?',
          answer:
            'Click the "Register" button in the top navigation, fill out the required information, and verify your email address to complete registration.',
        },
        {
          id: 2,
          question: 'What health resources are available?',
          answer:
            'We offer comprehensive health information covering heart health, diabetes management, mental health support, nutrition guidelines, and more. All resources are reviewed by healthcare professionals.',
        },
        {
          id: 3,
          question: 'How can I join community events?',
          answer:
            'Browse our community events on the Community page and click "Register" for any event you\'d like to attend. You\'ll receive confirmation and reminder emails.',
        },
        {
          id: 4,
          question: 'Is my personal information secure?',
          answer:
            'Yes, we use industry-standard encryption and security measures to protect your personal information. We never share your data with third parties without your consent.',
        },
        {
          id: 5,
          question: 'How do I update my profile information?',
          answer:
            'Log in to your account and go to your Dashboard. You can update your profile information, preferences, and contact details from there.',
        },
        {
          id: 6,
          question: 'What should I do in a medical emergency?',
          answer:
            'In case of a medical emergency, call 911 immediately. Our platform is for educational and community support purposes and should not replace professional medical care.',
        },
      ],
    }
  },
  computed: {
    isFormValid() {
      return (
        this.contactForm.name &&
        this.contactForm.email &&
        this.contactForm.subject &&
        this.contactForm.message &&
        !this.errors.name &&
        !this.errors.email &&
        !this.errors.subject &&
        !this.errors.message
      )
    },
  },
  methods: {
    validateName() {
      if (!this.contactForm.name.trim()) {
        this.errors.name = 'Name is required'
      } else if (this.contactForm.name.trim().length < 2) {
        this.errors.name = 'Name must be at least 2 characters'
      } else {
        this.errors.name = ''
      }
    },
    validateEmail() {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!this.contactForm.email) {
        this.errors.email = 'Email is required'
      } else if (!emailRegex.test(this.contactForm.email)) {
        this.errors.email = 'Please enter a valid email address'
      } else {
        this.errors.email = ''
      }
    },
    validateSubject() {
      if (!this.contactForm.subject) {
        this.errors.subject = 'Please select a subject'
      } else {
        this.errors.subject = ''
      }
    },
    validateMessage() {
      if (!this.contactForm.message.trim()) {
        this.errors.message = 'Message is required'
      } else if (this.contactForm.message.trim().length < 10) {
        this.errors.message = 'Message must be at least 10 characters'
      } else {
        this.errors.message = ''
      }
    },
    submitContactForm() {
      // 验证所有字段
      this.validateName()
      this.validateEmail()
      this.validateSubject()
      this.validateMessage()

      if (!this.isFormValid) {
        return
      }

      // 模拟提交表单
      console.log('Contact form submitted:', this.contactForm)
      this.formSubmitted = true

      // 3秒后隐藏成功消息并重置表单
      setTimeout(() => {
        this.formSubmitted = false
        this.resetForm()
      }, 3000)
    },
    resetForm() {
      this.contactForm = {
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: '',
        newsletter: false,
      }
      this.errors = {
        name: '',
        email: '',
        subject: '',
        message: '',
      }
    },
    startLiveChat() {
      alert(
        'Live chat feature will be available soon! Please use phone or email support for immediate assistance.',
      )
    },
    toggleFaq(faqId) {
      this.activeFaq = this.activeFaq === faqId ? null : faqId
    },
  },
}
</script>

<style scoped>
.support-page {
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

/* 紧急联系部分 */
.emergency-contact {
  margin-bottom: 60px;
}

.emergency-card {
  background: linear-gradient(135deg, #e74c3c, #c0392b);
  color: white;
  padding: 30px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  gap: 30px;
  box-shadow: 0 5px 20px rgba(231, 76, 60, 0.3);
}

.emergency-icon {
  font-size: 60px;
  flex-shrink: 0;
}

.emergency-content h2 {
  margin-bottom: 10px;
  font-size: 24px;
}

.emergency-content p {
  margin-bottom: 15px;
  font-size: 16px;
}

.emergency-numbers {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.emergency-number {
  font-size: 18px;
  font-weight: bold;
}

/* 联系方式网格 */
.contact-methods {
  margin-bottom: 60px;
}

.contact-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 30px;
}

.contact-card {
  background: white;
  padding: 30px;
  border-radius: 12px;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.1);
  text-align: center;
  transition: transform 0.3s ease;
}

.contact-card:hover {
  transform: translateY(-5px);
}

.contact-icon {
  font-size: 48px;
  margin-bottom: 20px;
}

.contact-card h3 {
  color: #2c3e50;
  margin-bottom: 15px;
  font-size: 20px;
}

.contact-card p {
  color: #666;
  margin-bottom: 20px;
  line-height: 1.6;
}

.contact-info {
  color: #3498db;
  font-size: 16px;
  font-weight: bold;
}

/* 联系表单 */
.contact-form-section {
  margin-bottom: 60px;
}

.form-container {
  max-width: 800px;
  margin: 0 auto;
  position: relative;
}

.contact-form {
  background: white;
  padding: 40px;
  border-radius: 12px;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.1);
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
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

.form-input.error,
.form-textarea.error {
  border-color: #e74c3c;
}

.checkbox-label {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  cursor: pointer;
  font-size: 16px;
}

.checkbox-input {
  margin-top: 2px;
}

.checkbox-text {
  color: #666;
  line-height: 1.5;
}

.form-actions {
  display: flex;
  gap: 15px;
  justify-content: center;
  margin-top: 30px;
}

.success-card {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: white;
  padding: 40px;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  text-align: center;
  z-index: 10;
}

.success-icon {
  font-size: 60px;
  margin-bottom: 20px;
}

.success-card h3 {
  color: #27ae60;
  margin-bottom: 15px;
}

.success-card p {
  color: #666;
}

/* FAQ部分 */
.faq-section {
  margin-bottom: 40px;
}

.faq-list {
  max-width: 800px;
  margin: 0 auto;
}

.faq-item {
  background: white;
  margin-bottom: 10px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.faq-question {
  padding: 20px;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: background-color 0.3s ease;
}

.faq-question:hover {
  background-color: #f8f9fa;
}

.faq-question h4 {
  color: #2c3e50;
  margin: 0;
  font-size: 16px;
}

.faq-toggle {
  font-size: 24px;
  color: #3498db;
  font-weight: bold;
}

.faq-answer {
  padding: 0 20px 20px;
  border-top: 1px solid #eee;
}

.faq-answer p {
  color: #666;
  line-height: 1.6;
  margin: 15px 0 0;
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

  .emergency-card {
    flex-direction: column;
    text-align: center;
  }

  .emergency-icon {
    font-size: 48px;
  }

  .contact-grid {
    grid-template-columns: 1fr;
  }

  .form-row {
    grid-template-columns: 1fr;
  }

  .contact-form {
    padding: 30px 20px;
  }

  .form-actions {
    flex-direction: column;
  }

  .success-card {
    position: static;
    transform: none;
    margin-top: 20px;
  }
}
</style>

// 免费邮件服务 - 使用 Web3Forms
class EmailService {
  constructor() {
    this.accessKey = import.meta.env.VITE_WEB3FORMS_ACCESS_KEY
    this.defaultRecipient = import.meta.env.VITE_DEFAULT_RECIPIENT_EMAIL
    this.isInitialized = false
  }

  // 初始化服务
  async initialize() {
    try {
      if (!this.accessKey) {
        throw new Error('Web3Forms access key is not configured')
      }
      this.isInitialized = true
      console.log('✅ Email service initialized with Web3Forms')
      return true
    } catch (error) {
      console.error('Failed to initialize email service:', error)
      return false
    }
  }

  // 使用 Web3Forms 发送邮件的通用方法
  async sendEmail(emailData) {
    try {
      if (!this.isInitialized) {
        await this.initialize()
      }

      const formData = new FormData()
      formData.append('access_key', this.accessKey)
      formData.append('from_name', emailData.fromName || 'Elderly Health App')
      formData.append('from_email', emailData.fromEmail || this.defaultRecipient)
      formData.append('to_email', emailData.toEmail || this.defaultRecipient)
      formData.append('subject', emailData.subject)
      formData.append('message', emailData.message)

      // 添加附件支持
      if (emailData.attachment) {
        formData.append('attachment', emailData.attachment)
      }

      // 隐藏字段，用于标识邮件类型
      formData.append('email_type', emailData.type || 'general')
      formData.append('redirect', 'false') // 防止重定向

      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        body: formData,
      })

      const result = await response.json()

      if (result.success) {
        return {
          success: true,
          message: 'Email sent successfully',
          messageId: result.message || 'sent',
        }
      } else {
        throw new Error(result.message || 'Failed to send email')
      }
    } catch (error) {
      console.error('Email sending failed:', error)
      return {
        success: false,
        message: 'Failed to send email: ' + error.message,
      }
    }
  }

  // 发送健康报告邮件
  async sendHealthReport(recipientEmail, reportData, attachmentFile = null) {
    try {
      const emailData = {
        toEmail: recipientEmail,
        fromName: 'Elderly Health System',
        subject: `Health Report - ${reportData.reportType}`,
        message: this.generateHealthReportEmail(reportData),
        type: 'health_report',
        attachment: attachmentFile,
      }

      return await this.sendEmail(emailData)
    } catch (error) {
      console.error('Failed to send health report:', error)
      return {
        success: false,
        message: 'Failed to send health report: ' + error.message,
      }
    }
  }

  // 发送预约确认邮件
  async sendAppointmentConfirmation(appointmentData) {
    try {
      const emailData = {
        toEmail: appointmentData.patientEmail,
        fromName: 'Elderly Health - Appointments',
        subject: 'Appointment Confirmation',
        message: this.generateAppointmentEmail(appointmentData),
        type: 'appointment_confirmation',
      }

      return await this.sendEmail(emailData)
    } catch (error) {
      console.error('Failed to send appointment confirmation:', error)
      return {
        success: false,
        message: 'Failed to send appointment confirmation: ' + error.message,
      }
    }
  }

  // 批量发送健康提醒邮件（使用队列方式）
  async sendBulkHealthReminders(recipients, reminderData) {
    const results = []

    for (let i = 0; i < recipients.length; i++) {
      const recipient = recipients[i]

      try {
        const emailData = {
          toEmail: recipient.email,
          fromName: 'Elderly Health - Reminders',
          subject: reminderData.subject,
          message: this.generateReminderEmail(recipient.name, reminderData),
          type: 'health_reminder',
        }

        const result = await this.sendEmail(emailData)

        results.push({
          email: recipient.email,
          success: result.success,
          messageId: result.messageId,
        })

        // 添加延迟避免过快发送
        if (i < recipients.length - 1) {
          await new Promise((resolve) => setTimeout(resolve, 2000))
        }
      } catch (error) {
        results.push({
          email: recipient.email,
          success: false,
          error: error.message,
        })
      }
    }

    return {
      success: true,
      results,
      totalSent: results.filter((r) => r.success).length,
      totalFailed: results.filter((r) => !r.success).length,
    }
  }

  // 发送联系表单邮件
  async sendContactForm(formData) {
    try {
      const emailData = {
        fromName: formData.name,
        fromEmail: formData.email,
        subject: `Contact Form: ${formData.subject}`,
        message: this.generateContactEmail(formData),
        type: 'contact_form',
      }

      return await this.sendEmail(emailData)
    } catch (error) {
      console.error('Failed to send contact form:', error)
      return {
        success: false,
        message: 'Failed to send message: ' + error.message,
      }
    }
  }

  // 生成健康报告邮件内容
  generateHealthReportEmail(reportData) {
    return `
Dear ${reportData.patientName},

Your ${reportData.reportType} health report is ready.

📅 Report Date: ${reportData.date}

📋 Summary:
${reportData.summary}

💡 Recommendations:
${reportData.recommendations}

${
  reportData.nextAppointment
    ? `
📅 Next Appointment:
Date: ${reportData.nextAppointment.date}
Time: ${reportData.nextAppointment.time}
Doctor: ${reportData.nextAppointment.doctor}
`
    : ''
}

If you have any questions about this report, please don't hesitate to contact us.

Best regards,
Elderly Health Care Team

---
This is an automated message from the Elderly Health System.
For support, please contact: ${this.defaultRecipient}
    `.trim()
  }

  // 生成预约确认邮件内容
  generateAppointmentEmail(appointmentData) {
    return `
Dear ${appointmentData.patientName},

Your appointment has been confirmed!

📅 Appointment Details:
- Date: ${appointmentData.date}
- Time: ${appointmentData.time}
- Doctor: ${appointmentData.doctorName}
- Type: ${appointmentData.type || 'General Consultation'}

🏥 Location:
${appointmentData.clinicName || 'Elderly Health Clinic'}
${appointmentData.clinicAddress || '123 Health Street, Melbourne VIC 3000'}

📝 Important Notes:
- Please arrive 15 minutes early
- Bring a valid ID and any relevant medical records
- If you need to reschedule, please contact us at least 24 hours in advance

${appointmentData.instructions || ''}

If you have any questions, please contact us.

Best regards,
Elderly Health Care Team

---
For appointment changes or questions, please call: (03) 9123-4567
Email: appointments@elderlyhealth.org
    `.trim()
  }

  // 生成提醒邮件内容
  generateReminderEmail(recipientName, reminderData) {
    return `
Dear ${recipientName},

${reminderData.message}

📅 Due Date: ${reminderData.dueDate}
📋 Action Required: ${reminderData.actionRequired}

Please take action on this reminder to maintain your health and wellness.

If you have already completed this action, you can safely ignore this reminder.

Stay healthy!

Best regards,
Elderly Health Care Team

---
To unsubscribe from reminders, please contact: ${this.defaultRecipient}
    `.trim()
  }

  // 生成联系表单邮件内容
  generateContactEmail(formData) {
    return `
New contact form submission:

📧 From: ${formData.name} (${formData.email})
📞 Phone: ${formData.phone || 'Not provided'}
📝 Subject: ${formData.subject}

💬 Message:
${formData.message}

---
Submitted from: Elderly Health Website
Time: ${new Date().toLocaleString()}
IP: [Auto-detected by Web3Forms]
    `.trim()
  }

  // 获取服务状态
  getServiceStatus() {
    return {
      service: 'Web3Forms',
      initialized: this.isInitialized,
      endpoint: 'https://api.web3forms.com/submit',
      features: [
        'Unlimited free emails',
        'File attachments support',
        'No rate limits',
        'Spam protection',
        'No registration required',
      ],
    }
  }
}

// 导出单例实例
export const emailService = new EmailService()

// 导出便利函数
export const sendHealthReport = (email, data, attachment) =>
  emailService.sendHealthReport(email, data, attachment)

export const sendAppointmentConfirmation = (data) => emailService.sendAppointmentConfirmation(data)

export const sendBulkReminders = (recipients, data) =>
  emailService.sendBulkHealthReminders(recipients, data)

export const sendContactMessage = (data) => emailService.sendContactForm(data)

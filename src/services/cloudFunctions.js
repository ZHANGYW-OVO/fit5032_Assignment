// 云函数服务 - Firebase Functions 集成
import { getFunctions, httpsCallable } from 'firebase/functions'

class CloudFunctionsService {
  constructor() {
    this.functions = getFunctions()
    this.isOnline = navigator.onLine
    this.setupOfflineDetection()
  }

  // 设置离线检测
  setupOfflineDetection() {
    window.addEventListener('online', () => {
      this.isOnline = true
      this.syncOfflineData()
    })

    window.addEventListener('offline', () => {
      this.isOnline = false
    })
  }

  // 健康数据处理云函数
  async processHealthData(healthData) {
    try {
      if (!this.isOnline) {
        return this.handleOfflineRequest('processHealthData', healthData)
      }

      const processData = httpsCallable(this.functions, 'processHealthData')
      const result = await processData({
        patientId: healthData.patientId,
        vitals: healthData.vitals,
        timestamp: new Date().toISOString(),
        source: 'web_app',
      })

      return {
        success: true,
        data: result.data,
        insights: this.generateHealthInsights(result.data),
        recommendations: this.generateRecommendations(result.data),
      }
    } catch (error) {
      console.error('Health data processing failed:', error)
      return {
        success: false,
        message: 'Failed to process health data: ' + error.message,
      }
    }
  }

  // 生成健康报告云函数
  async generateHealthReport(patientData, timeRange = '30days') {
    try {
      if (!this.isOnline) {
        return this.handleOfflineRequest('generateHealthReport', { patientData, timeRange })
      }

      const generateReport = httpsCallable(this.functions, 'generateHealthReport')
      const result = await generateReport({
        patientId: patientData.id,
        timeRange,
        includeCharts: true,
        format: 'comprehensive',
      })

      return {
        success: true,
        reportData: result.data,
        downloadUrl: result.data.downloadUrl,
        insights: result.data.insights,
      }
    } catch (error) {
      console.error('Report generation failed:', error)
      return {
        success: false,
        message: 'Failed to generate health report: ' + error.message,
      }
    }
  }

  // 风险评估云函数
  async assessHealthRisk(patientProfile, currentVitals) {
    try {
      if (!this.isOnline) {
        return this.handleOfflineRequest('assessHealthRisk', { patientProfile, currentVitals })
      }

      const assessRisk = httpsCallable(this.functions, 'assessHealthRisk')
      const result = await assessRisk({
        age: patientProfile.age,
        gender: patientProfile.gender,
        medicalHistory: patientProfile.medicalHistory,
        currentVitals,
        lifestyle: patientProfile.lifestyle,
      })

      return {
        success: true,
        riskScore: result.data.riskScore,
        riskLevel: result.data.riskLevel,
        riskFactors: result.data.riskFactors,
        preventiveActions: result.data.preventiveActions,
        urgentAlerts: result.data.urgentAlerts,
      }
    } catch (error) {
      console.error('Risk assessment failed:', error)
      return {
        success: false,
        message: 'Failed to assess health risk: ' + error.message,
      }
    }
  }

  // 药物相互作用检查云函数
  async checkMedicationInteractions(medications) {
    try {
      if (!this.isOnline) {
        return this.handleOfflineRequest('checkMedicationInteractions', medications)
      }

      const checkInteractions = httpsCallable(this.functions, 'checkMedicationInteractions')
      const result = await checkInteractions({
        medications,
        checkSeverity: true,
        includeFood: true,
      })

      return {
        success: true,
        interactions: result.data.interactions,
        warnings: result.data.warnings,
        recommendations: result.data.recommendations,
        severity: result.data.maxSeverity,
      }
    } catch (error) {
      console.error('Medication interaction check failed:', error)
      return {
        success: false,
        message: 'Failed to check medication interactions: ' + error.message,
      }
    }
  }

  // 预约优化云函数
  async optimizeAppointmentSchedule(doctorId, preferences = {}) {
    try {
      if (!this.isOnline) {
        return this.handleOfflineRequest('optimizeAppointmentSchedule', { doctorId, preferences })
      }

      const optimizeSchedule = httpsCallable(this.functions, 'optimizeAppointmentSchedule')
      const result = await optimizeSchedule({
        doctorId,
        preferences: {
          preferredTimes: preferences.preferredTimes || [],
          urgency: preferences.urgency || 'normal',
          appointmentType: preferences.appointmentType || 'consultation',
          minNoticePeriod: preferences.minNoticePeriod || 24, // hours
        },
        patientHistory: preferences.patientHistory,
      })

      return {
        success: true,
        suggestedSlots: result.data.suggestedSlots,
        alternativeOptions: result.data.alternatives,
        reasoning: result.data.reasoning,
        waitTime: result.data.estimatedWaitTime,
      }
    } catch (error) {
      console.error('Schedule optimization failed:', error)
      return {
        success: false,
        message: 'Failed to optimize appointment schedule: ' + error.message,
      }
    }
  }

  // 健康提醒系统云函数
  async setupHealthReminders(patientId, reminderConfig) {
    try {
      if (!this.isOnline) {
        return this.handleOfflineRequest('setupHealthReminders', { patientId, reminderConfig })
      }

      const setupReminders = httpsCallable(this.functions, 'setupHealthReminders')
      const result = await setupReminders({
        patientId,
        reminders: reminderConfig.reminders,
        preferences: {
          emailEnabled: reminderConfig.emailEnabled || true,
          smsEnabled: reminderConfig.smsEnabled || false,
          pushEnabled: reminderConfig.pushEnabled || true,
          timezone: reminderConfig.timezone || 'Australia/Melbourne',
        },
      })

      return {
        success: true,
        reminderIds: result.data.reminderIds,
        scheduledCount: result.data.scheduledCount,
        nextReminder: result.data.nextReminder,
      }
    } catch (error) {
      console.error('Reminder setup failed:', error)
      return {
        success: false,
        message: 'Failed to setup health reminders: ' + error.message,
      }
    }
  }

  // 数据同步云函数
  async syncPatientData(localData, lastSyncTimestamp) {
    try {
      if (!this.isOnline) {
        return this.storeOfflineSync(localData)
      }

      const syncData = httpsCallable(this.functions, 'syncPatientData')
      const result = await syncData({
        localData,
        lastSync: lastSyncTimestamp,
        deviceId: this.getDeviceId(),
        appVersion: '1.0.0',
      })

      return {
        success: true,
        syncedRecords: result.data.syncedRecords,
        conflicts: result.data.conflicts,
        serverData: result.data.serverData,
        nextSyncToken: result.data.nextSyncToken,
      }
    } catch (error) {
      console.error('Data sync failed:', error)
      return {
        success: false,
        message: 'Failed to sync patient data: ' + error.message,
      }
    }
  }

  // 离线请求处理
  handleOfflineRequest(functionName, data) {
    const offlineRequest = {
      id: Date.now(),
      functionName,
      data,
      timestamp: new Date().toISOString(),
      status: 'pending',
    }

    // 存储到本地存储
    const offlineQueue = this.getOfflineQueue()
    offlineQueue.push(offlineRequest)
    localStorage.setItem('offlineRequestQueue', JSON.stringify(offlineQueue))

    return {
      success: false,
      offline: true,
      message: 'Request queued for when connection is restored',
      requestId: offlineRequest.id,
    }
  }

  // 获取离线请求队列
  getOfflineQueue() {
    try {
      const queue = localStorage.getItem('offlineRequestQueue')
      return queue ? JSON.parse(queue) : []
    } catch (error) {
      console.error('Failed to get offline queue:', error)
      return []
    }
  }

  // 同步离线数据
  async syncOfflineData() {
    const queue = this.getOfflineQueue()
    if (queue.length === 0) return

    console.log(`Syncing ${queue.length} offline requests...`)

    const syncResults = []

    for (const request of queue) {
      try {
        let result

        switch (request.functionName) {
          case 'processHealthData':
            result = await this.processHealthData(request.data)
            break
          case 'generateHealthReport':
            result = await this.generateHealthReport(
              request.data.patientData,
              request.data.timeRange,
            )
            break
          case 'assessHealthRisk':
            result = await this.assessHealthRisk(
              request.data.patientProfile,
              request.data.currentVitals,
            )
            break
          case 'checkMedicationInteractions':
            result = await this.checkMedicationInteractions(request.data)
            break
          case 'optimizeAppointmentSchedule':
            result = await this.optimizeAppointmentSchedule(
              request.data.doctorId,
              request.data.preferences,
            )
            break
          case 'setupHealthReminders':
            result = await this.setupHealthReminders(
              request.data.patientId,
              request.data.reminderConfig,
            )
            break
          case 'syncPatientData':
            result = await this.syncPatientData(
              request.data.localData,
              request.data.lastSyncTimestamp,
            )
            break
          default:
            result = { success: false, message: 'Unknown function' }
        }

        syncResults.push({
          requestId: request.id,
          success: result.success,
          result,
        })
      } catch (error) {
        console.error(`Failed to sync request ${request.id}:`, error)
        syncResults.push({
          requestId: request.id,
          success: false,
          error: error.message,
        })
      }
    }

    // 清除成功同步的请求
    const failedRequests = queue.filter((request) => {
      const syncResult = syncResults.find((r) => r.requestId === request.id)
      return !syncResult || !syncResult.success
    })

    localStorage.setItem('offlineRequestQueue', JSON.stringify(failedRequests))

    console.log(
      `Sync completed: ${syncResults.filter((r) => r.success).length} successful, ${syncResults.filter((r) => !r.success).length} failed`,
    )

    return syncResults
  }

  // 生成设备ID
  getDeviceId() {
    let deviceId = localStorage.getItem('deviceId')
    if (!deviceId) {
      deviceId = 'device_' + Math.random().toString(36).substr(2, 9)
      localStorage.setItem('deviceId', deviceId)
    }
    return deviceId
  }

  // 生成健康洞察
  generateHealthInsights(healthData) {
    const insights = []

    // 血压分析
    if (healthData.bloodPressure) {
      const { systolic, diastolic } = healthData.bloodPressure
      if (systolic > 140 || diastolic > 90) {
        insights.push({
          type: 'warning',
          title: 'High Blood Pressure Detected',
          description: 'Your blood pressure readings are above normal range.',
          priority: 'high',
        })
      }
    }

    // 心率分析
    if (healthData.heartRate) {
      if (healthData.heartRate > 100) {
        insights.push({
          type: 'info',
          title: 'Elevated Heart Rate',
          description: 'Consider relaxation techniques or consult your doctor.',
          priority: 'medium',
        })
      }
    }

    return insights
  }

  // 生成健康建议
  generateRecommendations(healthData) {
    const recommendations = []

    // 基于数据生成建议
    if (healthData.bloodPressure?.systolic > 130) {
      recommendations.push({
        category: 'lifestyle',
        title: 'Reduce Sodium Intake',
        description: 'Limit sodium to less than 2,300mg per day to help lower blood pressure.',
        actionable: true,
      })
    }

    if (healthData.activity?.steps < 5000) {
      recommendations.push({
        category: 'exercise',
        title: 'Increase Daily Activity',
        description: 'Aim for at least 7,000 steps per day for better cardiovascular health.',
        actionable: true,
      })
    }

    return recommendations
  }

  // 存储离线同步数据
  storeOfflineSync(data) {
    try {
      const offlineSyncData = {
        id: Date.now(),
        data,
        timestamp: new Date().toISOString(),
      }

      const existingData = localStorage.getItem('offlineSyncData')
      const syncArray = existingData ? JSON.parse(existingData) : []
      syncArray.push(offlineSyncData)

      localStorage.setItem('offlineSyncData', JSON.stringify(syncArray))

      return {
        success: true,
        offline: true,
        message: 'Data stored locally for sync when online',
        syncId: offlineSyncData.id,
      }
    } catch (error) {
      console.error('Failed to store offline sync data:', error)
      return {
        success: false,
        message: 'Failed to store data locally',
      }
    }
  }

  // 获取连接状态
  getConnectionStatus() {
    return {
      online: this.isOnline,
      lastSync: localStorage.getItem('lastSyncTimestamp'),
      pendingRequests: this.getOfflineQueue().length,
      syncDataCount: this.getOfflineSyncData().length,
    }
  }

  // 获取离线同步数据
  getOfflineSyncData() {
    try {
      const data = localStorage.getItem('offlineSyncData')
      return data ? JSON.parse(data) : []
    } catch (error) {
      console.error('Failed to get offline sync data:', error)
      return []
    }
  }
}

// 导出单例实例
export const cloudFunctionsService = new CloudFunctionsService()

// 导出便利函数
export const processHealthData = (data) => cloudFunctionsService.processHealthData(data)
export const generateHealthReport = (patientData, timeRange) =>
  cloudFunctionsService.generateHealthReport(patientData, timeRange)
export const assessHealthRisk = (profile, vitals) =>
  cloudFunctionsService.assessHealthRisk(profile, vitals)
export const checkMedicationInteractions = (medications) =>
  cloudFunctionsService.checkMedicationInteractions(medications)
export const optimizeAppointmentSchedule = (doctorId, preferences) =>
  cloudFunctionsService.optimizeAppointmentSchedule(doctorId, preferences)
export const setupHealthReminders = (patientId, config) =>
  cloudFunctionsService.setupHealthReminders(patientId, config)
export const syncPatientData = (localData, lastSync) =>
  cloudFunctionsService.syncPatientData(localData, lastSync)

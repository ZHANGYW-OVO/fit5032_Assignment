<template>
  <div class="offline-features">
    <!-- 连接状态指示器 -->
    <div class="connection-status" :class="{ offline: !isOnline, syncing: isSyncing }">
      <div class="status-indicator">
        <span class="status-icon">{{ isOnline ? '🌐' : '📱' }}</span>
        <span class="status-text">
          {{ isOnline ? 'Online' : 'Offline Mode' }}
        </span>
        <span v-if="isSyncing" class="sync-spinner">🔄</span>
      </div>

      <div v-if="!isOnline && pendingSync > 0" class="pending-sync">
        {{ pendingSync }} items pending sync
      </div>
    </div>

    <!-- 离线功能面板 -->
    <div class="offline-panel">
      <h3>📱 Offline Capabilities</h3>

      <!-- 离线健康数据记录 -->
      <div class="offline-section">
        <h4>🩺 Health Data Recording</h4>
        <p>Record vital signs and health metrics even when offline</p>

        <div class="health-data-form">
          <div class="form-row">
            <div class="form-group">
              <label>Blood Pressure</label>
              <div class="bp-inputs">
                <input
                  type="number"
                  v-model="offlineHealthData.bloodPressure.systolic"
                  placeholder="Systolic"
                  class="form-input bp-input"
                />
                <span>/</span>
                <input
                  type="number"
                  v-model="offlineHealthData.bloodPressure.diastolic"
                  placeholder="Diastolic"
                  class="form-input bp-input"
                />
              </div>
            </div>

            <div class="form-group">
              <label>Heart Rate (BPM)</label>
              <input
                type="number"
                v-model="offlineHealthData.heartRate"
                placeholder="75"
                class="form-input"
              />
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Weight (kg)</label>
              <input
                type="number"
                step="0.1"
                v-model="offlineHealthData.weight"
                placeholder="70.5"
                class="form-input"
              />
            </div>

            <div class="form-group">
              <label>Blood Sugar (mg/dL)</label>
              <input
                type="number"
                v-model="offlineHealthData.bloodSugar"
                placeholder="100"
                class="form-input"
              />
            </div>
          </div>

          <div class="form-group">
            <label>Notes</label>
            <textarea
              v-model="offlineHealthData.notes"
              placeholder="Any symptoms or observations..."
              class="form-input"
              rows="3"
            ></textarea>
          </div>

          <button @click="saveHealthData" class="btn btn-primary">💾 Save Health Data</button>
        </div>
      </div>

      <!-- 离线药物追踪 -->
      <div class="offline-section">
        <h4>💊 Medication Tracking</h4>
        <p>Track medication intake and set reminders</p>

        <div class="medication-tracker">
          <div class="medication-list">
            <div
              v-for="medication in offlineMedications"
              :key="medication.id"
              class="medication-item"
              :class="{ taken: medication.takenToday }"
            >
              <div class="medication-info">
                <strong>{{ medication.name }}</strong>
                <span class="dosage">{{ medication.dosage }}</span>
                <span class="schedule">{{ medication.schedule }}</span>
              </div>
              <div class="medication-actions">
                <button
                  @click="toggleMedicationTaken(medication)"
                  :class="`btn btn-sm ${medication.takenToday ? 'btn-success' : 'btn-outline'}`"
                >
                  {{ medication.takenToday ? '✅ Taken' : '⏰ Mark Taken' }}
                </button>
              </div>
            </div>
          </div>

          <div class="add-medication">
            <h5>Add New Medication</h5>
            <div class="form-row">
              <input
                type="text"
                v-model="newMedication.name"
                placeholder="Medication name"
                class="form-input"
              />
              <input
                type="text"
                v-model="newMedication.dosage"
                placeholder="Dosage"
                class="form-input"
              />
              <button @click="addMedication" class="btn btn-secondary">➕ Add</button>
            </div>
          </div>
        </div>
      </div>

      <!-- 离线症状日志 -->
      <div class="offline-section">
        <h4>📝 Symptom Journal</h4>
        <p>Keep track of symptoms and their severity</p>

        <div class="symptom-logger">
          <div class="current-symptoms">
            <div class="form-group">
              <label>Current Symptoms</label>
              <select v-model="newSymptom.type" class="form-input">
                <option value="">Select symptom type</option>
                <option value="pain">Pain</option>
                <option value="fatigue">Fatigue</option>
                <option value="nausea">Nausea</option>
                <option value="dizziness">Dizziness</option>
                <option value="shortness_of_breath">Shortness of Breath</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div class="form-group">
              <label>Severity (1-10)</label>
              <div class="severity-scale">
                <input
                  type="range"
                  min="1"
                  max="10"
                  v-model="newSymptom.severity"
                  class="severity-slider"
                />
                <span class="severity-value">{{ newSymptom.severity }}</span>
              </div>
            </div>

            <div class="form-group">
              <label>Description</label>
              <textarea
                v-model="newSymptom.description"
                placeholder="Describe your symptoms..."
                class="form-input"
                rows="3"
              ></textarea>
            </div>

            <button @click="logSymptom" class="btn btn-primary">📝 Log Symptom</button>
          </div>

          <div class="symptom-history">
            <h5>Recent Symptoms</h5>
            <div class="symptom-list">
              <div v-for="symptom in recentSymptoms" :key="symptom.id" class="symptom-item">
                <div class="symptom-time">{{ formatTime(symptom.timestamp) }}</div>
                <div class="symptom-details">
                  <strong>{{ symptom.type }}</strong>
                  <span class="severity">Severity: {{ symptom.severity }}/10</span>
                  <p class="description">{{ symptom.description }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 数据存储状态 -->
      <div class="offline-section">
        <h4>💾 Local Data Storage</h4>
        <p>View and manage locally stored data</p>

        <div class="storage-stats">
          <div class="stat-item">
            <span class="stat-label">Health Records:</span>
            <span class="stat-value">{{ localHealthRecords.length }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Medication Logs:</span>
            <span class="stat-value">{{ localMedicationLogs.length }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Symptom Entries:</span>
            <span class="stat-value">{{ localSymptomLogs.length }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Storage Used:</span>
            <span class="stat-value">{{ formatStorageSize(getStorageUsed()) }}</span>
          </div>
        </div>

        <div class="storage-actions">
          <button @click="exportLocalData" class="btn btn-secondary">📤 Export Local Data</button>
          <button @click="clearLocalData" class="btn btn-danger">🗑️ Clear Local Data</button>
          <button @click="forceSyncData" class="btn btn-primary" :disabled="!isOnline || isSyncing">
            🔄 Force Sync
          </button>
        </div>
      </div>

      <!-- 离线设置 -->
      <div class="offline-section">
        <h4>⚙️ Offline Settings</h4>
        <p>Configure offline functionality</p>

        <div class="offline-settings">
          <div class="setting-item">
            <label class="checkbox-label">
              <input type="checkbox" v-model="offlineSettings.autoSync" />
              Auto-sync when online
            </label>
          </div>

          <div class="setting-item">
            <label class="checkbox-label">
              <input type="checkbox" v-model="offlineSettings.lowStorageWarning" />
              Warn when storage is low
            </label>
          </div>

          <div class="setting-item">
            <label class="checkbox-label">
              <input type="checkbox" v-model="offlineSettings.medicationReminders" />
              Offline medication reminders
            </label>
          </div>

          <div class="setting-item">
            <label>Data retention (days)</label>
            <select v-model="offlineSettings.dataRetentionDays" class="form-input">
              <option value="7">7 days</option>
              <option value="30">30 days</option>
              <option value="90">90 days</option>
              <option value="365">1 year</option>
            </select>
          </div>

          <button @click="saveOfflineSettings" class="btn btn-primary">💾 Save Settings</button>
        </div>
      </div>
    </div>

    <!-- 同步状态弹窗 -->
    <div v-if="showSyncStatus" class="sync-status-modal">
      <div class="sync-content">
        <h4>🔄 Syncing Data...</h4>
        <div class="sync-progress">
          <div class="progress-bar">
            <div class="progress-fill" :style="{ width: syncProgress + '%' }"></div>
          </div>
          <span>{{ syncProgress }}% complete</span>
        </div>
        <p>{{ syncStatusMessage }}</p>
      </div>
    </div>
  </div>
</template>

<script>
import { cloudFunctionsService } from '../services/cloudFunctions.js'

export default {
  name: 'OfflineFeatures',
  data() {
    return {
      isOnline: navigator.onLine,
      isSyncing: false,
      showSyncStatus: false,
      syncProgress: 0,
      syncStatusMessage: '',
      pendingSync: 0,

      // 离线健康数据
      offlineHealthData: {
        bloodPressure: {
          systolic: '',
          diastolic: '',
        },
        heartRate: '',
        weight: '',
        bloodSugar: '',
        notes: '',
      },

      // 离线药物数据
      offlineMedications: [
        {
          id: 1,
          name: 'Lisinopril',
          dosage: '10mg',
          schedule: 'Once daily',
          takenToday: false,
        },
        {
          id: 2,
          name: 'Metformin',
          dosage: '500mg',
          schedule: 'Twice daily',
          takenToday: true,
        },
      ],

      newMedication: {
        name: '',
        dosage: '',
        schedule: 'Once daily',
      },

      // 症状记录
      newSymptom: {
        type: '',
        severity: 5,
        description: '',
      },

      // 离线设置
      offlineSettings: {
        autoSync: true,
        lowStorageWarning: true,
        medicationReminders: true,
        dataRetentionDays: 30,
      },
    }
  },

  computed: {
    localHealthRecords() {
      return this.getLocalData('healthRecords') || []
    },

    localMedicationLogs() {
      return this.getLocalData('medicationLogs') || []
    },

    localSymptomLogs() {
      return this.getLocalData('symptomLogs') || []
    },

    recentSymptoms() {
      return this.localSymptomLogs.slice(-5).reverse()
    },
  },

  mounted() {
    this.setupOfflineFeatures()
    this.loadOfflineSettings()
    this.updatePendingSync()
  },

  methods: {
    setupOfflineFeatures() {
      // 监听在线/离线状态
      window.addEventListener('online', this.handleOnline)
      window.addEventListener('offline', this.handleOffline)

      // 定期检查存储空间
      if (this.offlineSettings.lowStorageWarning) {
        setInterval(this.checkStorageSpace, 60000) // 每分钟检查一次
      }

      // 设置药物提醒
      if (this.offlineSettings.medicationReminders) {
        this.setupMedicationReminders()
      }
    },

    handleOnline() {
      this.isOnline = true
      if (this.offlineSettings.autoSync) {
        this.syncOfflineData()
      }
    },

    handleOffline() {
      this.isOnline = false
    },

    // 保存健康数据
    saveHealthData() {
      const healthRecord = {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        ...this.offlineHealthData,
        synced: false,
      }

      this.saveToLocalStorage('healthRecords', healthRecord)
      this.resetHealthDataForm()

      alert('Health data saved locally!')
      this.updatePendingSync()
    },

    // 重置健康数据表单
    resetHealthDataForm() {
      this.offlineHealthData = {
        bloodPressure: { systolic: '', diastolic: '' },
        heartRate: '',
        weight: '',
        bloodSugar: '',
        notes: '',
      }
    },

    // 添加药物
    addMedication() {
      if (!this.newMedication.name || !this.newMedication.dosage) return

      const medication = {
        id: Date.now(),
        ...this.newMedication,
        takenToday: false,
        addedDate: new Date().toISOString(),
      }

      this.offlineMedications.push(medication)
      this.saveToLocalStorage('medications', this.offlineMedications)

      this.newMedication = { name: '', dosage: '', schedule: 'Once daily' }
    },

    // 切换药物服用状态
    toggleMedicationTaken(medication) {
      medication.takenToday = !medication.takenToday

      // 记录服用日志
      const medicationLog = {
        id: Date.now(),
        medicationId: medication.id,
        medicationName: medication.name,
        taken: medication.takenToday,
        timestamp: new Date().toISOString(),
        synced: false,
      }

      this.saveToLocalStorage('medicationLogs', medicationLog)
      this.saveToLocalStorage('medications', this.offlineMedications)
      this.updatePendingSync()
    },

    // 记录症状
    logSymptom() {
      if (!this.newSymptom.type) return

      const symptom = {
        id: Date.now(),
        ...this.newSymptom,
        timestamp: new Date().toISOString(),
        synced: false,
      }

      this.saveToLocalStorage('symptomLogs', symptom)
      this.resetSymptomForm()

      alert('Symptom logged successfully!')
      this.updatePendingSync()
    },

    // 重置症状表单
    resetSymptomForm() {
      this.newSymptom = {
        type: '',
        severity: 5,
        description: '',
      }
    },

    // 保存到本地存储
    saveToLocalStorage(key, data) {
      try {
        let existingData = this.getLocalData(key) || []
        if (Array.isArray(existingData)) {
          existingData.push(data)
        } else {
          existingData = data
        }
        localStorage.setItem(`offline_${key}`, JSON.stringify(existingData))
      } catch (error) {
        console.error('Failed to save to localStorage:', error)
        alert('Storage limit reached. Please clear some data.')
      }
    },

    // 从本地存储获取数据
    getLocalData(key) {
      try {
        const data = localStorage.getItem(`offline_${key}`)
        return data ? JSON.parse(data) : null
      } catch (error) {
        console.error('Failed to get from localStorage:', error)
        return null
      }
    },

    // 同步离线数据
    async syncOfflineData() {
      if (!this.isOnline || this.isSyncing) return

      this.isSyncing = true
      this.showSyncStatus = true
      this.syncProgress = 0

      try {
        // 同步健康记录
        this.syncStatusMessage = 'Syncing health records...'
        await this.syncHealthRecords()
        this.syncProgress = 33

        // 同步药物日志
        this.syncStatusMessage = 'Syncing medication logs...'
        await this.syncMedicationLogs()
        this.syncProgress = 66

        // 同步症状日志
        this.syncStatusMessage = 'Syncing symptom logs...'
        await this.syncSymptomLogs()
        this.syncProgress = 100

        this.syncStatusMessage = 'Sync complete!'

        setTimeout(() => {
          this.showSyncStatus = false
          this.updatePendingSync()
        }, 2000)
      } catch (error) {
        console.error('Sync failed:', error)
        this.syncStatusMessage = 'Sync failed. Will retry later.'

        setTimeout(() => {
          this.showSyncStatus = false
        }, 3000)
      } finally {
        this.isSyncing = false
      }
    },

    // 同步健康记录
    async syncHealthRecords() {
      const records = this.localHealthRecords.filter((r) => !r.synced)

      for (const record of records) {
        try {
          await cloudFunctionsService.processHealthData(record)
          record.synced = true
        } catch (error) {
          console.error('Failed to sync health record:', error)
        }
      }

      localStorage.setItem('offline_healthRecords', JSON.stringify(this.localHealthRecords))
    },

    // 同步药物日志
    async syncMedicationLogs() {
      const logs = this.localMedicationLogs.filter((l) => !l.synced)

      for (const log of logs) {
        try {
          // 这里会调用相应的云函数
          log.synced = true
        } catch (error) {
          console.error('Failed to sync medication log:', error)
        }
      }

      localStorage.setItem('offline_medicationLogs', JSON.stringify(this.localMedicationLogs))
    },

    // 同步症状日志
    async syncSymptomLogs() {
      const logs = this.localSymptomLogs.filter((l) => !l.synced)

      for (const log of logs) {
        try {
          // 这里会调用相应的云函数
          log.synced = true
        } catch (error) {
          console.error('Failed to sync symptom log:', error)
        }
      }

      localStorage.setItem('offline_symptomLogs', JSON.stringify(this.localSymptomLogs))
    },

    // 强制同步
    forceSyncData() {
      this.syncOfflineData()
    },

    // 导出本地数据
    exportLocalData() {
      const allData = {
        healthRecords: this.localHealthRecords,
        medicationLogs: this.localMedicationLogs,
        symptomLogs: this.localSymptomLogs,
        medications: this.offlineMedications,
        exportDate: new Date().toISOString(),
      }

      const dataStr = JSON.stringify(allData, null, 2)
      const blob = new Blob([dataStr], { type: 'application/json' })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `health_data_export_${new Date().toISOString().split('T')[0]}.json`
      link.click()
      window.URL.revokeObjectURL(url)
    },

    // 清除本地数据
    clearLocalData() {
      if (confirm('Are you sure you want to clear all local data? This cannot be undone.')) {
        localStorage.removeItem('offline_healthRecords')
        localStorage.removeItem('offline_medicationLogs')
        localStorage.removeItem('offline_symptomLogs')
        localStorage.removeItem('offline_medications')
        this.updatePendingSync()
        alert('Local data cleared successfully!')
      }
    },

    // 更新待同步数量
    updatePendingSync() {
      const unsyncedHealth = this.localHealthRecords.filter((r) => !r.synced).length
      const unsyncedMedication = this.localMedicationLogs.filter((l) => !l.synced).length
      const unsyncedSymptoms = this.localSymptomLogs.filter((l) => !l.synced).length
      this.pendingSync = unsyncedHealth + unsyncedMedication + unsyncedSymptoms
    },

    // 获取存储使用量
    getStorageUsed() {
      let total = 0
      for (let key in localStorage) {
        if (key.startsWith('offline_')) {
          total += localStorage[key].length
        }
      }
      return total
    },

    // 格式化存储大小
    formatStorageSize(bytes) {
      if (bytes < 1024) return bytes + ' B'
      else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB'
      else return (bytes / 1048576).toFixed(1) + ' MB'
    },

    // 检查存储空间
    checkStorageSpace() {
      const used = this.getStorageUsed()
      const limit = 5 * 1024 * 1024 // 5MB 限制

      if (used > limit * 0.8) {
        alert('Storage space is running low. Consider clearing old data or syncing to cloud.')
      }
    },

    // 设置药物提醒
    setupMedicationReminders() {
      // 简化实现 - 在实际项目中会使用 Service Worker 或通知 API
      setInterval(() => {
        const now = new Date()
        if (now.getHours() === 9 && now.getMinutes() === 0) {
          this.showMedicationReminder()
        }
      }, 60000)
    },

    // 显示药物提醒
    showMedicationReminder() {
      const untakenMeds = this.offlineMedications.filter((m) => !m.takenToday)
      if (untakenMeds.length > 0) {
        alert(`Reminder: You have ${untakenMeds.length} medication(s) to take today.`)
      }
    },

    // 保存离线设置
    saveOfflineSettings() {
      localStorage.setItem('offlineSettings', JSON.stringify(this.offlineSettings))
      alert('Offline settings saved!')
    },

    // 加载离线设置
    loadOfflineSettings() {
      const saved = localStorage.getItem('offlineSettings')
      if (saved) {
        this.offlineSettings = { ...this.offlineSettings, ...JSON.parse(saved) }
      }
    },

    // 格式化时间
    formatTime(timestamp) {
      return new Date(timestamp).toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    },
  },

  beforeUnmount() {
    window.removeEventListener('online', this.handleOnline)
    window.removeEventListener('offline', this.handleOffline)
  },
}
</script>

<style scoped>
.offline-features {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.connection-status {
  position: sticky;
  top: 0;
  background: white;
  border-radius: 8px;
  padding: 12px 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
  z-index: 100;
  border: 2px solid #28a745;
}

.connection-status.offline {
  border-color: #ffc107;
  background: #fff3cd;
}

.connection-status.syncing {
  border-color: #007bff;
  background: #cce7ff;
}

.status-indicator {
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: bold;
}

.status-icon {
  font-size: 18px;
}

.sync-spinner {
  animation: spin 2s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.pending-sync {
  font-size: 12px;
  color: #666;
  margin-top: 4px;
}

.offline-panel {
  display: flex;
  flex-direction: column;
  gap: 30px;
}

.offline-panel h3 {
  color: #2c3e50;
  margin-bottom: 20px;
  text-align: center;
}

.offline-section {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.offline-section h4 {
  color: #2c3e50;
  margin-bottom: 10px;
}

.offline-section p {
  color: #666;
  margin-bottom: 20px;
}

.health-data-form .form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
  margin-bottom: 15px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  font-weight: bold;
  color: #2c3e50;
}

.form-input {
  padding: 10px;
  border: 2px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
}

.form-input:focus {
  outline: none;
  border-color: #007bff;
}

.bp-inputs {
  display: flex;
  align-items: center;
  gap: 8px;
}

.bp-input {
  flex: 1;
}

.medication-tracker {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.medication-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.medication-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  background: #f8f9fa;
}

.medication-item.taken {
  background: #d4edda;
  border-color: #c3e6cb;
}

.medication-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.dosage,
.schedule {
  font-size: 12px;
  color: #666;
}

.add-medication h5 {
  color: #2c3e50;
  margin-bottom: 10px;
}

.symptom-logger {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.severity-scale {
  display: flex;
  align-items: center;
  gap: 10px;
}

.severity-slider {
  flex: 1;
}

.severity-value {
  font-weight: bold;
  color: #007bff;
  min-width: 20px;
  text-align: center;
}

.symptom-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-height: 300px;
  overflow-y: auto;
}

.symptom-item {
  display: flex;
  gap: 10px;
  padding: 10px;
  border: 1px solid #dee2e6;
  border-radius: 6px;
  background: #f8f9fa;
}

.symptom-time {
  font-size: 12px;
  color: #666;
  min-width: 80px;
}

.symptom-details {
  flex: 1;
}

.symptom-details .severity {
  font-size: 12px;
  color: #e74c3c;
  font-weight: bold;
}

.symptom-details .description {
  margin: 5px 0 0 0;
  font-size: 14px;
  color: #666;
}

.storage-stats {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 15px;
  margin-bottom: 20px;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  padding: 10px;
  background: #f8f9fa;
  border-radius: 6px;
}

.stat-label {
  color: #666;
}

.stat-value {
  font-weight: bold;
  color: #2c3e50;
}

.storage-actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.offline-settings {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.setting-item {
  display: flex;
  align-items: center;
  gap: 10px;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.sync-status-modal {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: white;
  border-radius: 12px;
  padding: 30px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  z-index: 1000;
  min-width: 300px;
}

.sync-content h4 {
  color: #2c3e50;
  margin-bottom: 20px;
  text-align: center;
}

.sync-progress {
  margin-bottom: 20px;
}

.progress-bar {
  width: 100%;
  height: 8px;
  background: #e9ecef;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 10px;
}

.progress-fill {
  height: 100%;
  background: #007bff;
  transition: width 0.5s ease;
}

.btn {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}

.btn-primary {
  background: #007bff;
  color: white;
}

.btn-secondary {
  background: #6c757d;
  color: white;
}

.btn-success {
  background: #28a745;
  color: white;
}

.btn-danger {
  background: #dc3545;
  color: white;
}

.btn-outline {
  background: transparent;
  border: 1px solid #6c757d;
  color: #6c757d;
}

.btn-sm {
  padding: 4px 8px;
  font-size: 12px;
}

.btn:hover:not(:disabled) {
  opacity: 0.9;
  transform: translateY(-1px);
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .health-data-form .form-row {
    grid-template-columns: 1fr;
  }

  .symptom-logger {
    grid-template-columns: 1fr;
  }

  .storage-stats {
    grid-template-columns: 1fr;
  }

  .storage-actions {
    flex-direction: column;
  }
}
</style>

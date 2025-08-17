<template>
  <div class="data-export-page" id="main-content">
    <div class="export-header">
      <h1 tabindex="-1">📤 Data Export Center</h1>
      <p class="page-description">
        Export your health data, reports, and analytics in various formats.
      </p>
    </div>

    <!-- 快速导出选项 -->
    <div class="quick-exports">
      <h2>🚀 Quick Exports</h2>
      <div class="export-grid">
        <div class="export-card">
          <div class="export-icon">📊</div>
          <h3>Health Summary Report</h3>
          <p>Comprehensive health overview with charts and insights</p>
          <div class="export-actions">
            <button @click="exportHealthSummary('pdf')" class="btn btn-primary">
              📄 PDF Report
            </button>
            <button @click="exportHealthSummary('csv')" class="btn btn-secondary">
              📈 CSV Data
            </button>
          </div>
        </div>

        <div class="export-card">
          <div class="export-icon">💊</div>
          <h3>Medication History</h3>
          <p>Complete medication logs and adherence records</p>
          <div class="export-actions">
            <button @click="exportMedicationHistory()" class="btn btn-primary">
              📋 Export List
            </button>
          </div>
        </div>

        <div class="export-card">
          <div class="export-icon">📅</div>
          <h3>Appointment Records</h3>
          <p>All your medical appointments and visit history</p>
          <div class="export-actions">
            <button @click="exportAppointments()" class="btn btn-primary">
              📆 Export Calendar
            </button>
          </div>
        </div>

        <div class="export-card">
          <div class="export-icon">📝</div>
          <h3>Symptom Journal</h3>
          <p>Your symptom tracking and health observations</p>
          <div class="export-actions">
            <button @click="exportSymptomJournal()" class="btn btn-primary">
              📓 Export Journal
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 自定义导出 -->
    <div class="custom-export">
      <h2>⚙️ Custom Export</h2>
      <div class="export-form">
        <div class="form-section">
          <h3>Select Data Types</h3>
          <div class="checkbox-group">
            <label class="checkbox-label">
              <input type="checkbox" v-model="customExport.includeVitals" />
              <span class="checkmark"></span>
              Vital Signs Data
            </label>
            <label class="checkbox-label">
              <input type="checkbox" v-model="customExport.includeMedications" />
              <span class="checkmark"></span>
              Medication Records
            </label>
            <label class="checkbox-label">
              <input type="checkbox" v-model="customExport.includeSymptoms" />
              <span class="checkmark"></span>
              Symptom Logs
            </label>
            <label class="checkbox-label">
              <input type="checkbox" v-model="customExport.includeAppointments" />
              <span class="checkmark"></span>
              Appointment History
            </label>
            <label class="checkbox-label">
              <input type="checkbox" v-model="customExport.includeActivities" />
              <span class="checkmark"></span>
              Activity Tracking
            </label>
          </div>
        </div>

        <div class="form-section">
          <h3>Date Range</h3>
          <div class="date-range">
            <div class="form-group">
              <label for="start-date">From Date</label>
              <input
                id="start-date"
                type="date"
                v-model="customExport.startDate"
                class="form-input"
              />
            </div>
            <div class="form-group">
              <label for="end-date">To Date</label>
              <input id="end-date" type="date" v-model="customExport.endDate" class="form-input" />
            </div>
          </div>
        </div>

        <div class="form-section">
          <h3>Export Format</h3>
          <div class="radio-group">
            <label class="radio-label">
              <input type="radio" v-model="customExport.format" value="pdf" />
              <span class="radio-mark"></span>
              PDF Report (Formatted)
            </label>
            <label class="radio-label">
              <input type="radio" v-model="customExport.format" value="csv" />
              <span class="radio-mark"></span>
              CSV Data (Spreadsheet)
            </label>
            <label class="radio-label">
              <input type="radio" v-model="customExport.format" value="json" />
              <span class="radio-mark"></span>
              JSON Data (Raw)
            </label>
          </div>
        </div>

        <div class="form-actions">
          <button
            @click="generateCustomExport"
            class="btn btn-primary btn-large"
            :disabled="!isCustomExportValid || exporting"
          >
            {{ exporting ? '⏳ Generating...' : '🎯 Generate Custom Export' }}
          </button>
        </div>
      </div>
    </div>

    <!-- 管理员专用导出 -->
    <div v-if="isAdmin" class="admin-exports">
      <h2>👨‍💼 Administrator Exports</h2>
      <div class="admin-export-grid">
        <div class="export-card admin">
          <div class="export-icon">👥</div>
          <h3>User Management Report</h3>
          <p>Complete user list with roles and activity</p>
          <button @click="exportUserReport()" class="btn btn-danger">🔒 Export Users</button>
        </div>

        <div class="export-card admin">
          <div class="export-icon">📈</div>
          <h3>System Analytics</h3>
          <p>Platform usage and performance metrics</p>
          <button @click="exportSystemAnalytics()" class="btn btn-danger">
            📊 Export Analytics
          </button>
        </div>

        <div class="export-card admin">
          <div class="export-icon">🔌</div>
          <h3>API Usage Report</h3>
          <p>API endpoint usage and performance data</p>
          <button @click="exportAPIReport()" class="btn btn-danger">🔍 Export API Data</button>
        </div>
      </div>
    </div>

    <!-- 导出历史 -->
    <div class="export-history">
      <h2>📋 Export History</h2>
      <div class="history-table">
        <table class="export-history-table">
          <thead>
            <tr>
              <th>Export Type</th>
              <th>Date</th>
              <th>Format</th>
              <th>Size</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="export_ in exportHistory" :key="export_.id" class="history-row">
              <td>{{ export_.type }}</td>
              <td>{{ formatDate(export_.date) }}</td>
              <td>
                <span class="format-badge" :class="export_.format">
                  {{ export_.format.toUpperCase() }}
                </span>
              </td>
              <td>{{ export_.size }}</td>
              <td>
                <span class="status-badge" :class="export_.status">
                  {{ export_.status }}
                </span>
              </td>
              <td>
                <button
                  v-if="export_.status === 'completed'"
                  @click="downloadExport(export_)"
                  class="btn btn-sm btn-secondary"
                >
                  📥 Download
                </button>
                <button @click="deleteExport(export_)" class="btn btn-sm btn-outline">
                  🗑️ Delete
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- 导出选项和帮助 -->
    <div class="export-help">
      <h2>❓ Export Information</h2>
      <div class="help-grid">
        <div class="help-card">
          <h3>📄 PDF Reports</h3>
          <ul>
            <li>Formatted reports with charts and graphs</li>
            <li>Ideal for sharing with healthcare providers</li>
            <li>Includes visual data representation</li>
            <li>Professional medical report format</li>
          </ul>
        </div>

        <div class="help-card">
          <h3>📈 CSV Data Files</h3>
          <ul>
            <li>Raw data for spreadsheet analysis</li>
            <li>Compatible with Excel and Google Sheets</li>
            <li>Allows custom data manipulation</li>
            <li>Suitable for personal tracking</li>
          </ul>
        </div>

        <div class="help-card">
          <h3>🔒 Privacy & Security</h3>
          <ul>
            <li>All exports are encrypted and secure</li>
            <li>Data is automatically deleted after 30 days</li>
            <li>Only you can access your export files</li>
            <li>HIPAA compliant data handling</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { authStore } from '../stores/auth.js'
import { exportHealthReport, exportUserList, exportCSV } from '../services/exportService.js'

export default {
  name: 'DataExportPage',
  inject: ['globalState'],

  data() {
    return {
      exporting: false,
      customExport: {
        includeVitals: true,
        includeMedications: true,
        includeSymptoms: false,
        includeAppointments: true,
        includeActivities: false,
        startDate: this.getDateDaysAgo(90), // 默认90天前
        endDate: new Date().toISOString().split('T')[0], // 今天
        format: 'pdf',
      },
      exportHistory: [
        {
          id: 1,
          type: 'Health Summary Report',
          date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          format: 'pdf',
          size: '2.4 MB',
          status: 'completed',
        },
        {
          id: 2,
          type: 'Medication History',
          date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
          format: 'csv',
          size: '156 KB',
          status: 'completed',
        },
        {
          id: 3,
          type: 'Custom Export',
          date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          format: 'json',
          size: '890 KB',
          status: 'expired',
        },
      ],
    }
  },

  computed: {
    isAdmin() {
      return authStore.isAdmin()
    },

    isCustomExportValid() {
      const hasDataSelected = Object.values(this.customExport)
        .slice(0, 5) // 只检查前5个布尔值
        .some((value) => value === true)

      const hasValidDateRange =
        this.customExport.startDate &&
        this.customExport.endDate &&
        this.customExport.startDate <= this.customExport.endDate

      return hasDataSelected && hasValidDateRange && this.customExport.format
    },
  },

  methods: {
    async exportHealthSummary(format) {
      this.exporting = true

      try {
        const patientData = {
          name: authStore.getCurrentUser()?.name || 'Patient',
          age: 67,
          email: authStore.getCurrentUser()?.email,
        }

        const reportData = {
          vitals: [
            { metric: 'Blood Pressure', value: '128/82', unit: 'mmHg', status: 'Normal' },
            { metric: 'Heart Rate', value: '74', unit: 'BPM', status: 'Normal' },
            { metric: 'Weight', value: '68.5', unit: 'kg', status: 'Target Range' },
          ],
          recommendations: 'Continue current medication routine, improve sleep schedule.',
        }

        if (format === 'pdf') {
          const result = await exportHealthReport(patientData, reportData)
          this.showExportResult(result, 'Health Summary PDF')
        } else {
          const result = exportCSV(
            reportData.vitals,
            [
              { key: 'metric', label: 'Metric' },
              { key: 'value', label: 'Value' },
              { key: 'unit', label: 'Unit' },
              { key: 'status', label: 'Status' },
            ],
            'health_summary.csv',
          )
          this.showExportResult(result, 'Health Summary CSV')
        }
      } catch (error) {
        console.error('Export failed:', error)
        alert('Export failed. Please try again.')
      } finally {
        this.exporting = false
      }
    },

    exportMedicationHistory() {
      // 模拟药物历史导出
      const medications = [
        { name: 'Lisinopril', dosage: '10mg', frequency: 'Daily', startDate: '2025-01-01' },
        { name: 'Metformin', dosage: '500mg', frequency: 'Twice daily', startDate: '2025-02-15' },
      ]

      const result = exportCSV(
        medications,
        [
          { key: 'name', label: 'Medication' },
          { key: 'dosage', label: 'Dosage' },
          { key: 'frequency', label: 'Frequency' },
          { key: 'startDate', label: 'Start Date', type: 'date' },
        ],
        'medication_history.csv',
      )

      this.showExportResult(result, 'Medication History')
    },

    exportAppointments() {
      // 模拟预约记录导出
      const appointments = [
        { date: '2025-08-20', time: '10:00', doctor: 'Dr. Smith', type: 'Checkup' },
        { date: '2025-07-15', time: '14:30', doctor: 'Dr. Johnson', type: 'Follow-up' },
      ]

      const result = exportCSV(
        appointments,
        [
          { key: 'date', label: 'Date', type: 'date' },
          { key: 'time', label: 'Time' },
          { key: 'doctor', label: 'Healthcare Provider' },
          { key: 'type', label: 'Appointment Type' },
        ],
        'appointments.csv',
      )

      this.showExportResult(result, 'Appointment Records')
    },

    exportSymptomJournal() {
      // 模拟症状日志导出
      const symptoms = [
        { date: '2025-08-15', symptom: 'Headache', severity: 6, notes: 'Mild tension headache' },
        { date: '2025-08-10', symptom: 'Fatigue', severity: 4, notes: 'After long walk' },
      ]

      const result = exportCSV(
        symptoms,
        [
          { key: 'date', label: 'Date', type: 'date' },
          { key: 'symptom', label: 'Symptom' },
          { key: 'severity', label: 'Severity (1-10)', type: 'number' },
          { key: 'notes', label: 'Notes' },
        ],
        'symptom_journal.csv',
      )

      this.showExportResult(result, 'Symptom Journal')
    },

    async generateCustomExport() {
      this.exporting = true

      try {
        // 收集选中的数据类型
        const exportData = {}

        if (this.customExport.includeVitals) {
          exportData.vitals = [
            { date: '2025-08-15', bloodPressure: '128/82', heartRate: 74, weight: 68.5 },
          ]
        }

        if (this.customExport.includeMedications) {
          exportData.medications = [
            { name: 'Lisinopril', dosage: '10mg', taken: true, date: '2025-08-15' },
          ]
        }

        // 根据格式生成导出
        if (this.customExport.format === 'json') {
          this.downloadJSON(exportData, 'custom_health_export.json')
        } else if (this.customExport.format === 'csv') {
          // 为每个数据类型创建单独的CSV
          Object.keys(exportData).forEach((dataType) => {
            const columns = Object.keys(exportData[dataType][0] || {}).map((key) => ({
              key,
              label: key.charAt(0).toUpperCase() + key.slice(1),
            }))
            exportCSV(exportData[dataType], columns, `${dataType}.csv`)
          })
        } else {
          // PDF格式
          alert('Custom PDF export would generate a comprehensive report')
        }

        this.showExportResult({ success: true }, 'Custom Export')
      } catch (error) {
        console.error('Custom export failed:', error)
        alert('Custom export failed. Please try again.')
      } finally {
        this.exporting = false
      }
    },

    async exportUserReport() {
      if (!this.isAdmin) return

      const result = await exportUserList(this.globalState.users)
      this.showExportResult(result, 'User Management Report')
    },

    exportSystemAnalytics() {
      alert('System analytics export would generate comprehensive platform usage data')
    },

    exportAPIReport() {
      alert('API usage report would export detailed endpoint usage statistics')
    },

    downloadExport(exportItem) {
      alert(`Downloading ${exportItem.type} (${exportItem.format.toUpperCase()})`)
    },

    deleteExport(exportItem) {
      if (confirm(`Delete ${exportItem.type}?`)) {
        const index = this.exportHistory.findIndex((e) => e.id === exportItem.id)
        if (index !== -1) {
          this.exportHistory.splice(index, 1)
        }
      }
    },

    downloadJSON(data, filename) {
      const jsonString = JSON.stringify(data, null, 2)
      const blob = new Blob([jsonString], { type: 'application/json' })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = filename
      link.click()
      window.URL.revokeObjectURL(url)
    },

    showExportResult(result, exportType) {
      if (result.success) {
        alert(`${exportType} exported successfully!`)
        // 在实际项目中，这里会添加到导出历史
      } else {
        alert(`${exportType} export failed: ${result.message}`)
      }
    },

    getDateDaysAgo(days) {
      const date = new Date()
      date.setDate(date.getDate() - days)
      return date.toISOString().split('T')[0]
    },

    formatDate(date) {
      return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    },
  },
}
</script>

<style scoped>
.data-export-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 40px;
}

.export-header {
  text-align: center;
  margin-bottom: 20px;
}

.export-header h1 {
  color: #2c3e50;
  margin-bottom: 10px;
}

.page-description {
  color: #666;
  font-size: 18px;
  max-width: 600px;
  margin: 0 auto;
}

.quick-exports h2,
.custom-export h2,
.admin-exports h2,
.export-history h2,
.export-help h2 {
  color: #2c3e50;
  margin-bottom: 20px;
}

.export-grid,
.admin-export-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
}

.export-card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  text-align: center;
  transition: transform 0.3s ease;
}

.export-card:hover {
  transform: translateY(-2px);
}

.export-card.admin {
  border-left: 4px solid #dc3545;
}

.export-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.export-card h3 {
  color: #2c3e50;
  margin-bottom: 12px;
}

.export-card p {
  color: #666;
  margin-bottom: 20px;
  line-height: 1.5;
}

.export-actions {
  display: flex;
  gap: 10px;
  justify-content: center;
  flex-wrap: wrap;
}

.custom-export {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.export-form {
  display: flex;
  flex-direction: column;
  gap: 30px;
}

.form-section h3 {
  color: #2c3e50;
  margin-bottom: 16px;
}

.checkbox-group,
.radio-group {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.checkbox-label,
.radio-label {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  color: #2c3e50;
}

.checkmark,
.radio-mark {
  width: 20px;
  height: 20px;
  border: 2px solid #ddd;
  border-radius: 4px;
  position: relative;
}

.radio-mark {
  border-radius: 50%;
}

input[type='checkbox']:checked + .checkmark::after {
  content: '✓';
  position: absolute;
  top: -2px;
  left: 2px;
  color: #007bff;
  font-weight: bold;
}

input[type='radio']:checked + .radio-mark::after {
  content: '';
  position: absolute;
  top: 4px;
  left: 4px;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #007bff;
}

.date-range {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
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
  padding: 12px;
  border: 2px solid #ddd;
  border-radius: 6px;
  font-size: 16px;
}

.form-input:focus {
  outline: none;
  border-color: #007bff;
}

.form-actions {
  text-align: center;
}

.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: bold;
  transition: all 0.3s ease;
}

.btn-large {
  padding: 16px 32px;
  font-size: 16px;
}

.btn-primary {
  background: #007bff;
  color: white;
}

.btn-secondary {
  background: #6c757d;
  color: white;
}

.btn-danger {
  background: #dc3545;
  color: white;
}

.btn-outline {
  background: transparent;
  border: 2px solid #6c757d;
  color: #6c757d;
}

.btn-sm {
  padding: 6px 12px;
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

.export-history-table {
  width: 100%;
  border-collapse: collapse;
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.export-history-table th,
.export-history-table td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid #dee2e6;
}

.export-history-table th {
  background: #f8f9fa;
  font-weight: bold;
  color: #2c3e50;
}

.format-badge,
.status-badge {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: bold;
  text-transform: uppercase;
}

.format-badge.pdf {
  background: #dc3545;
  color: white;
}

.format-badge.csv {
  background: #28a745;
  color: white;
}

.format-badge.json {
  background: #ffc107;
  color: #212529;
}

.status-badge.completed {
  background: #d4edda;
  color: #155724;
}

.status-badge.expired {
  background: #f8d7da;
  color: #721c24;
}

.help-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
}

.help-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.help-card h3 {
  color: #2c3e50;
  margin-bottom: 16px;
}

.help-card ul {
  list-style: none;
  padding: 0;
}

.help-card li {
  padding: 8px 0;
  border-bottom: 1px solid #f0f0f0;
  color: #666;
}

.help-card li:before {
  content: '✓';
  color: #28a745;
  font-weight: bold;
  margin-right: 8px;
}

@media (max-width: 768px) {
  .export-grid,
  .admin-export-grid {
    grid-template-columns: 1fr;
  }

  .date-range {
    grid-template-columns: 1fr;
  }

  .export-actions {
    flex-direction: column;
  }

  .help-grid {
    grid-template-columns: 1fr;
  }
}
</style>

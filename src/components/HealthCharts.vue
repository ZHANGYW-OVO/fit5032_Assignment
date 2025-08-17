<template>
  <div class="health-charts-container">
    <div class="charts-header">
      <h3>📊 Health Analytics Dashboard</h3>
      <div class="chart-controls">
        <select v-model="selectedTimeRange" @change="updateCharts" class="time-range-select">
          <option value="7">Last 7 days</option>
          <option value="30">Last 30 days</option>
          <option value="90">Last 3 months</option>
          <option value="365">Last year</option>
        </select>
        <button @click="refreshData" class="btn btn-secondary" :disabled="loading">
          {{ loading ? '🔄 Refreshing...' : '🔄 Refresh' }}
        </button>
      </div>
    </div>

    <!-- 健康指标概览卡片 -->
    <div class="metrics-overview">
      <div class="metric-card" v-for="metric in healthMetrics" :key="metric.id">
        <div class="metric-icon">{{ metric.icon }}</div>
        <div class="metric-info">
          <h4>{{ metric.value }}</h4>
          <p>{{ metric.label }}</p>
          <span
            class="metric-trend"
            :class="{ positive: metric.trend > 0, negative: metric.trend < 0 }"
          >
            {{ metric.trend > 0 ? '↗️' : metric.trend < 0 ? '↘️' : '➖' }}
            {{ Math.abs(metric.trend) }}%
          </span>
        </div>
      </div>
    </div>

    <!-- 图表网格 -->
    <div class="charts-grid">
      <!-- 血压趋势图 -->
      <div class="chart-container">
        <div class="chart-header">
          <h4>🩺 Blood Pressure Trends</h4>
          <div class="chart-legend">
            <span class="legend-item systolic">● Systolic</span>
            <span class="legend-item diastolic">● Diastolic</span>
          </div>
        </div>
        <div class="chart-wrapper">
          <canvas ref="bloodPressureChart" class="chart-canvas"></canvas>
        </div>
      </div>

      <!-- 心率变化图 -->
      <div class="chart-container">
        <div class="chart-header">
          <h4>❤️ Heart Rate Monitoring</h4>
          <span class="chart-info">BPM over time</span>
        </div>
        <div class="chart-wrapper">
          <canvas ref="heartRateChart" class="chart-canvas"></canvas>
        </div>
      </div>

      <!-- 体重追踪图 -->
      <div class="chart-container">
        <div class="chart-header">
          <h4>⚖️ Weight Progress</h4>
          <span class="chart-info">Target: {{ weightTarget }}kg</span>
        </div>
        <div class="chart-wrapper">
          <canvas ref="weightChart" class="chart-canvas"></canvas>
        </div>
      </div>

      <!-- 活动统计饼图 -->
      <div class="chart-container">
        <div class="chart-header">
          <h4>🚶 Daily Activity Breakdown</h4>
          <span class="chart-info">Average daily distribution</span>
        </div>
        <div class="chart-wrapper">
          <canvas ref="activityChart" class="chart-canvas"></canvas>
        </div>
      </div>

      <!-- 药物依从性图 -->
      <div class="chart-container">
        <div class="chart-header">
          <h4>💊 Medication Adherence</h4>
          <span class="chart-info">Weekly compliance rate</span>
        </div>
        <div class="chart-wrapper">
          <canvas ref="medicationChart" class="chart-canvas"></canvas>
        </div>
      </div>

      <!-- 睡眠质量图 -->
      <div class="chart-container">
        <div class="chart-header">
          <h4>😴 Sleep Quality Analysis</h4>
          <span class="chart-info">Hours and quality rating</span>
        </div>
        <div class="chart-wrapper">
          <canvas ref="sleepChart" class="chart-canvas"></canvas>
        </div>
      </div>
    </div>

    <!-- 健康洞察面板 -->
    <div class="insights-panel">
      <h4>🔍 AI Health Insights</h4>
      <div class="insights-list">
        <div
          v-for="insight in healthInsights"
          :key="insight.id"
          class="insight-item"
          :class="insight.severity"
        >
          <div class="insight-icon">{{ insight.icon }}</div>
          <div class="insight-content">
            <h5>{{ insight.title }}</h5>
            <p>{{ insight.description }}</p>
            <div class="insight-actions">
              <button class="btn btn-sm btn-primary" @click="viewInsightDetails(insight)">
                View Details
              </button>
              <button class="btn btn-sm btn-outline" @click="dismissInsight(insight.id)">
                Dismiss
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 导出和分享选项 -->
    <div class="export-panel">
      <h4>📤 Export & Share</h4>
      <div class="export-actions">
        <button @click="exportHealthReport" class="btn btn-primary">
          📄 Download Health Report
        </button>
        <button @click="shareWithDoctor" class="btn btn-secondary">👨‍⚕️ Share with Doctor</button>
        <button @click="exportChartData" class="btn btn-outline">📊 Export Chart Data</button>
      </div>
    </div>
  </div>
</template>

<script>
// 正确导入Chart.js - 包含所有必需的控制器
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  LineController,
  BarController,
  DoughnutController,
} from 'chart.js'

// 注册Chart.js组件 - 包含所有控制器
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  LineController,
  BarController,
  DoughnutController,
)

export default {
  name: 'HealthCharts',
  data() {
    return {
      loading: false,
      selectedTimeRange: 30,
      weightTarget: 70,
      charts: {}, // 存储图表实例

      // 健康指标概览
      healthMetrics: [
        {
          id: 'bp',
          icon: '🩺',
          label: 'Blood Pressure',
          value: '128/82',
          trend: -2.3,
        },
        {
          id: 'hr',
          icon: '❤️',
          label: 'Avg Heart Rate',
          value: '74 BPM',
          trend: 1.2,
        },
        {
          id: 'weight',
          icon: '⚖️',
          label: 'Current Weight',
          value: '68.5 kg',
          trend: -1.8,
        },
        {
          id: 'steps',
          icon: '👟',
          label: 'Daily Steps',
          value: '8,240',
          trend: 5.6,
        },
      ],

      // AI健康洞察
      healthInsights: [
        {
          id: 1,
          title: 'Blood Pressure Improvement',
          description:
            'Your blood pressure has shown a consistent downward trend over the past 2 weeks. Keep up the good work with your medication routine!',
          icon: '✅',
          severity: 'positive',
        },
        {
          id: 2,
          title: 'Sleep Pattern Alert',
          description:
            "You've been getting less than 7 hours of sleep on average. Consider establishing a regular bedtime routine.",
          icon: '⚠️',
          severity: 'warning',
        },
        {
          id: 3,
          title: 'Activity Goal Achievement',
          description:
            "Congratulations! You've exceeded your daily step goal for 5 consecutive days.",
          icon: '🎉',
          severity: 'positive',
        },
      ],
    }
  },
  mounted() {
    this.initializeCharts()
    this.loadHealthData()
  },
  beforeUnmount() {
    // 清理图表实例
    Object.values(this.charts).forEach((chart) => {
      if (chart && typeof chart.destroy === 'function') {
        chart.destroy()
      }
    })
  },
  methods: {
    async initializeCharts() {
      try {
        // 等待DOM更新
        await this.$nextTick()

        // 创建所有图表
        this.createBloodPressureChart()
        this.createHeartRateChart()
        this.createWeightChart()
        this.createActivityChart()
        this.createMedicationChart()
        this.createSleepChart()

        console.log('✅ Charts initialized successfully')
      } catch (error) {
        console.error('❌ Failed to initialize charts:', error)
      }
    },

    createBloodPressureChart() {
      const ctx = this.$refs.bloodPressureChart
      if (!ctx) return

      // 清理现有图表
      if (this.charts.bloodPressure) {
        this.charts.bloodPressure.destroy()
      }

      const dates = this.generateDateLabels(this.selectedTimeRange)
      const systolicData = this.generateRandomData(120, 140, dates.length)
      const diastolicData = this.generateRandomData(75, 90, dates.length)

      this.charts.bloodPressure = new ChartJS(ctx, {
        type: 'line',
        data: {
          labels: dates,
          datasets: [
            {
              label: 'Systolic',
              data: systolicData,
              borderColor: '#e74c3c',
              backgroundColor: 'rgba(231, 76, 60, 0.1)',
              tension: 0.4,
            },
            {
              label: 'Diastolic',
              data: diastolicData,
              borderColor: '#3498db',
              backgroundColor: 'rgba(52, 152, 219, 0.1)',
              tension: 0.4,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: {
              beginAtZero: false,
              min: 60,
              max: 160,
            },
          },
          plugins: {
            legend: {
              display: false,
            },
          },
        },
      })
    },

    createHeartRateChart() {
      const ctx = this.$refs.heartRateChart
      if (!ctx) return

      if (this.charts.heartRate) {
        this.charts.heartRate.destroy()
      }

      const dates = this.generateDateLabels(this.selectedTimeRange)
      const heartRateData = this.generateRandomData(65, 85, dates.length)

      this.charts.heartRate = new ChartJS(ctx, {
        type: 'line',
        data: {
          labels: dates,
          datasets: [
            {
              label: 'Heart Rate (BPM)',
              data: heartRateData,
              borderColor: '#e74c3c',
              backgroundColor: 'rgba(231, 76, 60, 0.1)',
              tension: 0.4,
              fill: true,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: {
              beginAtZero: false,
              min: 50,
              max: 100,
            },
          },
          plugins: {
            legend: {
              display: false,
            },
          },
        },
      })
    },

    createWeightChart() {
      const ctx = this.$refs.weightChart
      if (!ctx) return

      if (this.charts.weight) {
        this.charts.weight.destroy()
      }

      const dates = this.generateDateLabels(this.selectedTimeRange)
      const weightData = this.generateWeightData(dates.length)

      this.charts.weight = new ChartJS(ctx, {
        type: 'line',
        data: {
          labels: dates,
          datasets: [
            {
              label: 'Weight (kg)',
              data: weightData,
              borderColor: '#27ae60',
              backgroundColor: 'rgba(39, 174, 96, 0.1)',
              tension: 0.4,
              fill: true,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: {
              beginAtZero: false,
              min: Math.min(...weightData) - 2,
              max: Math.max(...weightData) + 2,
            },
          },
          plugins: {
            legend: {
              display: false,
            },
          },
        },
      })
    },

    createActivityChart() {
      const ctx = this.$refs.activityChart
      if (!ctx) return

      if (this.charts.activity) {
        this.charts.activity.destroy()
      }

      this.charts.activity = new ChartJS(ctx, {
        type: 'doughnut',
        data: {
          labels: ['Walking', 'Exercise', 'Rest', 'Sleep'],
          datasets: [
            {
              data: [35, 15, 30, 20],
              backgroundColor: ['#3498db', '#e74c3c', '#f39c12', '#9b59b6'],
              borderWidth: 2,
              borderColor: '#fff',
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom',
              labels: {
                padding: 20,
                usePointStyle: true,
              },
            },
          },
        },
      })
    },

    createMedicationChart() {
      const ctx = this.$refs.medicationChart
      if (!ctx) return

      if (this.charts.medication) {
        this.charts.medication.destroy()
      }

      const weeks = ['Week 1', 'Week 2', 'Week 3', 'Week 4']
      const adherenceData = [95, 88, 92, 97]

      this.charts.medication = new ChartJS(ctx, {
        type: 'bar',
        data: {
          labels: weeks,
          datasets: [
            {
              label: 'Adherence %',
              data: adherenceData,
              backgroundColor: '#27ae60',
              borderColor: '#1e8449',
              borderWidth: 1,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: {
              beginAtZero: true,
              max: 100,
            },
          },
          plugins: {
            legend: {
              display: false,
            },
          },
        },
      })
    },

    createSleepChart() {
      const ctx = this.$refs.sleepChart
      if (!ctx) return

      if (this.charts.sleep) {
        this.charts.sleep.destroy()
      }

      const dates = this.generateDateLabels(7)
      const sleepHours = this.generateRandomData(6, 9, 7)
      const sleepQuality = this.generateRandomData(6, 10, 7)

      this.charts.sleep = new ChartJS(ctx, {
        type: 'bar',
        data: {
          labels: dates,
          datasets: [
            {
              label: 'Sleep Hours',
              data: sleepHours,
              backgroundColor: 'rgba(155, 89, 182, 0.6)',
              borderColor: '#9b59b6',
              borderWidth: 1,
              yAxisID: 'y',
            },
            {
              label: 'Quality (1-10)',
              data: sleepQuality,
              type: 'line',
              borderColor: '#f39c12',
              backgroundColor: 'rgba(243, 156, 18, 0.1)',
              tension: 0.4,
              yAxisID: 'y1',
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: {
              type: 'linear',
              display: true,
              position: 'left',
              max: 12,
            },
            y1: {
              type: 'linear',
              display: true,
              position: 'right',
              max: 10,
              grid: {
                drawOnChartArea: false,
              },
            },
          },
        },
      })
    },

    generateDateLabels(days) {
      const labels = []
      for (let i = days - 1; i >= 0; i--) {
        const date = new Date()
        date.setDate(date.getDate() - i)
        labels.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }))
      }
      return labels
    },

    generateRandomData(min, max, count) {
      return Array.from({ length: count }, () => Math.round(min + Math.random() * (max - min)))
    },

    generateWeightData(count) {
      const startWeight = 72
      const targetWeight = 68.5
      const data = []

      for (let i = 0; i < count; i++) {
        const progress = i / (count - 1)
        const weight = startWeight - (startWeight - targetWeight) * progress
        const fluctuation = (Math.random() - 0.5) * 0.5
        data.push(Math.round((weight + fluctuation) * 10) / 10)
      }

      return data
    },

    async updateCharts() {
      this.loading = true

      try {
        await new Promise((resolve) => setTimeout(resolve, 1000))
        await this.initializeCharts()
        console.log(`Charts updated for ${this.selectedTimeRange} days`)
      } catch (error) {
        console.error('Failed to update charts:', error)
      } finally {
        this.loading = false
      }
    },

    async refreshData() {
      this.loading = true

      try {
        await new Promise((resolve) => setTimeout(resolve, 800))

        this.healthMetrics.forEach((metric) => {
          metric.trend = (Math.random() - 0.5) * 10
        })

        // 重新创建图表以反映新数据
        await this.initializeCharts()

        console.log('Health data refreshed')
      } catch (error) {
        console.error('Failed to refresh data:', error)
      } finally {
        this.loading = false
      }
    },

    async loadHealthData() {
      console.log('Loading health data...')
    },

    viewInsightDetails(insight) {
      alert(
        `Insight Details:\n\n${insight.title}\n\n${insight.description}\n\nThis feature would show detailed analysis and recommendations.`,
      )
    },

    dismissInsight(insightId) {
      this.healthInsights = this.healthInsights.filter((insight) => insight.id !== insightId)
    },

    exportHealthReport() {
      const reportData = {
        patientName: 'Current User',
        date: new Date().toLocaleDateString(),
        reportType: 'Comprehensive Health Analysis',
        summary: 'Health metrics show overall positive trends with some areas for improvement.',
        recommendations:
          'Continue current medication routine, improve sleep schedule, maintain physical activity.',
        vitals: [
          { metric: 'Blood Pressure', value: '128/82', unit: 'mmHg', status: 'Normal' },
          { metric: 'Heart Rate', value: '74', unit: 'BPM', status: 'Normal' },
          { metric: 'Weight', value: '68.5', unit: 'kg', status: 'Target Range' },
        ],
      }

      console.log('Exporting health report:', reportData)
      alert('Health report export feature would generate a comprehensive PDF report.')
    },

    shareWithDoctor() {
      const shareData = {
        period: `${this.selectedTimeRange} days`,
        metrics: this.healthMetrics,
        insights: this.healthInsights,
      }

      console.log('Sharing with doctor:', shareData)
      alert('This feature would securely share your health data with your healthcare provider.')
    },

    exportChartData() {
      console.log('Exporting chart data to CSV')
      alert('Chart data export feature would download all health metrics as CSV files.')
    },
  },
}
</script>

<style scoped>
.health-charts-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 20px;
}

.charts-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  flex-wrap: wrap;
  gap: 15px;
}

.charts-header h3 {
  color: #2c3e50;
  margin: 0;
  font-size: 24px;
}

.chart-controls {
  display: flex;
  gap: 15px;
  align-items: center;
}

.time-range-select {
  padding: 8px 12px;
  border: 2px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
}

.metrics-overview {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.metric-card {
  background: white;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 15px;
}

.metric-icon {
  font-size: 32px;
  padding: 10px;
  background: #f8f9fa;
  border-radius: 50%;
}

.metric-info h4 {
  color: #2c3e50;
  margin: 0 0 5px 0;
  font-size: 18px;
}

.metric-info p {
  color: #666;
  margin: 0 0 5px 0;
  font-size: 14px;
}

.metric-trend {
  font-size: 12px;
  font-weight: bold;
}

.metric-trend.positive {
  color: #27ae60;
}

.metric-trend.negative {
  color: #e74c3c;
}

.charts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.chart-container {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  padding: 20px;
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  flex-wrap: wrap;
  gap: 10px;
}

.chart-header h4 {
  color: #2c3e50;
  margin: 0;
  font-size: 16px;
}

.chart-legend {
  display: flex;
  gap: 15px;
}

.legend-item {
  font-size: 12px;
  font-weight: bold;
}

.legend-item.systolic {
  color: #e74c3c;
}

.legend-item.diastolic {
  color: #3498db;
}

.chart-info {
  color: #666;
  font-size: 12px;
}

.chart-wrapper {
  height: 250px;
  position: relative;
}

.chart-canvas {
  max-width: 100%;
  max-height: 100%;
}

.insights-panel {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  padding: 20px;
  margin-bottom: 30px;
}

.insights-panel h4 {
  color: #2c3e50;
  margin-bottom: 20px;
}

.insights-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.insight-item {
  display: flex;
  gap: 15px;
  padding: 15px;
  border-radius: 8px;
  border-left: 4px solid #ddd;
}

.insight-item.positive {
  background: #f0f9f0;
  border-left-color: #27ae60;
}

.insight-item.warning {
  background: #fff9e6;
  border-left-color: #f39c12;
}

.insight-icon {
  font-size: 24px;
  flex-shrink: 0;
}

.insight-content {
  flex: 1;
}

.insight-content h5 {
  color: #2c3e50;
  margin: 0 0 8px 0;
  font-size: 14px;
}

.insight-content p {
  color: #666;
  margin: 0 0 10px 0;
  font-size: 13px;
  line-height: 1.4;
}

.insight-actions {
  display: flex;
  gap: 8px;
}

.export-panel {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  padding: 20px;
}

.export-panel h4 {
  color: #2c3e50;
  margin-bottom: 15px;
}

.export-actions {
  display: flex;
  gap: 15px;
  flex-wrap: wrap;
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

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-primary {
  background: #007bff;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #0056b3;
}

.btn-secondary {
  background: #6c757d;
  color: white;
}

.btn-secondary:hover:not(:disabled) {
  background: #545b62;
}

.btn-outline {
  background: transparent;
  border: 2px solid #6c757d;
  color: #6c757d;
}

.btn-outline:hover:not(:disabled) {
  background: #6c757d;
  color: white;
}

.btn-sm {
  padding: 6px 12px;
  font-size: 12px;
}

@media (max-width: 768px) {
  .charts-header {
    flex-direction: column;
    align-items: stretch;
  }

  .chart-controls {
    justify-content: space-between;
  }

  .charts-grid {
    grid-template-columns: 1fr;
  }

  .metric-card {
    flex-direction: column;
    text-align: center;
  }

  .export-actions {
    flex-direction: column;
  }
}
</style>

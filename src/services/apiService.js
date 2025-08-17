// REST API 服务 - 对外提供健康数据接口
import { authStore } from '../stores/auth.js'

class APIService {
  constructor() {
    this.baseURL = '/api/v1'
    this.apiKeys = new Map() // 存储API密钥
    this.rateLimits = new Map() // 速率限制追踪
    this.setupAPIRoutes()
  }

  // 设置API路由
  setupAPIRoutes() {
    // 模拟API路由设置
    this.routes = {
      'GET /health-statistics': this.getHealthStatistics.bind(this),
      'GET /community-events': this.getCommunityEvents.bind(this),
      'GET /health-resources': this.getHealthResources.bind(this),
      'POST /health-data': this.submitHealthData.bind(this),
      'GET /appointment-slots': this.getAppointmentSlots.bind(this),
    }
  }

  // API密钥验证
  validateAPIKey(apiKey) {
    // 模拟API密钥验证
    const validKeys = ['hc_live_sk_12345abcdef', 'hc_test_sk_67890fedcba']
    return validKeys.includes(apiKey)
  }

  // 速率限制检查
  checkRateLimit(apiKey, endpoint) {
    const key = `${apiKey}_${endpoint}`
    const now = Date.now()
    const window = 60 * 1000 // 1分钟窗口
    const limit = 100 // 每分钟100请求

    if (!this.rateLimits.has(key)) {
      this.rateLimits.set(key, [])
    }

    const requests = this.rateLimits.get(key)
    // 清除过期请求
    const validRequests = requests.filter((time) => now - time < window)

    if (validRequests.length >= limit) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: Math.min(...validRequests) + window,
      }
    }

    validRequests.push(now)
    this.rateLimits.set(key, validRequests)

    return {
      allowed: true,
      remaining: limit - validRequests.length,
      resetTime: now + window,
    }
  }

  // 处理API请求
  async handleAPIRequest(method, path, headers, body = null) {
    try {
      // 验证API密钥
      const apiKey = headers['x-api-key'] || headers['authorization']?.replace('Bearer ', '')
      if (!apiKey || !this.validateAPIKey(apiKey)) {
        return this.createErrorResponse(401, 'Invalid API key')
      }

      // 检查速率限制
      const rateLimit = this.checkRateLimit(apiKey, path)
      if (!rateLimit.allowed) {
        return this.createErrorResponse(429, 'Rate limit exceeded', {
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': rateLimit.resetTime.toString(),
        })
      }

      // 路由请求
      const routeKey = `${method} ${path}`
      const handler = this.routes[routeKey]

      if (!handler) {
        return this.createErrorResponse(404, 'Endpoint not found')
      }

      // 解析请求参数
      const queryParams = this.parseQueryParams(path)
      const requestData = {
        method,
        path,
        headers,
        body: body ? JSON.parse(body) : null,
        query: queryParams,
        apiKey,
      }

      // 执行处理函数
      const result = await handler(requestData)

      // 添加速率限制头部
      const responseHeaders = {
        'X-RateLimit-Remaining': rateLimit.remaining.toString(),
        'X-RateLimit-Reset': rateLimit.resetTime.toString(),
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-API-Key',
      }

      return {
        status: 200,
        headers: responseHeaders,
        body: JSON.stringify({
          success: true,
          data: result,
          timestamp: new Date().toISOString(),
          version: 'v1',
        }),
      }
    } catch (error) {
      console.error('API request failed:', error)
      return this.createErrorResponse(500, 'Internal server error')
    }
  }

  // 获取健康统计数据 API
  async getHealthStatistics(request) {
    const { query } = request
    const timeRange = query.timeRange || '30days'
    const includeDetails = query.details === 'true'

    // 模拟健康统计数据
    const statistics = {
      summary: {
        totalUsers: 1250,
        activeUsers: 945,
        totalHealthRecords: 15430,
        averageAge: 67.5,
        mostCommonConditions: ['Hypertension', 'Diabetes', 'Heart Disease'],
      },
      demographics: {
        ageGroups: {
          '60-65': 285,
          '66-70': 412,
          '71-75': 338,
          '76-80': 156,
          '80+': 59,
        },
        gender: {
          male: 528,
          female: 645,
          other: 77,
        },
      },
      healthMetrics: {
        averageBloodPressure: {
          systolic: 128.5,
          diastolic: 82.3,
        },
        averageHeartRate: 73.8,
        medicationAdherence: 0.87, // 87%
        appointmentAttendance: 0.92, // 92%
      },
      trends: {
        timeRange,
        healthImprovement: 0.15, // 15% improvement
        engagementIncrease: 0.23, // 23% increase
        riskReduction: 0.18, // 18% risk reduction
      },
    }

    if (!includeDetails) {
      delete statistics.demographics
      delete statistics.trends
    }

    return statistics
  }

  // 获取社区活动 API
  async getCommunityEvents(request) {
    const { query } = request
    const limit = parseInt(query.limit) || 10
    const startDate = query.startDate || new Date().toISOString().split('T')[0]
    const category = query.category

    // 模拟社区活动数据
    let events = [
      {
        id: 1,
        title: 'Heart Health Workshop',
        description: 'Learn about maintaining cardiovascular health in your golden years',
        date: '2025-08-25',
        time: '10:00',
        location: 'Community Center Room A',
        category: 'education',
        maxParticipants: 30,
        currentParticipants: 18,
        instructor: 'Dr. Sarah Wilson',
        cost: 'Free',
        registrationRequired: true,
      },
      {
        id: 2,
        title: 'Gentle Yoga Class',
        description: 'Low-impact yoga session designed for seniors',
        date: '2025-08-27',
        time: '09:00',
        location: 'Wellness Center Studio 1',
        category: 'exercise',
        maxParticipants: 15,
        currentParticipants: 12,
        instructor: 'Maria Garcia',
        cost: '$10',
        registrationRequired: true,
      },
      {
        id: 3,
        title: 'Nutrition Seminar',
        description: 'Healthy eating strategies for active aging',
        date: '2025-08-30',
        time: '14:00',
        location: 'Health Center Auditorium',
        category: 'nutrition',
        maxParticipants: 50,
        currentParticipants: 35,
        instructor: 'Nutritionist John Lee',
        cost: 'Free',
        registrationRequired: false,
      },
      {
        id: 4,
        title: 'Medication Management Session',
        description: 'Tips for organizing and tracking your medications',
        date: '2025-09-02',
        time: '11:00',
        location: 'Pharmacy Conference Room',
        category: 'medication',
        maxParticipants: 20,
        currentParticipants: 8,
        instructor: 'Pharmacist Emma Chen',
        cost: 'Free',
        registrationRequired: true,
      },
    ]

    // 按日期过滤
    events = events.filter((event) => event.date >= startDate)

    // 按类别过滤
    if (category) {
      events = events.filter((event) => event.category === category)
    }

    // 限制返回数量
    events = events.slice(0, limit)

    return {
      events,
      totalCount: events.length,
      filters: {
        startDate,
        category,
        limit,
      },
      availableCategories: ['education', 'exercise', 'nutrition', 'medication', 'social'],
    }
  }

  // 获取健康资源 API
  async getHealthResources(request) {
    const { query } = request
    const category = query.category
    const limit = parseInt(query.limit) || 20
    const search = query.search
    const minRating = parseFloat(query.minRating) || 0

    // 模拟健康资源数据
    let resources = [
      {
        id: 1,
        title: 'Understanding Blood Pressure',
        content: 'Comprehensive guide to monitoring and managing blood pressure in seniors',
        category: 'Cardiovascular',
        author: 'Dr. Michael Johnson',
        publishDate: '2025-01-15',
        lastUpdated: '2025-08-01',
        rating: 4.7,
        reviewCount: 156,
        downloadCount: 1240,
        format: 'PDF',
        pages: 24,
        language: 'English',
        tags: ['blood pressure', 'monitoring', 'hypertension', 'seniors'],
        downloadUrl: '/resources/blood-pressure-guide.pdf',
      },
      {
        id: 2,
        title: 'Diabetes Self-Management',
        content: 'Complete toolkit for managing Type 2 diabetes through diet and lifestyle',
        category: 'Diabetes',
        author: 'Endocrinology Team',
        publishDate: '2025-02-20',
        lastUpdated: '2025-07-15',
        rating: 4.9,
        reviewCount: 203,
        downloadCount: 1580,
        format: 'Interactive PDF',
        pages: 36,
        language: 'English',
        tags: ['diabetes', 'diet', 'lifestyle', 'self-management'],
        downloadUrl: '/resources/diabetes-management.pdf',
      },
      {
        id: 3,
        title: 'Mental Health & Aging',
        content: 'Strategies for maintaining mental wellness and preventing depression',
        category: 'Mental Health',
        author: 'Dr. Lisa Rodriguez',
        publishDate: '2025-03-10',
        lastUpdated: '2025-08-10',
        rating: 4.5,
        reviewCount: 89,
        downloadCount: 670,
        format: 'Video Series',
        duration: '120 minutes',
        language: 'English',
        tags: ['mental health', 'depression', 'anxiety', 'aging'],
        downloadUrl: '/resources/mental-health-series',
      },
      {
        id: 4,
        title: 'Fall Prevention Guide',
        content: 'Home safety tips and exercises to prevent falls in elderly adults',
        category: 'Safety',
        author: 'Physical Therapy Department',
        publishDate: '2025-04-05',
        lastUpdated: '2025-07-20',
        rating: 4.6,
        reviewCount: 112,
        downloadCount: 890,
        format: 'PDF + Video',
        pages: 18,
        language: 'English',
        tags: ['fall prevention', 'home safety', 'exercises', 'balance'],
        downloadUrl: '/resources/fall-prevention-guide.pdf',
      },
    ]

    // 按类别过滤
    if (category) {
      resources = resources.filter(
        (resource) => resource.category.toLowerCase() === category.toLowerCase(),
      )
    }

    // 按搜索词过滤
    if (search) {
      const searchLower = search.toLowerCase()
      resources = resources.filter(
        (resource) =>
          resource.title.toLowerCase().includes(searchLower) ||
          resource.content.toLowerCase().includes(searchLower) ||
          resource.tags.some((tag) => tag.toLowerCase().includes(searchLower)),
      )
    }

    // 按评分过滤
    resources = resources.filter((resource) => resource.rating >= minRating)

    // 按评分排序
    resources.sort((a, b) => b.rating - a.rating)

    // 限制返回数量
    resources = resources.slice(0, limit)

    return {
      resources,
      totalCount: resources.length,
      filters: {
        category,
        search,
        minRating,
        limit,
      },
      availableCategories: [
        'Cardiovascular',
        'Diabetes',
        'Mental Health',
        'Safety',
        'Nutrition',
        'Exercise',
      ],
    }
  }

  // 提交健康数据 API
  async submitHealthData(request) {
    const { body, apiKey } = request

    // 验证数据格式
    if (!body || !body.patientId || !body.measurements) {
      throw new Error('Invalid health data format')
    }

    // 模拟数据验证和处理
    const healthData = {
      id: Date.now(),
      patientId: body.patientId,
      measurements: body.measurements,
      timestamp: new Date().toISOString(),
      source: 'api',
      apiKey: apiKey.substring(0, 10) + '...', // 隐藏完整API密钥
    }

    // 模拟数据存储
    console.log('Storing health data:', healthData)

    // 返回确认
    return {
      dataId: healthData.id,
      status: 'received',
      message: 'Health data processed successfully',
      processedMeasurements: Object.keys(body.measurements).length,
      nextSubmissionAllowed: new Date(Date.now() + 15 * 60 * 1000).toISOString(), // 15分钟后
    }
  }

  // 获取预约时段 API
  async getAppointmentSlots(request) {
    const { query } = request
    const doctorId = query.doctorId
    const date = query.date || new Date().toISOString().split('T')[0]
    const duration = parseInt(query.duration) || 30 // 默认30分钟

    if (!doctorId) {
      throw new Error('Doctor ID is required')
    }

    // 模拟可用时段数据
    const availableSlots = [
      {
        startTime: '09:00',
        endTime: '09:30',
        available: true,
        appointmentType: 'consultation',
      },
      {
        startTime: '09:30',
        endTime: '10:00',
        available: false,
        appointmentType: 'consultation',
        reason: 'Already booked',
      },
      {
        startTime: '10:00',
        endTime: '10:30',
        available: true,
        appointmentType: 'consultation',
      },
      {
        startTime: '10:30',
        endTime: '11:00',
        available: true,
        appointmentType: 'consultation',
      },
      {
        startTime: '14:00',
        endTime: '14:30',
        available: true,
        appointmentType: 'followup',
      },
      {
        startTime: '14:30',
        endTime: '15:00',
        available: true,
        appointmentType: 'followup',
      },
      {
        startTime: '15:00',
        endTime: '15:30',
        available: false,
        appointmentType: 'consultation',
        reason: 'Doctor break',
      },
    ]

    return {
      doctorId,
      date,
      availableSlots: availableSlots.filter((slot) => slot.available),
      allSlots: availableSlots,
      totalAvailable: availableSlots.filter((slot) => slot.available).length,
      slotDuration: duration,
      bookingInstructions: 'Use POST /appointments to book a slot',
      cancellationPolicy: '24 hours advance notice required',
    }
  }

  // 解析查询参数
  parseQueryParams(path) {
    const queryString = path.split('?')[1]
    if (!queryString) return {}

    const params = {}
    queryString.split('&').forEach((param) => {
      const [key, value] = param.split('=')
      params[decodeURIComponent(key)] = decodeURIComponent(value || '')
    })
    return params
  }

  // 创建错误响应
  createErrorResponse(status, message, headers = {}) {
    return {
      status,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        ...headers,
      },
      body: JSON.stringify({
        success: false,
        error: {
          code: status,
          message,
          timestamp: new Date().toISOString(),
        },
      }),
    }
  }

  // 生成API密钥
  generateAPIKey(keyType = 'live') {
    const prefix = keyType === 'live' ? 'hc_live_sk_' : 'hc_test_sk_'
    const randomString = Math.random().toString(36).substr(2, 15)
    return prefix + randomString
  }

  // API使用统计
  getAPIUsageStats(apiKey) {
    return {
      apiKey: apiKey.substring(0, 10) + '...',
      requestsToday: 247,
      requestsThisMonth: 7832,
      remainingQuota: 2168,
      topEndpoints: [
        { endpoint: '/health-statistics', requests: 89 },
        { endpoint: '/community-events', requests: 67 },
        { endpoint: '/health-resources', requests: 45 },
      ],
      lastRequest: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
      averageResponseTime: 145, // ms
    }
  }

  // API文档生成
  generateAPIDocumentation() {
    return {
      version: 'v1',
      baseURL: this.baseURL,
      authentication: {
        type: 'API Key',
        header: 'X-API-Key',
        description: 'Include your API key in the X-API-Key header',
      },
      rateLimit: {
        requests: 100,
        window: '1 minute',
        headers: ['X-RateLimit-Remaining', 'X-RateLimit-Reset'],
      },
      endpoints: [
        {
          method: 'GET',
          path: '/health-statistics',
          description: 'Get aggregated health statistics',
          parameters: [
            {
              name: 'timeRange',
              type: 'string',
              default: '30days',
              description: 'Time range for statistics',
            },
            {
              name: 'details',
              type: 'boolean',
              default: 'false',
              description: 'Include detailed breakdown',
            },
          ],
          response: {
            type: 'object',
            properties: {
              summary: 'object',
              demographics: 'object',
              healthMetrics: 'object',
              trends: 'object',
            },
          },
        },
        {
          method: 'GET',
          path: '/community-events',
          description: 'Get upcoming community events',
          parameters: [
            {
              name: 'limit',
              type: 'integer',
              default: '10',
              description: 'Maximum number of events',
            },
            {
              name: 'startDate',
              type: 'string',
              description: 'Filter events from this date (YYYY-MM-DD)',
            },
            { name: 'category', type: 'string', description: 'Filter by event category' },
          ],
        },
        {
          method: 'GET',
          path: '/health-resources',
          description: 'Get health education resources',
          parameters: [
            { name: 'category', type: 'string', description: 'Filter by resource category' },
            { name: 'search', type: 'string', description: 'Search in title and content' },
            { name: 'minRating', type: 'number', description: 'Minimum rating filter' },
            {
              name: 'limit',
              type: 'integer',
              default: '20',
              description: 'Maximum number of resources',
            },
          ],
        },
        {
          method: 'POST',
          path: '/health-data',
          description: 'Submit health measurement data',
          requestBody: {
            patientId: 'string (required)',
            measurements: 'object (required)',
            notes: 'string (optional)',
          },
        },
        {
          method: 'GET',
          path: '/appointment-slots',
          description: 'Get available appointment slots',
          parameters: [
            { name: 'doctorId', type: 'string', required: true, description: 'Doctor identifier' },
            { name: 'date', type: 'string', description: 'Date in YYYY-MM-DD format' },
            {
              name: 'duration',
              type: 'integer',
              default: '30',
              description: 'Appointment duration in minutes',
            },
          ],
        },
      ],
      examples: {
        curl: `curl -H "X-API-Key: your_api_key" "${this.baseURL}/health-statistics?timeRange=7days"`,
        javascript: `
fetch('${this.baseURL}/health-statistics', {
  headers: {
    'X-API-Key': 'your_api_key'
  }
})
.then(response => response.json())
.then(data => console.log(data));
        `,
      },
    }
  }
}

// 导出单例实例
export const apiService = new APIService()

// 导出便利函数
export const handleAPIRequest = (method, path, headers, body) =>
  apiService.handleAPIRequest(method, path, headers, body)

export const generateAPIKey = (keyType) => apiService.generateAPIKey(keyType)

export const getAPIDocumentation = () => apiService.generateAPIDocumentation()

export const getAPIUsageStats = (apiKey) => apiService.getAPIUsageStats(apiKey)

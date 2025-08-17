// 数据导出服务
import jsPDF from 'jspdf'
import 'jspdf-autotable'

class ExportService {
  constructor() {
    this.defaultOptions = {
      csv: {
        delimiter: ',',
        encoding: 'utf-8',
      },
      pdf: {
        format: 'a4',
        orientation: 'portrait',
        margin: 20,
      },
    }
  }

  // 导出为 CSV 格式
  exportToCSV(data, columns, filename = 'export.csv') {
    try {
      // 创建 CSV 头部
      const headers = columns.map((col) => col.label || col.key).join(',')

      // 创建 CSV 行
      const rows = data.map((row) => {
        return columns
          .map((col) => {
            const value = row[col.key]
            // 处理包含逗号或引号的值
            if (value && (value.toString().includes(',') || value.toString().includes('"'))) {
              return `"${value.toString().replace(/"/g, '""')}"`
            }
            return value || ''
          })
          .join(',')
      })

      // 合并所有内容
      const csvContent = [headers, ...rows].join('\n')

      // 创建并下载文件
      this.downloadFile(csvContent, filename, 'text/csv')

      return {
        success: true,
        message: 'CSV exported successfully',
        recordCount: data.length,
      }
    } catch (error) {
      console.error('CSV export failed:', error)
      return {
        success: false,
        message: 'Failed to export CSV: ' + error.message,
      }
    }
  }

  // 导出健康报告为 PDF
  exportHealthReportPDF(patientData, reportData, filename = 'health_report.pdf') {
    try {
      const doc = new jsPDF()
      let yPosition = 20

      // 添加标题
      doc.setFontSize(20)
      doc.setTextColor(44, 62, 80)
      doc.text('Health Report', 20, yPosition)
      yPosition += 15

      // 添加日期
      doc.setFontSize(12)
      doc.setTextColor(102, 102, 102)
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, yPosition)
      yPosition += 20

      // 患者信息部分
      doc.setFontSize(16)
      doc.setTextColor(44, 62, 80)
      doc.text('Patient Information', 20, yPosition)
      yPosition += 10

      doc.setFontSize(12)
      doc.setTextColor(0, 0, 0)
      doc.text(`Name: ${patientData.name}`, 20, yPosition)
      yPosition += 8
      doc.text(`Age: ${patientData.age}`, 20, yPosition)
      yPosition += 8
      doc.text(`Email: ${patientData.email}`, 20, yPosition)
      yPosition += 20

      // 健康指标表格
      if (reportData.vitals && reportData.vitals.length > 0) {
        doc.setFontSize(16)
        doc.setTextColor(44, 62, 80)
        doc.text('Vital Signs', 20, yPosition)
        yPosition += 10

        const vitalTableData = reportData.vitals.map((vital) => [
          vital.metric,
          vital.value,
          vital.unit,
          vital.status,
        ])

        doc.autoTable({
          startY: yPosition,
          head: [['Metric', 'Value', 'Unit', 'Status']],
          body: vitalTableData,
          theme: 'grid',
          headStyles: { fillColor: [52, 152, 219] },
          styles: { fontSize: 10 },
        })

        yPosition = doc.lastAutoTable.finalY + 20
      }

      // 健康建议
      if (reportData.recommendations) {
        doc.setFontSize(16)
        doc.setTextColor(44, 62, 80)
        doc.text('Health Recommendations', 20, yPosition)
        yPosition += 10

        doc.setFontSize(12)
        doc.setTextColor(0, 0, 0)
        const recommendations = doc.splitTextToSize(reportData.recommendations, 170)
        doc.text(recommendations, 20, yPosition)
        yPosition += recommendations.length * 6 + 10
      }

      // 下次预约信息
      if (reportData.nextAppointment) {
        doc.setFontSize(16)
        doc.setTextColor(44, 62, 80)
        doc.text('Next Appointment', 20, yPosition)
        yPosition += 10

        doc.setFontSize(12)
        doc.setTextColor(0, 0, 0)
        doc.text(`Date: ${reportData.nextAppointment.date}`, 20, yPosition)
        yPosition += 8
        doc.text(`Time: ${reportData.nextAppointment.time}`, 20, yPosition)
        yPosition += 8
        doc.text(`Doctor: ${reportData.nextAppointment.doctor}`, 20, yPosition)
      }

      // 添加页脚
      const pageCount = doc.internal.getNumberOfPages()
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i)
        doc.setFontSize(10)
        doc.setTextColor(102, 102, 102)
        doc.text(
          `Page ${i} of ${pageCount}`,
          doc.internal.pageSize.width - 30,
          doc.internal.pageSize.height - 10,
        )
        doc.text('Elderly Health Charity - Confidential', 20, doc.internal.pageSize.height - 10)
      }

      // 保存 PDF
      doc.save(filename)

      return {
        success: true,
        message: 'Health report PDF exported successfully',
      }
    } catch (error) {
      console.error('PDF export failed:', error)
      return {
        success: false,
        message: 'Failed to export PDF: ' + error.message,
      }
    }
  }

  // 导出用户列表为 PDF
  exportUserListPDF(users, filename = 'user_list.pdf') {
    try {
      const doc = new jsPDF()

      // 标题
      doc.setFontSize(18)
      doc.setTextColor(44, 62, 80)
      doc.text('User List Report', 20, 20)

      // 日期
      doc.setFontSize(12)
      doc.setTextColor(102, 102, 102)
      doc.text(`Generated: ${new Date().toLocaleDateString()}`, 20, 35)

      // 统计信息
      const stats = this.calculateUserStats(users)
      doc.setFontSize(14)
      doc.setTextColor(44, 62, 80)
      doc.text('Summary Statistics', 20, 55)

      doc.setFontSize(12)
      doc.setTextColor(0, 0, 0)
      doc.text(`Total Users: ${stats.total}`, 20, 70)
      doc.text(`Administrators: ${stats.admins}`, 20, 80)
      doc.text(`Volunteers: ${stats.volunteers}`, 20, 90)
      doc.text(`Regular Users: ${stats.users}`, 20, 100)

      // 用户表格
      const tableData = users.map((user) => [
        user.name,
        user.email,
        user.role,
        user.createdAt || 'N/A',
      ])

      doc.autoTable({
        startY: 120,
        head: [['Name', 'Email', 'Role', 'Created']],
        body: tableData,
        theme: 'striped',
        headStyles: { fillColor: [52, 152, 219] },
        styles: { fontSize: 10 },
        columnStyles: {
          1: { cellWidth: 50 }, // Email column wider
          3: { cellWidth: 25 }, // Created column narrower
        },
      })

      doc.save(filename)

      return {
        success: true,
        message: 'User list PDF exported successfully',
        recordCount: users.length,
      }
    } catch (error) {
      console.error('User list PDF export failed:', error)
      return {
        success: false,
        message: 'Failed to export user list PDF: ' + error.message,
      }
    }
  }

  // 导出健康资源统计报告
  exportHealthResourcesReport(resources, filename = 'health_resources_report.pdf') {
    try {
      const doc = new jsPDF()
      let yPos = 20

      // 标题
      doc.setFontSize(18)
      doc.setTextColor(44, 62, 80)
      doc.text('Health Resources Report', 20, yPos)
      yPos += 20

      // 统计信息
      const stats = this.calculateResourceStats(resources)

      doc.setFontSize(14)
      doc.text('Overview', 20, yPos)
      yPos += 15

      doc.setFontSize(12)
      doc.text(`Total Resources: ${stats.total}`, 20, yPos)
      yPos += 8
      doc.text(`Average Rating: ${stats.averageRating.toFixed(2)}`, 20, yPos)
      yPos += 8
      doc.text(`Total Reviews: ${stats.totalReviews}`, 20, yPos)
      yPos += 20

      // 按类别统计
      doc.setFontSize(14)
      doc.text('By Category', 20, yPos)
      yPos += 10

      const categoryData = Object.entries(stats.byCategory).map(([category, count]) => [
        category,
        count.toString(),
      ])

      doc.autoTable({
        startY: yPos,
        head: [['Category', 'Count']],
        body: categoryData,
        theme: 'grid',
        headStyles: { fillColor: [52, 152, 219] },
      })

      yPos = doc.lastAutoTable.finalY + 20

      // 详细资源列表
      if (yPos > 200) {
        doc.addPage()
        yPos = 20
      }

      doc.setFontSize(14)
      doc.text('Resource Details', 20, yPos)
      yPos += 10

      const resourceData = resources.map((resource) => [
        resource.title,
        resource.category,
        resource.averageRating.toFixed(1),
        resource.ratings.length.toString(),
      ])

      doc.autoTable({
        startY: yPos,
        head: [['Title', 'Category', 'Rating', 'Reviews']],
        body: resourceData,
        theme: 'striped',
        headStyles: { fillColor: [52, 152, 219] },
        styles: { fontSize: 10 },
      })

      doc.save(filename)

      return {
        success: true,
        message: 'Health resources report exported successfully',
      }
    } catch (error) {
      console.error('Health resources report export failed:', error)
      return {
        success: false,
        message: 'Failed to export health resources report: ' + error.message,
      }
    }
  }

  // 计算用户统计信息
  calculateUserStats(users) {
    return {
      total: users.length,
      admins: users.filter((u) => u.role === 'admin').length,
      volunteers: users.filter((u) => u.role === 'volunteer').length,
      users: users.filter((u) => u.role === 'user').length,
    }
  }

  // 计算资源统计信息
  calculateResourceStats(resources) {
    const totalRating = resources.reduce((sum, r) => sum + r.averageRating, 0)
    const totalReviews = resources.reduce((sum, r) => sum + r.ratings.length, 0)

    const byCategory = resources.reduce((acc, resource) => {
      acc[resource.category] = (acc[resource.category] || 0) + 1
      return acc
    }, {})

    return {
      total: resources.length,
      averageRating: resources.length > 0 ? totalRating / resources.length : 0,
      totalReviews,
      byCategory,
    }
  }

  // 通用文件下载函数
  downloadFile(content, filename, mimeType) {
    const blob = new Blob([content], { type: mimeType })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
  }

  // 导出预约日历数据
  exportAppointmentsCSV(appointments, filename = 'appointments.csv') {
    const columns = [
      { key: 'date', label: 'Date' },
      { key: 'time', label: 'Time' },
      { key: 'patientName', label: 'Patient Name' },
      { key: 'doctorName', label: 'Doctor' },
      { key: 'type', label: 'Appointment Type' },
      { key: 'status', label: 'Status' },
    ]

    return this.exportToCSV(appointments, columns, filename)
  }
}

// 导出单例实例
export const exportService = new ExportService()

// 导出便利函数
export const exportCSV = (data, columns, filename) =>
  exportService.exportToCSV(data, columns, filename)

export const exportHealthReport = (patientData, reportData, filename) =>
  exportService.exportHealthReportPDF(patientData, reportData, filename)

export const exportUserList = (users, filename) => exportService.exportUserListPDF(users, filename)

export const exportResourcesReport = (resources, filename) =>
  exportService.exportHealthResourcesReport(resources, filename)

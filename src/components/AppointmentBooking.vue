<template>
  <div class="appointment-booking">
    <div class="booking-header">
      <h3>📅 Medical Appointment Booking</h3>
      <div class="header-controls">
        <select v-model="selectedDoctor" @change="loadDoctorSchedule" class="doctor-select">
          <option value="">Select a Doctor</option>
          <option v-for="doctor in doctors" :key="doctor.id" :value="doctor.id">
            Dr. {{ doctor.name }} - {{ doctor.specialty }}
          </option>
        </select>
        <button @click="showMyAppointments" class="btn btn-secondary">📋 My Appointments</button>
      </div>
    </div>

    <!-- 日历视图 -->
    <div class="calendar-container">
      <div class="calendar-header">
        <button @click="previousMonth" class="btn btn-outline">‹ Previous</button>
        <h4>{{ currentMonthYear }}</h4>
        <button @click="nextMonth" class="btn btn-outline">Next ›</button>
      </div>

      <div class="calendar-grid">
        <!-- 星期标题 -->
        <div class="weekday-header" v-for="day in weekdays" :key="day">
          {{ day }}
        </div>

        <!-- 日期单元格 -->
        <div
          v-for="date in calendarDates"
          :key="date.key"
          class="calendar-cell"
          :class="{
            'other-month': !date.currentMonth,
            today: date.isToday,
            'has-appointments': date.appointments.length > 0,
            selected: selectedDate && date.date === selectedDate.date,
          }"
          @click="selectDate(date)"
        >
          <div class="date-number">{{ date.day }}</div>
          <div class="appointment-indicators">
            <div
              v-for="apt in date.appointments.slice(0, 3)"
              :key="apt.id"
              class="appointment-dot"
              :class="apt.status"
              :title="`${apt.time} - ${apt.type}`"
            ></div>
            <div v-if="date.appointments.length > 3" class="more-indicator">
              +{{ date.appointments.length - 3 }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 选中日期的详细信息 -->
    <div v-if="selectedDate" class="date-details">
      <h4>📅 {{ formatSelectedDate(selectedDate) }}</h4>

      <div class="time-slots-container">
        <h5>Available Time Slots</h5>
        <div class="time-slots">
          <button
            v-for="slot in availableTimeSlots"
            :key="slot.time"
            @click="selectTimeSlot(slot)"
            class="time-slot"
            :class="{
              unavailable: !slot.available,
              selected: selectedTimeSlot === slot.time,
            }"
            :disabled="!slot.available"
          >
            {{ slot.time }}
            <small v-if="!slot.available">{{ slot.reason }}</small>
          </button>
        </div>
      </div>

      <!-- 现有预约列表 -->
      <div v-if="selectedDate.appointments.length > 0" class="existing-appointments">
        <h5>Existing Appointments</h5>
        <div class="appointment-list">
          <div
            v-for="appointment in selectedDate.appointments"
            :key="appointment.id"
            class="appointment-item"
            :class="appointment.status"
          >
            <div class="appointment-time">{{ appointment.time }}</div>
            <div class="appointment-details">
              <strong>{{ appointment.patientName }}</strong>
              <span class="appointment-type">{{ appointment.type }}</span>
              <span class="appointment-status">{{ appointment.status }}</span>
            </div>
            <div class="appointment-actions" v-if="canManageAppointment(appointment)">
              <button @click="editAppointment(appointment)" class="btn btn-sm btn-secondary">
                Edit
              </button>
              <button @click="cancelAppointment(appointment)" class="btn btn-sm btn-danger">
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 预约表单 -->
    <div v-if="showBookingForm" class="booking-form-container">
      <div class="booking-form">
        <h4>📝 Book New Appointment</h4>

        <form @submit.prevent="submitBooking">
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Date</label>
              <input
                type="text"
                :value="formatSelectedDate(selectedDate)"
                readonly
                class="form-input"
              />
            </div>
            <div class="form-group">
              <label class="form-label">Time</label>
              <input type="text" :value="selectedTimeSlot" readonly class="form-input" />
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Appointment Type</label>
            <select v-model="bookingForm.type" class="form-input" required>
              <option value="">Select appointment type</option>
              <option value="consultation">General Consultation</option>
              <option value="checkup">Regular Check-up</option>
              <option value="followup">Follow-up Visit</option>
              <option value="urgent">Urgent Care</option>
              <option value="vaccination">Vaccination</option>
            </select>
          </div>

          <div class="form-group">
            <label class="form-label">Reason for Visit</label>
            <textarea
              v-model="bookingForm.reason"
              class="form-input"
              rows="3"
              placeholder="Please describe your symptoms or reason for the visit..."
              required
            ></textarea>
          </div>

          <div class="form-group">
            <label class="form-label">Special Requirements</label>
            <textarea
              v-model="bookingForm.requirements"
              class="form-input"
              rows="2"
              placeholder="Any special needs, accessibility requirements, etc."
            ></textarea>
          </div>

          <div class="form-group">
            <label class="checkbox-label">
              <input type="checkbox" v-model="bookingForm.sendReminder" />
              Send me email and SMS reminders
            </label>
          </div>

          <div class="form-actions">
            <button type="submit" class="btn btn-primary" :disabled="submitting">
              {{ submitting ? 'Booking...' : '📅 Book Appointment' }}
            </button>
            <button type="button" @click="cancelBooking" class="btn btn-secondary">Cancel</button>
          </div>
        </form>
      </div>
    </div>

    <!-- 我的预约列表模态框 -->
    <div v-if="showMyAppointmentsModal" class="modal-overlay" @click="closeMyAppointments">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>📋 My Appointments</h3>
          <button @click="closeMyAppointments" class="close-btn">×</button>
        </div>
        <div class="modal-body">
          <div class="appointments-filter">
            <select v-model="appointmentFilter" class="filter-select">
              <option value="all">All Appointments</option>
              <option value="upcoming">Upcoming</option>
              <option value="past">Past</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <div class="my-appointments-list">
            <div
              v-for="appointment in filteredMyAppointments"
              :key="appointment.id"
              class="my-appointment-item"
              :class="appointment.status"
            >
              <div class="appointment-date-time">
                <div class="appointment-date">{{ formatDate(appointment.date) }}</div>
                <div class="appointment-time">{{ appointment.time }}</div>
              </div>
              <div class="appointment-info">
                <strong>Dr. {{ appointment.doctorName }}</strong>
                <span class="appointment-type">{{ appointment.type }}</span>
                <span class="appointment-reason">{{ appointment.reason }}</span>
              </div>
              <div class="appointment-status">
                <span class="status-badge" :class="appointment.status">
                  {{ appointment.status }}
                </span>
              </div>
              <div class="appointment-actions" v-if="canModifyAppointment(appointment)">
                <button
                  @click="rescheduleAppointment(appointment)"
                  class="btn btn-sm btn-secondary"
                >
                  Reschedule
                </button>
                <button @click="cancelAppointment(appointment)" class="btn btn-sm btn-danger">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 冲突检测提示 -->
    <div v-if="conflictWarning" class="conflict-warning">
      <div class="warning-content">
        <h4>⚠️ Scheduling Conflict Detected</h4>
        <p>{{ conflictWarning }}</p>
        <div class="warning-actions">
          <button @click="resolveConflict" class="btn btn-primary">Resolve Conflict</button>
          <button @click="conflictWarning = null" class="btn btn-secondary">Dismiss</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { sendAppointmentConfirmation } from '../services/emailService.js'

export default {
  name: 'AppointmentBooking',
  data() {
    return {
      currentDate: new Date(),
      selectedDate: null,
      selectedTimeSlot: null,
      selectedDoctor: '',
      showBookingForm: false,
      showMyAppointmentsModal: false,
      submitting: false,
      appointmentFilter: 'upcoming',
      conflictWarning: null,

      weekdays: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],

      bookingForm: {
        type: '',
        reason: '',
        requirements: '',
        sendReminder: true,
      },

      // 模拟医生数据
      doctors: [
        {
          id: 1,
          name: 'Sarah Johnson',
          specialty: 'General Practice',
          workingHours: { start: 9, end: 17 },
          workingDays: [1, 2, 3, 4, 5], // Monday to Friday
        },
        {
          id: 2,
          name: 'Michael Chen',
          specialty: 'Cardiology',
          workingHours: { start: 10, end: 16 },
          workingDays: [1, 2, 4, 5], // Mon, Tue, Thu, Fri
        },
        {
          id: 3,
          name: 'Emily Rodriguez',
          specialty: 'Geriatrics',
          workingHours: { start: 8, end: 15 },
          workingDays: [1, 2, 3, 4, 5],
        },
      ],

      // 模拟预约数据
      appointments: [
        {
          id: 1,
          date: '2025-08-20',
          time: '10:00',
          doctorId: 1,
          doctorName: 'Sarah Johnson',
          patientName: 'John Doe',
          type: 'consultation',
          reason: 'Annual checkup',
          status: 'confirmed',
        },
        {
          id: 2,
          date: '2025-08-20',
          time: '14:30',
          doctorId: 1,
          doctorName: 'Sarah Johnson',
          patientName: 'Current User',
          type: 'followup',
          reason: 'Blood pressure monitoring',
          status: 'confirmed',
        },
      ],

      // 标准时间段
      standardTimeSlots: [
        '09:00',
        '09:30',
        '10:00',
        '10:30',
        '11:00',
        '11:30',
        '14:00',
        '14:30',
        '15:00',
        '15:30',
        '16:00',
        '16:30',
      ],
    }
  },

  computed: {
    currentMonthYear() {
      return this.currentDate.toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric',
      })
    },

    calendarDates() {
      const year = this.currentDate.getFullYear()
      const month = this.currentDate.getMonth()
      const firstDay = new Date(year, month, 1)
      const lastDay = new Date(year, month + 1, 0)
      const startDate = new Date(firstDay)
      startDate.setDate(startDate.getDate() - firstDay.getDay())

      const dates = []
      const today = new Date()

      for (let i = 0; i < 42; i++) {
        const date = new Date(startDate)
        date.setDate(startDate.getDate() + i)

        const dateStr = date.toISOString().split('T')[0]
        const dayAppointments = this.getAppointmentsForDate(dateStr)

        dates.push({
          date: dateStr,
          day: date.getDate(),
          currentMonth: date.getMonth() === month,
          isToday: date.toDateString() === today.toDateString(),
          appointments: dayAppointments,
          key: `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`,
        })
      }

      return dates
    },

    availableTimeSlots() {
      if (!this.selectedDate || !this.selectedDoctor) return []

      const doctor = this.doctors.find((d) => d.id === parseInt(this.selectedDoctor))
      if (!doctor) return []

      const selectedDateObj = new Date(this.selectedDate.date)
      const dayOfWeek = selectedDateObj.getDay()

      // 检查医生是否在这一天工作
      if (!doctor.workingDays.includes(dayOfWeek)) {
        return []
      }

      return this.standardTimeSlots.map((time) => {
        const [hour] = time.split(':').map(Number)
        const isInWorkingHours = hour >= doctor.workingHours.start && hour < doctor.workingHours.end
        const isBooked = this.isTimeSlotBooked(this.selectedDate.date, time)
        const isPast = this.isTimeSlotInPast(this.selectedDate.date, time)

        return {
          time,
          available: isInWorkingHours && !isBooked && !isPast,
          reason: !isInWorkingHours
            ? 'Outside working hours'
            : isBooked
              ? 'Already booked'
              : isPast
                ? 'Time has passed'
                : '',
        }
      })
    },

    filteredMyAppointments() {
      const userAppointments = this.appointments.filter((apt) => apt.patientName === 'Current User')

      const now = new Date()

      switch (this.appointmentFilter) {
        case 'upcoming':
          return userAppointments.filter((apt) => new Date(apt.date) >= now)
        case 'past':
          return userAppointments.filter((apt) => new Date(apt.date) < now)
        case 'cancelled':
          return userAppointments.filter((apt) => apt.status === 'cancelled')
        default:
          return userAppointments
      }
    },
  },

  methods: {
    previousMonth() {
      this.currentDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() - 1)
    },

    nextMonth() {
      this.currentDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() + 1)
    },

    selectDate(date) {
      if (!date.currentMonth) return
      this.selectedDate = date
      this.selectedTimeSlot = null
      this.showBookingForm = false
    },

    selectTimeSlot(slot) {
      if (!slot.available) return
      this.selectedTimeSlot = slot.time
      this.showBookingForm = true
    },

    getAppointmentsForDate(dateStr) {
      return this.appointments.filter(
        (apt) =>
          apt.date === dateStr &&
          (!this.selectedDoctor || apt.doctorId === parseInt(this.selectedDoctor)),
      )
    },

    isTimeSlotBooked(date, time) {
      return this.appointments.some(
        (apt) =>
          apt.date === date &&
          apt.time === time &&
          apt.doctorId === parseInt(this.selectedDoctor) &&
          apt.status !== 'cancelled',
      )
    },

    isTimeSlotInPast(date, time) {
      const now = new Date()
      const slotDateTime = new Date(`${date}T${time}:00`)
      return slotDateTime < now
    },

    async submitBooking() {
      this.submitting = true

      try {
        // 检查冲突
        const conflicts = this.checkForConflicts()
        if (conflicts.length > 0) {
          this.conflictWarning = `Conflict detected: ${conflicts[0]}`
          return
        }

        const newAppointment = {
          id: Date.now(),
          date: this.selectedDate.date,
          time: this.selectedTimeSlot,
          doctorId: parseInt(this.selectedDoctor),
          doctorName: this.doctors.find((d) => d.id === parseInt(this.selectedDoctor)).name,
          patientName: 'Current User',
          type: this.bookingForm.type,
          reason: this.bookingForm.reason,
          requirements: this.bookingForm.requirements,
          status: 'confirmed',
        }

        this.appointments.push(newAppointment)

        // 发送确认邮件
        if (this.bookingForm.sendReminder) {
          await this.sendConfirmationEmail(newAppointment)
        }

        this.showBookingForm = false
        this.resetBookingForm()

        alert('Appointment booked successfully!')
      } catch (error) {
        console.error('Booking failed:', error)
        alert('Failed to book appointment. Please try again.')
      } finally {
        this.submitting = false
      }
    },

    checkForConflicts() {
      const conflicts = []

      // 检查是否与现有预约冲突
      const existingAppointment = this.appointments.find(
        (apt) =>
          apt.date === this.selectedDate.date &&
          apt.time === this.selectedTimeSlot &&
          apt.patientName === 'Current User' &&
          apt.status !== 'cancelled',
      )

      if (existingAppointment) {
        conflicts.push('You already have an appointment at this time')
      }

      return conflicts
    },

    async sendConfirmationEmail(appointment) {
      const emailData = {
        patientEmail: 'user@example.com',
        patientName: 'Current User',
        date: this.formatDate(appointment.date),
        time: appointment.time,
        doctorName: appointment.doctorName,
        clinicName: 'Elderly Health Clinic',
        clinicAddress: '123 Health Street, Melbourne VIC 3000',
        instructions: 'Please arrive 15 minutes early.',
      }

      await sendAppointmentConfirmation(emailData)
    },

    cancelBooking() {
      this.showBookingForm = false
      this.selectedTimeSlot = null
      this.resetBookingForm()
    },

    resetBookingForm() {
      this.bookingForm = {
        type: '',
        reason: '',
        requirements: '',
        sendReminder: true,
      }
    },

    formatSelectedDate(date) {
      return new Date(date.date).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    },

    formatDate(dateStr) {
      return new Date(dateStr).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    },

    loadDoctorSchedule() {
      // 重新加载选中医生的时间表
      this.selectedDate = null
      this.selectedTimeSlot = null
      this.showBookingForm = false
    },

    canManageAppointment(appointment) {
      return appointment.patientName === 'Current User' || this.isAdmin()
    },

    canModifyAppointment(appointment) {
      const appointmentDate = new Date(appointment.date)
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)

      return appointmentDate >= tomorrow && appointment.status === 'confirmed'
    },

    isAdmin() {
      // 检查当前用户是否为管理员
      return false // 简化实现
    },

    showMyAppointments() {
      this.showMyAppointmentsModal = true
    },

    closeMyAppointments() {
      this.showMyAppointmentsModal = false
    },

    editAppointment(appointment) {
      alert(`Edit appointment feature would open form for: ${appointment.id}`)
    },

    cancelAppointment(appointment) {
      if (confirm('Are you sure you want to cancel this appointment?')) {
        appointment.status = 'cancelled'
        alert('Appointment cancelled successfully')
      }
    },

    rescheduleAppointment(appointment) {
      alert(`Reschedule feature would open calendar for: ${appointment.id}`)
    },

    resolveConflict() {
      // 实现冲突解决逻辑
      this.conflictWarning = null
      alert('Conflict resolution feature would provide alternative options')
    },
  },
}
</script>

<style scoped>
.appointment-booking {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.booking-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  flex-wrap: wrap;
  gap: 15px;
}

.booking-header h3 {
  color: #2c3e50;
  margin: 0;
}

.header-controls {
  display: flex;
  gap: 15px;
  align-items: center;
}

.doctor-select {
  padding: 8px 12px;
  border: 2px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  min-width: 200px;
}

.calendar-container {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  padding: 20px;
  margin-bottom: 20px;
}

.calendar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.calendar-header h4 {
  color: #2c3e50;
  margin: 0;
}

.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 1px;
  background: #dee2e6;
  border-radius: 8px;
  overflow: hidden;
}

.weekday-header {
  background: #f8f9fa;
  padding: 12px 8px;
  text-align: center;
  font-weight: bold;
  color: #495057;
  font-size: 12px;
}

.calendar-cell {
  background: white;
  min-height: 80px;
  padding: 8px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.calendar-cell:hover {
  background: #f8f9ff;
}

.calendar-cell.other-month {
  background: #f8f9fa;
  color: #6c757d;
}

.calendar-cell.today {
  background: #e3f2fd;
  border: 2px solid #2196f3;
}

.calendar-cell.selected {
  background: #bbdefb;
  border: 2px solid #1976d2;
}

.calendar-cell.has-appointments {
  border-left: 4px solid #4caf50;
}

.date-number {
  font-weight: bold;
  font-size: 14px;
}

.appointment-indicators {
  display: flex;
  flex-wrap: wrap;
  gap: 2px;
  margin-top: 4px;
}

.appointment-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #4caf50;
}

.appointment-dot.confirmed {
  background: #4caf50;
}

.appointment-dot.pending {
  background: #ff9800;
}

.appointment-dot.cancelled {
  background: #f44336;
}

.more-indicator {
  font-size: 8px;
  color: #666;
  margin-left: 2px;
}

.date-details {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  padding: 20px;
  margin-bottom: 20px;
}

.date-details h4 {
  color: #2c3e50;
  margin-bottom: 20px;
}

.time-slots-container h5 {
  color: #2c3e50;
  margin-bottom: 15px;
}

.time-slots {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 10px;
  margin-bottom: 20px;
}

.time-slot {
  padding: 12px 8px;
  border: 2px solid #ddd;
  background: white;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  text-align: center;
  font-size: 14px;
}

.time-slot:hover:not(.unavailable):not(:disabled) {
  border-color: #007bff;
  background: #f8f9ff;
}

.time-slot.selected {
  background: #007bff;
  color: white;
  border-color: #007bff;
}

.time-slot.unavailable {
  background: #f8f9fa;
  color: #6c757d;
  cursor: not-allowed;
  border-color: #dee2e6;
}

.time-slot small {
  display: block;
  font-size: 10px;
  margin-top: 2px;
}

.existing-appointments h5 {
  color: #2c3e50;
  margin-bottom: 15px;
}

.appointment-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.appointment-item {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 15px;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  background: #f8f9fa;
}

.appointment-item.confirmed {
  border-left: 4px solid #4caf50;
}

.appointment-item.pending {
  border-left: 4px solid #ff9800;
}

.appointment-item.cancelled {
  border-left: 4px solid #f44336;
  opacity: 0.7;
}

.appointment-time {
  font-weight: bold;
  color: #2c3e50;
  min-width: 60px;
}

.appointment-details {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.appointment-type {
  color: #007bff;
  font-size: 12px;
  text-transform: uppercase;
  font-weight: bold;
}

.appointment-status {
  color: #666;
  font-size: 12px;
  text-transform: capitalize;
}

.appointment-actions {
  display: flex;
  gap: 8px;
}

.booking-form-container {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  padding: 20px;
  margin-bottom: 20px;
}

.booking-form h4 {
  color: #2c3e50;
  margin-bottom: 20px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
}

.form-group {
  margin-bottom: 20px;
}

.form-label {
  display: block;
  margin-bottom: 8px;
  font-weight: bold;
  color: #2c3e50;
}

.form-input {
  width: 100%;
  padding: 12px;
  border: 2px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
}

.form-input:focus {
  outline: none;
  border-color: #007bff;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.form-actions {
  display: flex;
  gap: 15px;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 12px;
  max-width: 800px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
}

.modal-header {
  padding: 20px;
  border-bottom: 1px solid #dee2e6;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h3 {
  color: #2c3e50;
  margin: 0;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #666;
}

.modal-body {
  padding: 20px;
}

.appointments-filter {
  margin-bottom: 20px;
}

.filter-select {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.my-appointments-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.my-appointment-item {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 15px;
  border: 1px solid #dee2e6;
  border-radius: 8px;
}

.appointment-date-time {
  min-width: 100px;
  text-align: center;
}

.appointment-date {
  font-weight: bold;
  color: #2c3e50;
}

.appointment-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.status-badge {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: bold;
  text-transform: uppercase;
}

.status-badge.confirmed {
  background: #d4edda;
  color: #155724;
}

.status-badge.pending {
  background: #fff3cd;
  color: #856404;
}

.status-badge.cancelled {
  background: #f8d7da;
  color: #721c24;
}

.conflict-warning {
  position: fixed;
  top: 20px;
  right: 20px;
  background: #fff3cd;
  border: 1px solid #ffeaa7;
  border-radius: 8px;
  padding: 20px;
  max-width: 400px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 1001;
}

.warning-content h4 {
  color: #856404;
  margin-bottom: 10px;
}

.warning-actions {
  display: flex;
  gap: 10px;
  margin-top: 15px;
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
  .booking-header {
    flex-direction: column;
    align-items: stretch;
  }

  .calendar-grid {
    font-size: 12px;
  }

  .calendar-cell {
    min-height: 60px;
    padding: 4px;
  }

  .time-slots {
    grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
  }

  .form-row {
    grid-template-columns: 1fr;
  }

  .appointment-item {
    flex-direction: column;
    align-items: stretch;
  }

  .form-actions {
    flex-direction: column;
  }
}
</style>

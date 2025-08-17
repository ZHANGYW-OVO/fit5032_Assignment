<template>
  <div class="health-map-container">
    <div class="map-header">
      <h3>Find Healthcare Facilities Near You</h3>
      <div class="map-controls">
        <div class="search-section">
          <input
            type="text"
            v-model="searchQuery"
            placeholder="Search for hospitals, clinics..."
            class="search-input"
            @keyup.enter="searchFacilities"
          />
          <button @click="searchFacilities" class="btn btn-primary">Search</button>
        </div>

        <div class="filter-group">
          <select v-model="facilityType" @change="filterFacilities" class="filter-select">
            <option value="">All Types</option>
            <option value="hospital">Hospitals</option>
            <option value="clinic">Clinics</option>
            <option value="pharmacy">Pharmacies</option>
            <option value="emergency">Emergency</option>
          </select>
        </div>

        <div class="location-controls">
          <button
            @click="getCurrentLocation"
            class="btn btn-success btn-sm"
            :disabled="isGettingLocation"
          >
            📍 {{ isGettingLocation ? 'Getting Location...' : 'Get My Location' }}
          </button>
          <div v-if="locationStatus" :class="`location-status location-${locationStatus.type}`">
            {{ locationStatus.message }}
          </div>
        </div>
      </div>
    </div>

    <!-- 真实的Leaflet地图 -->
    <div class="map-wrapper">
      <div ref="mapContainer" id="health-map" class="map-container"></div>
    </div>

    <!-- 设施列表 -->
    <div class="facilities-panel">
      <h4>Healthcare Facilities ({{ filteredFacilities.length }})</h4>
      <div class="facilities-list">
        <div
          v-for="facility in filteredFacilities"
          :key="facility.id"
          class="facility-card"
          :class="{ selected: selectedFacility?.id === facility.id }"
          @click="selectFacility(facility)"
        >
          <div class="facility-info">
            <h5>{{ facility.name }}</h5>
            <p class="facility-type">{{ facility.type }}</p>
            <p class="facility-address">{{ facility.address }}</p>
            <div class="facility-meta">
              <span class="distance" v-if="facility.distance">
                📍 {{ facility.distance.toFixed(1) }}km away
              </span>
              <span class="rating" v-if="facility.rating"> ⭐ {{ facility.rating }}/5 </span>
            </div>
          </div>
          <div class="facility-actions">
            <button @click.stop="getDirections(facility)" class="btn btn-sm btn-primary">
              🧭 Directions
            </button>
            <button @click.stop="showFacilityDetails(facility)" class="btn btn-sm btn-secondary">
              ℹ️ Details
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Fix for default markers in Leaflet with Vite
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

export default {
  name: 'HealthMap',
  data() {
    return {
      searchQuery: '',
      facilityType: '',
      selectedFacility: null,
      userLocation: null,
      isGettingLocation: false,
      locationStatus: null,
      map: null,
      userMarker: null,
      facilityMarkers: [],

      // 模拟医疗设施数据
      facilities: [
        {
          id: 1,
          name: 'Melbourne General Hospital',
          type: 'hospital',
          address: '123 Collins Street, Melbourne VIC 3000',
          lat: -37.8136,
          lng: 144.9631,
          phone: '(03) 9342-7000',
          hours: '24/7',
          rating: 4.2,
          distance: null,
          services: ['Emergency', 'Surgery', 'Cardiology', 'Oncology'],
        },
        {
          id: 2,
          name: 'City Medical Clinic',
          type: 'clinic',
          address: '456 Bourke Street, Melbourne VIC 3000',
          lat: -37.8143,
          lng: 144.9632,
          phone: '(03) 9654-3210',
          hours: 'Mon-Fri 8AM-6PM',
          rating: 4.5,
          distance: null,
          services: ['General Practice', 'Vaccinations', 'Health Checks'],
        },
        {
          id: 3,
          name: 'Senior Care Clinic',
          type: 'clinic',
          address: '789 Flinders Street, Melbourne VIC 3000',
          lat: -37.817,
          lng: 144.967,
          phone: '(03) 9876-5432',
          hours: 'Mon-Sat 9AM-5PM',
          rating: 4.8,
          distance: null,
          services: ['Geriatric Care', 'Physical Therapy', 'Nutrition Counseling'],
        },
      ],
    }
  },

  computed: {
    filteredFacilities() {
      let filtered = [...this.facilities]

      // 按类型过滤
      if (this.facilityType) {
        filtered = filtered.filter((f) => f.type === this.facilityType)
      }

      // 按搜索词过滤
      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase()
        filtered = filtered.filter(
          (f) =>
            f.name.toLowerCase().includes(query) ||
            f.address.toLowerCase().includes(query) ||
            f.services.some((service) => service.toLowerCase().includes(query)),
        )
      }

      // 按距离排序
      return filtered.sort((a, b) => (a.distance || Infinity) - (b.distance || Infinity))
    },
  },

  mounted() {
    this.initMap()
    // 自动尝试获取用户位置
    this.getCurrentLocation()
  },

  beforeUnmount() {
    if (this.map) {
      this.map.remove()
    }
  },

  methods: {
    initMap() {
      // 初始化地图，以墨尔本为中心
      this.map = L.map('health-map').setView([-37.8136, 144.9631], 13)

      // 添加地图瓦片图层
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(this.map)

      // 添加设施标记
      this.updateFacilitiesOnMap()
    },

    getCurrentLocation() {
      if (!navigator.geolocation) {
        this.showLocationStatus('error', 'Geolocation is not supported by this browser.')
        return
      }

      this.isGettingLocation = true
      this.showLocationStatus('loading', 'Getting your location...')

      navigator.geolocation.getCurrentPosition(
        (position) => {
          this.userLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          }

          this.showLocationStatus('success', 'Location found!')
          this.addUserMarker()
          this.calculateDistances()
          this.updateFacilitiesOnMap()
          this.isGettingLocation = false

          // 3秒后隐藏状态
          setTimeout(() => {
            this.locationStatus = null
          }, 3000)
        },
        (error) => {
          this.isGettingLocation = false
          let message = 'Failed to get location'

          switch (error.code) {
            case error.PERMISSION_DENIED:
              message = 'Location access denied by user'
              break
            case error.POSITION_UNAVAILABLE:
              message = 'Location information unavailable'
              break
            case error.TIMEOUT:
              message = 'Location request timed out'
              break
          }

          this.showLocationStatus('error', message)

          // 5秒后隐藏状态
          setTimeout(() => {
            this.locationStatus = null
          }, 5000)
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000,
        },
      )
    },

    showLocationStatus(type, message) {
      this.locationStatus = { type, message }
    },

    addUserMarker() {
      if (!this.userLocation) return

      // 移除旧的用户标记
      if (this.userMarker) {
        this.map.removeLayer(this.userMarker)
      }

      // 添加新的用户标记
      this.userMarker = L.circleMarker([this.userLocation.lat, this.userLocation.lng], {
        color: '#007bff',
        fillColor: '#007bff',
        fillOpacity: 0.8,
        radius: 10,
        weight: 3,
      }).addTo(this.map)

      this.userMarker.bindPopup('<strong>You are here</strong>').openPopup()

      // 将地图中心移到用户位置
      this.map.setView([this.userLocation.lat, this.userLocation.lng], 15)
    },

    calculateDistances() {
      if (!this.userLocation) return

      this.facilities.forEach((facility) => {
        const distance = this.getDistance(
          this.userLocation.lat,
          this.userLocation.lng,
          facility.lat,
          facility.lng,
        )
        facility.distance = distance
      })

      // 按距离排序
      this.facilities.sort((a, b) => (a.distance || Infinity) - (b.distance || Infinity))
    },

    getDistance(lat1, lng1, lat2, lng2) {
      const R = 6371 // 地球半径（公里）
      const dLat = ((lat2 - lat1) * Math.PI) / 180
      const dLng = ((lng2 - lng1) * Math.PI) / 180
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((lat1 * Math.PI) / 180) *
          Math.cos((lat2 * Math.PI) / 180) *
          Math.sin(dLng / 2) *
          Math.sin(dLng / 2)
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
      return R * c
    },

    updateFacilitiesOnMap() {
      // 清除现有的设施标记
      this.facilityMarkers.forEach((marker) => this.map.removeLayer(marker))
      this.facilityMarkers = []

      // 为过滤后的设施添加标记
      this.filteredFacilities.forEach((facility) => {
        const marker = L.circleMarker([facility.lat, facility.lng], {
          color: this.getMarkerColor(facility.type),
          fillColor: this.getMarkerColor(facility.type),
          fillOpacity: 0.7,
          radius: 8,
          weight: 2,
        }).addTo(this.map)

        const popupContent = this.createPopupContent(facility)
        marker.bindPopup(popupContent)

        // 存储设施ID用于后续访问
        marker.facilityId = facility.id
        this.facilityMarkers.push(marker)
      })
    },

    getMarkerColor(type) {
      const colors = {
        hospital: '#dc3545',
        clinic: '#007bff',
        pharmacy: '#28a745',
        emergency: '#fd7e14',
      }
      return colors[type] || '#6c757d'
    },

    createPopupContent(facility) {
      const distanceText = facility.distance
        ? `<br><small>📍 ${facility.distance.toFixed(1)}km away</small>`
        : ''
      const ratingText = facility.rating ? `<br><small>⭐ ${facility.rating}/5</small>` : ''

      return `
        <div style="min-width: 200px;">
          <strong>${facility.name}</strong><br>
          <span style="color: #007bff; font-size: 12px; text-transform: uppercase;">${facility.type}</span><br>
          <small>${facility.address}</small><br>
          <small>📞 ${facility.phone}</small><br>
          <small>🕒 ${facility.hours}</small>${ratingText}${distanceText}
        </div>
      `
    },

    searchFacilities() {
      // 搜索功能由computed属性自动处理
      this.updateFacilitiesOnMap()
    },

    filterFacilities() {
      // 过滤功能由computed属性自动处理
      this.updateFacilitiesOnMap()
    },

    selectFacility(facility) {
      this.selectedFacility = facility

      // 将地图中心移到选中的设施
      this.map.setView([facility.lat, facility.lng], 16)

      // 打开对应的弹窗
      const marker = this.facilityMarkers.find((m) => m.facilityId === facility.id)
      if (marker) {
        marker.openPopup()
      }
    },

    getDirections(facility) {
      const destination = `${facility.lat},${facility.lng}`
      const origin = this.userLocation ? `${this.userLocation.lat},${this.userLocation.lng}` : ''

      // 根据设备类型选择不同的地图应用
      const googleMapsUrl = `https://www.google.com/maps/dir/${origin}/${destination}`
      const appleMapsUrl = `http://maps.apple.com/?daddr=${destination}&dirflg=d`

      // 检测是否为移动设备
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent,
      )

      if (isMobile) {
        // 移动设备上尝试打开原生应用
        if (navigator.userAgent.includes('iPhone') || navigator.userAgent.includes('iPad')) {
          window.open(appleMapsUrl, '_blank')
        } else {
          window.open(googleMapsUrl, '_blank')
        }
      } else {
        // 桌面设备上打开Google Maps
        window.open(googleMapsUrl, '_blank')
      }
    },

    showFacilityDetails(facility) {
      const services = facility.services.join(', ')
      const distanceText = facility.distance ? `\nDistance: ${facility.distance.toFixed(1)}km` : ''
      const ratingText = facility.rating ? facility.rating + '/5' : 'Not rated'

      alert(
        `${facility.name}\n\nType: ${facility.type}\nAddress: ${facility.address}\nPhone: ${facility.phone}\nHours: ${facility.hours}\nRating: ${ratingText}\nServices: ${services}${distanceText}`,
      )
    },
  },

  watch: {
    filteredFacilities() {
      this.updateFacilitiesOnMap()
    },
  },
}
</script>

<style scoped>
.health-map-container {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.map-header {
  padding: 20px;
  background: #f8f9fa;
  border-bottom: 1px solid #dee2e6;
}

.map-header h3 {
  color: #2c3e50;
  margin-bottom: 15px;
}

.map-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
  flex-wrap: wrap;
}

.search-section {
  display: flex;
  gap: 10px;
  flex: 1;
  min-width: 300px;
}

.search-input {
  flex: 1;
  padding: 8px 12px;
  border: 2px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
}

.filter-select {
  padding: 6px 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 13px;
}

.location-controls {
  display: flex;
  gap: 10px;
  align-items: center;
}

.location-status {
  padding: 6px 12px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: bold;
}

.location-success {
  background: #d4edda;
  color: #155724;
}

.location-error {
  background: #f8d7da;
  color: #721c24;
}

.location-loading {
  background: #fff3cd;
  color: #856404;
}

.map-wrapper {
  height: 500px;
  position: relative;
}

.map-container {
  width: 100%;
  height: 100%;
}

.facilities-panel {
  padding: 20px;
}

.facilities-panel h4 {
  color: #2c3e50;
  margin-bottom: 15px;
}

.facilities-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-height: 400px;
  overflow-y: auto;
}

.facility-card {
  border: 1px solid #dee2e6;
  border-radius: 8px;
  padding: 15px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 15px;
}

.facility-card:hover {
  border-color: #007bff;
  box-shadow: 0 2px 5px rgba(0, 123, 255, 0.1);
}

.facility-card.selected {
  border-color: #007bff;
  background-color: #f8f9ff;
}

.facility-info {
  flex: 1;
}

.facility-info h5 {
  color: #2c3e50;
  margin-bottom: 5px;
}

.facility-type {
  color: #007bff;
  font-weight: bold;
  font-size: 12px;
  text-transform: uppercase;
  margin-bottom: 5px;
}

.facility-address {
  color: #666;
  font-size: 14px;
  margin-bottom: 8px;
}

.facility-meta {
  display: flex;
  gap: 15px;
  font-size: 12px;
}

.distance {
  color: #28a745;
  font-weight: bold;
}

.rating {
  color: #ffc107;
  font-weight: bold;
}

.facility-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
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
  transform: none;
}

@media (max-width: 768px) {
  .map-controls {
    flex-direction: column;
    align-items: stretch;
  }

  .search-section {
    min-width: auto;
    flex-direction: column;
  }

  .facility-card {
    flex-direction: column;
  }

  .facility-actions {
    flex-direction: row;
    justify-content: flex-start;
  }

  .map-wrapper {
    height: 300px;
  }
}
</style>

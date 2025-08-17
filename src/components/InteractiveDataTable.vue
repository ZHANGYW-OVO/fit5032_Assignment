<template>
  <div class="interactive-table">
    <div class="table-header">
      <h3>{{ title }}</h3>
      <div class="table-controls">
        <!-- 全局搜索 -->
        <div class="search-box">
          <input
            type="text"
            v-model="globalSearch"
            placeholder="Search all columns..."
            class="search-input"
          />
          <span class="search-icon">🔍</span>
        </div>

        <!-- 导出按钮 -->
        <button @click="exportData" class="btn btn-secondary">Export Data</button>
      </div>
    </div>

    <!-- 列搜索 -->
    <div class="column-filters" v-if="showColumnFilters">
      <div v-for="column in columns" :key="column.key" class="column-filter">
        <label>{{ column.label }}</label>
        <input
          type="text"
          v-model="columnFilters[column.key]"
          :placeholder="`Search ${column.label}...`"
          class="filter-input"
        />
      </div>
    </div>

    <!-- 表格控制按钮 -->
    <div class="table-actions">
      <button @click="showColumnFilters = !showColumnFilters" class="btn btn-outline">
        {{ showColumnFilters ? 'Hide' : 'Show' }} Column Filters
      </button>
      <span class="records-info">
        Showing {{ startRecord }} to {{ endRecord }} of {{ totalRecords }} entries
      </span>
    </div>

    <!-- 数据表格 -->
    <div class="table-container">
      <table class="data-table">
        <thead>
          <tr>
            <th
              v-for="column in columns"
              :key="column.key"
              @click="sortBy(column.key)"
              class="sortable-header"
              :class="{
                'sort-asc': sortColumn === column.key && sortDirection === 'asc',
                'sort-desc': sortColumn === column.key && sortDirection === 'desc',
              }"
            >
              {{ column.label }}
              <span class="sort-indicator">
                <span v-if="sortColumn === column.key">
                  {{ sortDirection === 'asc' ? '↑' : '↓' }}
                </span>
                <span v-else class="sort-placeholder">↕</span>
              </span>
            </th>
            <th v-if="actions.length > 0" class="actions-column">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(row, index) in paginatedData" :key="row.id || index" class="data-row">
            <td v-for="column in columns" :key="column.key" class="data-cell">
              <!-- 自定义列渲染 -->
              <div v-if="column.render" v-html="column.render(row[column.key], row)"></div>
              <!-- 默认文本渲染 -->
              <span v-else>{{ formatCellValue(row[column.key], column.type) }}</span>
            </td>
            <td v-if="actions.length > 0" class="actions-cell">
              <button
                v-for="action in actions"
                :key="action.key"
                @click="action.handler(row)"
                :class="`btn btn-sm btn-${action.type || 'secondary'}`"
              >
                {{ action.label }}
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 分页控制 -->
    <div class="pagination-container">
      <div class="pagination-info">
        <label>
          Show
          <select v-model="pageSize" @change="updatePagination" class="page-size-select">
            <option value="5">5</option>
            <option value="10">10</option>
            <option value="25">25</option>
            <option value="50">50</option>
          </select>
          entries per page
        </label>
      </div>

      <div class="pagination-controls">
        <button @click="goToPage(1)" :disabled="currentPage === 1" class="btn btn-outline btn-sm">
          First
        </button>
        <button
          @click="goToPage(currentPage - 1)"
          :disabled="currentPage === 1"
          class="btn btn-outline btn-sm"
        >
          Previous
        </button>

        <span class="page-numbers">
          <button
            v-for="page in visiblePages"
            :key="page"
            @click="goToPage(page)"
            :class="`btn btn-sm ${page === currentPage ? 'btn-primary' : 'btn-outline'}`"
          >
            {{ page }}
          </button>
        </span>

        <button
          @click="goToPage(currentPage + 1)"
          :disabled="currentPage === totalPages"
          class="btn btn-outline btn-sm"
        >
          Next
        </button>
        <button
          @click="goToPage(totalPages)"
          :disabled="currentPage === totalPages"
          class="btn btn-outline btn-sm"
        >
          Last
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'InteractiveDataTable',
  props: {
    title: {
      type: String,
      default: 'Data Table',
    },
    data: {
      type: Array,
      required: true,
    },
    columns: {
      type: Array,
      required: true,
    },
    actions: {
      type: Array,
      default: () => [],
    },
    initialPageSize: {
      type: Number,
      default: 10,
    },
  },
  data() {
    return {
      globalSearch: '',
      columnFilters: {},
      showColumnFilters: false,
      sortColumn: '',
      sortDirection: 'asc',
      currentPage: 1,
      pageSize: this.initialPageSize,
    }
  },
  computed: {
    filteredData() {
      let filtered = [...this.data]

      // 全局搜索
      if (this.globalSearch) {
        const searchTerm = this.globalSearch.toLowerCase()
        filtered = filtered.filter((row) => {
          return this.columns.some((column) => {
            const value = row[column.key]
            return value && value.toString().toLowerCase().includes(searchTerm)
          })
        })
      }

      // 列搜索
      Object.keys(this.columnFilters).forEach((columnKey) => {
        const filterValue = this.columnFilters[columnKey]
        if (filterValue) {
          const searchTerm = filterValue.toLowerCase()
          filtered = filtered.filter((row) => {
            const value = row[columnKey]
            return value && value.toString().toLowerCase().includes(searchTerm)
          })
        }
      })

      return filtered
    },
    sortedData() {
      if (!this.sortColumn) return this.filteredData

      return [...this.filteredData].sort((a, b) => {
        const aVal = a[this.sortColumn]
        const bVal = b[this.sortColumn]

        let comparison = 0
        if (aVal > bVal) comparison = 1
        if (aVal < bVal) comparison = -1

        return this.sortDirection === 'desc' ? -comparison : comparison
      })
    },
    totalRecords() {
      return this.filteredData.length
    },
    totalPages() {
      return Math.ceil(this.totalRecords / this.pageSize)
    },
    startRecord() {
      return (this.currentPage - 1) * this.pageSize + 1
    },
    endRecord() {
      return Math.min(this.currentPage * this.pageSize, this.totalRecords)
    },
    paginatedData() {
      const start = (this.currentPage - 1) * this.pageSize
      const end = start + this.pageSize
      return this.sortedData.slice(start, end)
    },
    visiblePages() {
      const pages = []
      const maxVisible = 5
      let start = Math.max(1, this.currentPage - Math.floor(maxVisible / 2))
      let end = Math.min(this.totalPages, start + maxVisible - 1)

      if (end - start + 1 < maxVisible) {
        start = Math.max(1, end - maxVisible + 1)
      }

      for (let i = start; i <= end; i++) {
        pages.push(i)
      }

      return pages
    },
  },
  watch: {
    data: {
      handler() {
        this.resetFilters()
      },
      deep: true,
    },
  },
  mounted() {
    this.initializeColumnFilters()
  },
  methods: {
    initializeColumnFilters() {
      const filters = {}
      this.columns.forEach((column) => {
        filters[column.key] = ''
      })
      this.columnFilters = filters
    },
    sortBy(column) {
      if (this.sortColumn === column) {
        this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc'
      } else {
        this.sortColumn = column
        this.sortDirection = 'asc'
      }
      this.currentPage = 1
    },
    goToPage(page) {
      if (page >= 1 && page <= this.totalPages) {
        this.currentPage = page
      }
    },
    updatePagination() {
      this.currentPage = 1
    },
    resetFilters() {
      this.globalSearch = ''
      this.initializeColumnFilters()
      this.currentPage = 1
    },
    formatCellValue(value, type) {
      if (value === null || value === undefined) return ''

      switch (type) {
        case 'date':
          return new Date(value).toLocaleDateString()
        case 'currency':
          return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
          }).format(value)
        case 'number':
          return new Intl.NumberFormat().format(value)
        default:
          return value.toString()
      }
    },
    exportData() {
      // 简单的CSV导出
      const headers = this.columns.map((col) => col.label).join(',')
      const rows = this.filteredData.map((row) => {
        return this.columns
          .map((col) => {
            const value = row[col.key]
            return `"${value || ''}"`
          })
          .join(',')
      })

      const csv = [headers, ...rows].join('\n')
      const blob = new Blob([csv], { type: 'text/csv' })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${this.title.replace(/\s+/g, '_')}_export.csv`
      link.click()
      window.URL.revokeObjectURL(url)
    },
  },
}
</script>

<style scoped>
.interactive-table {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  padding: 20px;
  margin: 20px 0;
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 15px;
}

.table-header h3 {
  color: #2c3e50;
  margin: 0;
}

.table-controls {
  display: flex;
  gap: 15px;
  align-items: center;
}

.search-box {
  position: relative;
}

.search-input {
  padding: 8px 35px 8px 12px;
  border: 2px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  width: 250px;
}

.search-icon {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  color: #666;
}

.column-filters {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
  margin-bottom: 20px;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 8px;
}

.column-filter label {
  font-weight: bold;
  font-size: 12px;
  color: #2c3e50;
  margin-bottom: 5px;
  display: block;
}

.filter-input {
  width: 100%;
  padding: 6px 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 13px;
}

.table-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  flex-wrap: wrap;
  gap: 10px;
}

.records-info {
  color: #666;
  font-size: 14px;
}

.table-container {
  overflow-x: auto;
  margin-bottom: 20px;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}

.sortable-header {
  background: #f8f9fa;
  padding: 12px 8px;
  text-align: left;
  font-weight: bold;
  color: #2c3e50;
  cursor: pointer;
  user-select: none;
  border-bottom: 2px solid #dee2e6;
  position: relative;
}

.sortable-header:hover {
  background: #e9ecef;
}

.sort-indicator {
  margin-left: 8px;
  font-size: 12px;
}

.sort-placeholder {
  opacity: 0.3;
}

.sort-asc .sort-indicator,
.sort-desc .sort-indicator {
  color: #007bff;
  font-weight: bold;
}

.data-row:nth-child(even) {
  background: #f8f9fa;
}

.data-row:hover {
  background: #e3f2fd;
}

.data-cell,
.actions-cell {
  padding: 12px 8px;
  border-bottom: 1px solid #dee2e6;
}

.actions-cell {
  white-space: nowrap;
}

.actions-cell .btn {
  margin-right: 5px;
}

.pagination-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 15px;
}

.page-size-select {
  margin: 0 5px;
  padding: 4px 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.pagination-controls {
  display: flex;
  gap: 5px;
  align-items: center;
}

.page-numbers {
  display: flex;
  gap: 2px;
}

.btn {
  padding: 8px 12px;
  border: 1px solid #ddd;
  background: white;
  color: #333;
  border-radius: 4px;
  cursor: pointer;
  font-size: 13px;
  transition: all 0.2s;
}

.btn:hover:not(:disabled) {
  background: #f8f9fa;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-primary {
  background: #007bff;
  color: white;
  border-color: #007bff;
}

.btn-secondary {
  background: #6c757d;
  color: white;
  border-color: #6c757d;
}

.btn-outline {
  background: transparent;
}

.btn-sm {
  padding: 4px 8px;
  font-size: 12px;
}

@media (max-width: 768px) {
  .table-header {
    flex-direction: column;
    align-items: stretch;
  }

  .table-controls {
    justify-content: space-between;
  }

  .search-input {
    width: 200px;
  }

  .column-filters {
    grid-template-columns: 1fr;
  }

  .table-actions {
    flex-direction: column;
    align-items: stretch;
  }

  .pagination-container {
    flex-direction: column;
    align-items: stretch;
  }

  .pagination-controls {
    justify-content: center;
  }
}
</style>

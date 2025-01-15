<script setup>
import { ref, onMounted, watch } from 'vue'

const orders = ref([])
const filters = ref({
  offers: [],
  selectedOffers: [],
  status: '',
  dateRange: {
    start: '',
    end: ''
  }
})
const pagination = ref({
  currentPage: 1,
  perPage: 20,
  total: 0,
  lastPage: 1
})
const loading = ref(false)
const error = ref(null)

const statusOptions = [
  { value: 'new', label: 'Yangi' },
  { value: 'accept', label: 'Qabul qilindi' },
  { value: 'send', label: 'Yuborildi' },
  { value: 'cancel', label: 'Bekor qilindi' },
  { value: 'recall', label: 'Qayta qo\'ng\'iroq' },
  { value: 'call_late', label: 'Keyinroq qo\'ng\'iroq' }
]

const getStatusColor = (status) => {
  switch (status) {
    case 'new': return 'bg-blue-100 text-blue-800'
    case 'accept': return 'bg-green-100 text-green-800'
    case 'send': return 'bg-purple-100 text-purple-800'
    case 'cancel': return 'bg-red-100 text-red-800'
    case 'recall': return 'bg-yellow-100 text-yellow-800'
    case 'call_late': return 'bg-orange-100 text-orange-800'
    default: return 'bg-gray-100 text-gray-800'
  }
}

const getStatusLabel = (status) => {
  return statusOptions.find(opt => opt.value === status)?.label || status
}

const fetchOrders = async () => {
  try {
    loading.value = true
    error.value = null
    
    const token = localStorage.getItem('token')
    if (!token) {
      error.value = 'Token topilmadi. Iltimos, qaytadan tizimga kiring.'
      return
    }

    // Build query parameters
    const params = new URLSearchParams({
      page: pagination.value.currentPage.toString(),
      per_page: pagination.value.perPage.toString()
    })

    if (filters.value.selectedOffers.length > 0) {
      params.append('offers', filters.value.selectedOffers.join(','))
    }
    if (filters.value.status) {
      params.append('status', filters.value.status)
    }
    if (filters.value.dateRange.start) {
      params.append('start_date', filters.value.dateRange.start)
    }
    if (filters.value.dateRange.end) {
      params.append('end_date', filters.value.dateRange.end)
    }

    const response = await fetch(`https://api.mgoods.uz/api/web/orders/get?${params}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || `HTTP error! status: ${response.status}`)
    }

    if (data.status) {
      orders.value = data.data || []
      pagination.value = {
        currentPage: data.meta?.current_page || 1,
        perPage: data.meta?.per_page || 20,
        total: data.meta?.total || 0,
        lastPage: data.meta?.last_page || 1
      }
    } else {
      throw new Error(data.message || 'Buyurtmalarni yuklashda xatolik yuz berdi')
    }
  } catch (err) {
    console.error('Error fetching orders:', err)
    error.value = `Xatolik: ${err.message}`
  } finally {
    loading.value = false
  }
}

const handlePageChange = (page) => {
  pagination.value.currentPage = page
}

const handleFilterChange = () => {
  pagination.value.currentPage = 1
  fetchOrders()
}

const clearFilters = () => {
  filters.value.selectedOffers = []
  filters.value.status = ''
  filters.value.dateRange = {
    start: '',
    end: ''
  }
  handleFilterChange()
}

// Watch for page changes
watch(() => pagination.value.currentPage, fetchOrders)

onMounted(() => {
  fetchOrders()
})
</script>

<template>
  <div class="orders-page">
    <!-- Page Header -->
    <div class="page-header">
      <h1 class="page-title">Buyurtmalar</h1>
      <div class="page-actions">
        <button class="btn-secondary" @click="clearFilters">
          <i class="mdi mdi-filter-off"></i>
          Filtrlarni tozalash
        </button>
      </div>
    </div>

    <!-- Filters Section -->
    <div class="filters-section">
      <div class="filters-grid">
        <!-- Status Filter -->
        <div class="filter-group">
          <label class="filter-label">Status</label>
          <select 
            v-model="filters.status" 
            class="filter-select"
            @change="handleFilterChange"
          >
            <option value="">Barchasi</option>
            <option v-for="status in statusOptions" :key="status.value" :value="status.value">
              {{ status.label }}
            </option>
          </select>
        </div>

        <!-- Date Range Filter -->
        <div class="filter-group">
          <label class="filter-label">Boshlanish sana</label>
          <input 
            type="date" 
            v-model="filters.dateRange.start"
            class="filter-input"
            @change="handleFilterChange"
          >
        </div>

        <div class="filter-group">
          <label class="filter-label">Tugash sana</label>
          <input 
            type="date" 
            v-model="filters.dateRange.end"
            class="filter-input"
            @change="handleFilterChange"
          >
        </div>
      </div>
    </div>

    <!-- Error Message -->
    <div v-if="error" class="error-message">
      <i class="mdi mdi-alert-circle"></i>
      {{ error }}
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-state">
      <i class="mdi mdi-loading mdi-spin"></i>
      Buyurtmalar yuklanmoqda...
    </div>

    <!-- Orders Table -->
    <div v-else-if="orders.length > 0" class="orders-table-wrapper">
      <table class="orders-table">
        <thead>
          <tr>
            <th>№</th>
            <th>Offer</th>
            <th>Stream</th>
            <th>Status</th>
            <th>Yaratilgan</th>
            <th>O'zgartirilgan</th>
            <th>Izoh</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="order in orders" :key="order.order_no">
            <td>{{ order.order_no }}</td>
            <td>{{ order.offer_name }}</td>
            <td>{{ order.stream_name }}</td>
            <td>
              <span :class="['status-badge', getStatusColor(order.status)]">
                {{ getStatusLabel(order.status) }}
              </span>
            </td>
            <td>{{ order.created_at }}</td>
            <td>{{ order.edited_at }}</td>
            <td>{{ order.comment || '-' }}</td>
          </tr>
        </tbody>
      </table>

      <!-- Pagination -->
      <div class="pagination">
        <button 
          class="pagination-btn" 
          :disabled="pagination.currentPage === 1"
          @click="handlePageChange(pagination.currentPage - 1)"
        >
          <i class="mdi mdi-chevron-left"></i>
        </button>
        
        <span class="pagination-info">
          {{ pagination.currentPage }} / {{ pagination.lastPage }}
        </span>
        
        <button 
          class="pagination-btn" 
          :disabled="pagination.currentPage === pagination.lastPage"
          @click="handlePageChange(pagination.currentPage + 1)"
        >
          <i class="mdi mdi-chevron-right"></i>
        </button>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="empty-state">
      <i class="mdi mdi-package-variant"></i>
      <p>Buyurtmalar topilmadi</p>
      <button class="btn-primary" @click="clearFilters">Filtrlarni tozalash</button>
    </div>
  </div>
</template>

<style scoped>
.orders-page {
  padding: 1.5rem;
  background-color: var(--bg-primary);
  border-radius: 0.5rem;
  box-shadow: var(--shadow-sm);
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.page-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--text-primary);
}

.page-actions {
  display: flex;
  gap: 0.5rem;
}

.filters-section {
  margin-bottom: 1.5rem;
  padding: 1rem;
  background-color: var(--bg-secondary);
  border-radius: 0.5rem;
}

.filters-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  align-items: end;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.filter-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-secondary);
}

.filter-select,
.filter-input {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid var(--border-color);
  border-radius: 0.375rem;
  background-color: var(--bg-primary);
  color: var(--text-primary);
}

.filter-select:focus,
.filter-input:focus {
  outline: none;
  border-color: var(--accent-color);
  box-shadow: 0 0 0 2px var(--accent-light);
}

.orders-table-wrapper {
  overflow-x: auto;
}

.orders-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
}

.orders-table th,
.orders-table td {
  padding: 0.75rem 1rem;
  text-align: left;
  border-bottom: 1px solid var(--border-color);
  white-space: nowrap;
}

.orders-table th {
  background-color: var(--bg-secondary);
  font-weight: 500;
  color: var(--text-secondary);
  position: sticky;
  top: 0;
  z-index: 10;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.875rem;
  font-weight: 500;
}

.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  margin-top: 1.5rem;
  padding-top: 1rem;
  border-top: 1px solid var(--border-color);
}

.pagination-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  border: 1px solid var(--border-color);
  border-radius: 0.375rem;
  background-color: var(--bg-primary);
  color: var(--text-primary);
  cursor: pointer;
  transition: all 0.2s;
}

.pagination-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pagination-btn:not(:disabled):hover {
  border-color: var(--accent-color);
  color: var(--accent-color);
}

.pagination-info {
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.loading-state,
.empty-state,
.error-message {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  text-align: center;
  color: var(--text-secondary);
}

.loading-state i,
.empty-state i {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.error-message {
  color: #dc2626;
  background-color: #fee2e2;
  border-radius: 0.5rem;
  padding: 1rem;
}

.error-message i {
  font-size: 1.5rem;
  margin-right: 0.5rem;
}

.btn-primary,
.btn-secondary {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 0.375rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary {
  background-color: var(--accent-color);
  color: white;
}

.btn-primary:hover {
  background-color: var(--accent-hover);
}

.btn-secondary {
  background-color: var(--bg-secondary);
  color: var(--text-secondary);
}

.btn-secondary:hover {
  background-color: var(--border-color);
}

@media (max-width: 768px) {
  .orders-page {
    padding: 1rem;
  }

  .filters-grid {
    grid-template-columns: 1fr;
  }

  .orders-table th,
  .orders-table td {
    padding: 0.5rem;
    font-size: 0.875rem;
  }
}
</style>
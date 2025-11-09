<script setup lang="ts">
import { ref } from 'vue'
import type { ActivityFilters } from '@/shared/types/activity.types'

interface Emits {
  (e: 'apply-filters', filters: ActivityFilters): void
  (e: 'clear-filters'): void
}

const emit = defineEmits<Emits>()

const startDate = ref('')
const endDate = ref('')
const userId = ref('')
const actionType = ref('')
const status = ref<'' | 'success' | 'failure'>('')

const handleApplyFilters = () => {
  const filters: ActivityFilters = {}
  
  if (startDate.value) {
    filters.startDate = startDate.value
  }
  if (endDate.value) {
    filters.endDate = endDate.value
  }
  if (userId.value.trim()) {
    filters.userId = userId.value.trim()
  }
  if (actionType.value.trim()) {
    filters.actionType = actionType.value.trim()
  }
  if (status.value) {
    filters.status = status.value
  }
  
  emit('apply-filters', filters)
}

const handleClearFilters = () => {
  startDate.value = ''
  endDate.value = ''
  userId.value = ''
  actionType.value = ''
  status.value = ''
  emit('clear-filters')
}

const hasActiveFilters = () => {
  return startDate.value || endDate.value || userId.value || actionType.value || status.value
}
</script>

<template>
  <div class="card bg-base-200 mb-6">
    <div class="card-body">
      <h3 class="card-title text-lg">Filters</h3>
      
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <!-- Date Range -->
        <div class="form-control">
          <label class="label">
            <span class="label-text">Start Date</span>
          </label>
          <input
            v-model="startDate"
            type="date"
            class="input input-bordered w-full"
          />
        </div>
        
        <div class="form-control">
          <label class="label">
            <span class="label-text">End Date</span>
          </label>
          <input
            v-model="endDate"
            type="date"
            class="input input-bordered w-full"
          />
        </div>
        
        <!-- User ID -->
        <div class="form-control">
          <label class="label">
            <span class="label-text">User ID</span>
          </label>
          <input
            v-model="userId"
            type="text"
            placeholder="Filter by user ID..."
            class="input input-bordered w-full"
          />
        </div>
        
        <!-- Action Type -->
        <div class="form-control">
          <label class="label">
            <span class="label-text">Action Type</span>
          </label>
          <input
            v-model="actionType"
            type="text"
            placeholder="e.g., login, update, delete..."
            class="input input-bordered w-full"
          />
        </div>
        
        <!-- Status -->
        <div class="form-control">
          <label class="label">
            <span class="label-text">Status</span>
          </label>
          <select v-model="status" class="select select-bordered w-full">
            <option value="">All</option>
            <option value="success">Success</option>
            <option value="failure">Failure</option>
          </select>
        </div>
      </div>
      
      <!-- Action Buttons -->
      <div class="card-actions justify-end mt-4">
        <button
          class="btn btn-ghost btn-sm"
          @click="handleClearFilters"
          :disabled="!hasActiveFilters()"
        >
          Clear Filters
        </button>
        <button
          class="btn btn-primary btn-sm"
          @click="handleApplyFilters"
        >
          Apply Filters
        </button>
      </div>
    </div>
  </div>
</template>

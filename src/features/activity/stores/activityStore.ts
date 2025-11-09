/**
 * Activity Tracking Store
 * Manages state for activity logs, pagination, and filters
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { ActivityLog, ActivityFilters, ActivityQueryParams } from '@/shared/types/activity.types'
import { getLogs } from '../services/activityService'
import { handleApiError } from '@/shared/utils/errorHandler'

export const useActivityStore = defineStore('activity', () => {
  // State
  const logs = ref<ActivityLog[]>([])
  const totalCount = ref(0)
  const currentPage = ref(1)
  const pageSize = ref(10)
  const filters = ref<ActivityFilters>({})
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Getters
  const totalPages = computed(() => Math.ceil(totalCount.value / pageSize.value))
  
  const filteredLogs = computed(() => logs.value)

  // Actions
  async function fetchLogs(page: number = 1): Promise<void> {
    loading.value = true
    error.value = null
    
    try {
      const params: ActivityQueryParams = {
        page,
        pageSize: pageSize.value,
        sortBy: 'timestamp',
        sortOrder: 'desc',
        filters: filters.value,
      }

      const response = await getLogs(params)
      
      logs.value = response.data
      totalCount.value = response.total
      currentPage.value = response.page
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch activity logs'
      await handleApiError(err)
      throw err
    } finally {
      loading.value = false
    }
  }

  async function applyFilters(newFilters: ActivityFilters): Promise<void> {
    filters.value = { ...newFilters }
    await fetchLogs(1)
  }

  function clearFilters(): void {
    filters.value = {}
    fetchLogs(1)
  }

  function setPageSize(size: number): void {
    pageSize.value = size
    currentPage.value = 1
  }

  return {
    // State
    logs,
    totalCount,
    currentPage,
    pageSize,
    filters,
    loading,
    error,
    
    // Getters
    totalPages,
    filteredLogs,
    
    // Actions
    fetchLogs,
    applyFilters,
    clearFilters,
    setPageSize,
  }
})

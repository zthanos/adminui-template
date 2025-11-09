/**
 * User Management Store
 * Manages state for user list, pagination, and search
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { User, PaginationParams } from '@/shared/types/user.types'
import { getUsers, searchUsers, updateUserRoles } from '../services/userService'
import { useNotification } from '@/shared/composables/useNotification'
import { handleApiError } from '@/shared/utils/errorHandler'

export const useUserStore = defineStore('user', () => {
  // State
  const users = ref<User[]>([])
  const totalCount = ref(0)
  const currentPage = ref(1)
  const pageSize = ref(10)
  const searchQuery = ref('')
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Getters
  const totalPages = computed(() => Math.ceil(totalCount.value / pageSize.value))
  
  const filteredUsers = computed(() => users.value)

  // Actions
  async function fetchUsers(page: number = 1): Promise<void> {
    loading.value = true
    error.value = null
    
    try {
      const params: PaginationParams = {
        page,
        pageSize: pageSize.value,
      }

      const response = await getUsers(params)
      
      users.value = response.data
      totalCount.value = response.total
      currentPage.value = response.page
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch users'
      await handleApiError(err)
      throw err
    } finally {
      loading.value = false
    }
  }

  async function searchUsersAction(query: string): Promise<void> {
    loading.value = true
    error.value = null
    searchQuery.value = query
    
    try {
      const params: PaginationParams = {
        page: 1,
        pageSize: pageSize.value,
      }

      const response = await searchUsers(query, params)
      
      users.value = response.data
      totalCount.value = response.total
      currentPage.value = 1
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to search users'
      await handleApiError(err)
      throw err
    } finally {
      loading.value = false
    }
  }

  async function updateUserRolesAction(userId: string, roles: string[]): Promise<void> {
    loading.value = true
    error.value = null
    
    try {
      const updatedUser = await updateUserRoles(userId, roles)
      
      // Update user in the list
      const index = users.value.findIndex(u => u.id === userId)
      if (index !== -1) {
        users.value[index] = updatedUser
      }
      
      const { show } = useNotification()
      show('User roles updated successfully', 'success')
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to update user roles'
      await handleApiError(err)
      throw err
    } finally {
      loading.value = false
    }
  }

  function setPageSize(size: number): void {
    pageSize.value = size
    currentPage.value = 1
  }

  function clearSearch(): void {
    searchQuery.value = ''
    fetchUsers(1)
  }

  return {
    // State
    users,
    totalCount,
    currentPage,
    pageSize,
    searchQuery,
    loading,
    error,
    
    // Getters
    totalPages,
    filteredUsers,
    
    // Actions
    fetchUsers,
    searchUsers: searchUsersAction,
    updateUserRoles: updateUserRolesAction,
    setPageSize,
    clearSearch,
  }
})

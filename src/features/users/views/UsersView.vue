<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useUserStore } from '../stores/userStore'
import { usePermissions } from '@/shared/composables/usePermissions'
import AppLayout from '@/layouts/AppLayout.vue'
import UserTable from '../components/UserTable.vue'
import UserFilters from '../components/UserFilters.vue'
import UserRoleModal from '../components/UserRoleModal.vue'
import type { User } from '@/shared/types/user.types'

const userStore = useUserStore()
const { hasPermission } = usePermissions()

// Check permission
const canManageUsers = hasPermission('manage_users')

// Modal state
const selectedUser = ref<User | null>(null)
const isModalOpen = ref(false)

onMounted(() => {
  if (canManageUsers) {
    userStore.fetchUsers()
  }
})

const handleSearch = (query: string) => {
  userStore.searchUsers(query)
}

const handleClearSearch = () => {
  userStore.clearSearch()
}

const handlePageChange = (page: number) => {
  if (userStore.searchQuery) {
    userStore.searchUsers(userStore.searchQuery)
  } else {
    userStore.fetchUsers(page)
  }
}

const handleEditRoles = (user: User) => {
  selectedUser.value = user
  isModalOpen.value = true
}

const handleCloseModal = () => {
  isModalOpen.value = false
  selectedUser.value = null
}

const handleSaveRoles = async (userId: string, roles: string[]) => {
  try {
    await userStore.updateUserRoles(userId, roles)
    handleCloseModal()
  } catch (error) {
    // Error is already handled in the store
    console.error('Failed to update roles:', error)
  }
}
</script>

<template>
  <AppLayout>
    <div class="container mx-auto">
    <div class="mb-6">
      <h1 class="text-3xl font-bold">User Management</h1>
      <p class="text-base-content/60 mt-2">
        Manage user accounts and role assignments
      </p>
    </div>

    <div v-if="!canManageUsers" class="alert alert-warning">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="stroke-current shrink-0 h-6 w-6"
        fill="none"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
        />
      </svg>
      <span>You do not have permission to manage users.</span>
    </div>

    <div v-else class="card bg-base-100 shadow-xl">
      <div class="card-body">
        <UserFilters
          @search="handleSearch"
          @clear="handleClearSearch"
        />

        <UserTable
          :users="userStore.users"
          :loading="userStore.loading"
          :current-page="userStore.currentPage"
          :total-pages="userStore.totalPages"
          @edit-roles="handleEditRoles"
          @page-change="handlePageChange"
        />
      </div>
    </div>

    <UserRoleModal
      :user="selectedUser"
      :open="isModalOpen"
      @close="handleCloseModal"
      @save="handleSaveRoles"
    />
    </div>
  </AppLayout>
</template>

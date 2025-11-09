<script setup lang="ts">
import { computed } from 'vue'
import type { User } from '@/shared/types/user.types'
import TableSkeleton from '@/shared/ui/TableSkeleton.vue'

interface Props {
  users: User[]
  loading: boolean
  currentPage: number
  totalPages: number
}

interface Emits {
  (e: 'edit-roles', user: User): void
  (e: 'page-change', page: number): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const formatDate = (dateString: string | null): string => {
  if (!dateString) return 'Never'
  return new Date(dateString).toLocaleDateString()
}

const getStatusClass = (status: string): string => {
  switch (status) {
    case 'active':
      return 'badge-success'
    case 'inactive':
      return 'badge-warning'
    case 'suspended':
      return 'badge-error'
    default:
      return 'badge-ghost'
  }
}

const handleEditRoles = (user: User) => {
  emit('edit-roles', user)
}

const handlePageChange = (page: number) => {
  emit('page-change', page)
}

const pages = computed(() => {
  const pageArray = []
  for (let i = 1; i <= props.totalPages; i++) {
    pageArray.push(i)
  }
  return pageArray
})
</script>

<template>
  <div class="w-full">
    <!-- Loading skeleton -->
    <TableSkeleton v-if="loading" :rows="5" :columns="6" />

    <!-- Table -->
    <div v-else class="overflow-x-auto -mx-4 sm:mx-0">
      <table class="table table-zebra w-full min-w-max">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Roles</th>
            <th>Status</th>
            <th>Last Login</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="users.length === 0">
            <td colspan="6" class="text-center py-8 text-base-content/60">
              No users found
            </td>
          </tr>
          <tr v-else v-for="user in users" :key="user.id">
            <td>{{ user.name }}</td>
            <td>{{ user.email }}</td>
            <td>
              <div class="flex flex-wrap gap-1">
                <span
                  v-for="role in user.roles"
                  :key="role"
                  class="badge badge-sm badge-primary"
                >
                  {{ role }}
                </span>
              </div>
            </td>
            <td>
              <span class="badge badge-sm" :class="getStatusClass(user.status)">
                {{ user.status }}
              </span>
            </td>
            <td>{{ formatDate(user.lastLoginAt) }}</td>
            <td>
              <button
                class="btn btn-sm btn-ghost"
                @click="handleEditRoles(user)"
                :disabled="loading"
              >
                Edit Roles
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    <div v-if="totalPages > 1" class="flex justify-center mt-4">
      <div class="join">
        <button
          class="join-item btn btn-sm"
          :disabled="currentPage === 1 || loading"
          @click="handlePageChange(currentPage - 1)"
        >
          «
        </button>
        <button
          v-for="page in pages"
          :key="page"
          class="join-item btn btn-sm"
          :class="{ 'btn-active': page === currentPage }"
          :disabled="loading"
          @click="handlePageChange(page)"
        >
          {{ page }}
        </button>
        <button
          class="join-item btn btn-sm"
          :disabled="currentPage === totalPages || loading"
          @click="handlePageChange(currentPage + 1)"
        >
          »
        </button>
      </div>
    </div>
  </div>
</template>

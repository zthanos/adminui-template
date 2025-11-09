<script setup lang="ts">
import { computed } from 'vue'
import type { ActivityLog } from '@/shared/types/activity.types'
import TableSkeleton from '@/shared/ui/TableSkeleton.vue'

interface Props {
  logs: ActivityLog[]
  loading: boolean
  currentPage: number
  totalPages: number
}

interface Emits {
  (e: 'page-change', page: number): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const formatDateTime = (dateString: string): string => {
  return new Date(dateString).toLocaleString()
}

const getStatusClass = (status: string): string => {
  switch (status) {
    case 'success':
      return 'badge-success'
    case 'failure':
      return 'badge-error'
    default:
      return 'badge-ghost'
  }
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
            <th>Timestamp</th>
            <th>User</th>
            <th>Action</th>
            <th>Resource</th>
            <th>Status</th>
            <th>IP Address</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="logs.length === 0">
            <td colspan="6" class="text-center py-8 text-base-content/60">
              No activity logs found
            </td>
          </tr>
          <tr v-else v-for="log in logs" :key="log.id">
            <td class="whitespace-nowrap">{{ formatDateTime(log.timestamp) }}</td>
            <td>
              <div>
                <div class="font-medium">{{ log.userName }}</div>
                <div class="text-sm text-base-content/60">{{ log.userId }}</div>
              </div>
            </td>
            <td>
              <span class="badge badge-sm badge-outline">{{ log.action }}</span>
            </td>
            <td>
              <div>
                <div class="font-medium">{{ log.resourceType }}</div>
                <div v-if="log.resourceId" class="text-sm text-base-content/60">
                  {{ log.resourceId }}
                </div>
              </div>
            </td>
            <td>
              <span class="badge badge-sm" :class="getStatusClass(log.status)">
                {{ log.status }}
              </span>
            </td>
            <td class="text-sm">{{ log.ipAddress }}</td>
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

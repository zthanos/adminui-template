<script setup lang="ts">
import { onMounted } from 'vue'
import { useActivityStore } from '../stores/activityStore'
import { usePermissions } from '@/shared/composables/usePermissions'
import AppLayout from '@/layouts/AppLayout.vue'
import ActivityTable from '../components/ActivityTable.vue'
import ActivityFilters from '../components/ActivityFilters.vue'
import type { ActivityFilters as Filters } from '@/shared/types/activity.types'

const activityStore = useActivityStore()
const { hasPermission } = usePermissions()

// Check permission
const canViewAuditLogs = hasPermission('view_audit_logs')

onMounted(() => {
  if (canViewAuditLogs) {
    activityStore.fetchLogs()
  }
})

const handleApplyFilters = (filters: Filters) => {
  activityStore.applyFilters(filters)
}

const handleClearFilters = () => {
  activityStore.clearFilters()
}

const handlePageChange = (page: number) => {
  activityStore.fetchLogs(page)
}
</script>

<template>
  <AppLayout>
    <div class="container mx-auto">
    <div class="mb-6">
      <h1 class="text-3xl font-bold">Activity Logs</h1>
      <p class="text-base-content/60 mt-2">
        View system activity and audit logs
      </p>
    </div>

    <div v-if="!canViewAuditLogs" class="alert alert-warning">
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
      <span>You do not have permission to view audit logs.</span>
    </div>

    <div v-else>
      <ActivityFilters
        @apply-filters="handleApplyFilters"
        @clear-filters="handleClearFilters"
      />

      <div class="card bg-base-100 shadow-xl">
        <div class="card-body">
          <ActivityTable
            :logs="activityStore.logs"
            :loading="activityStore.loading"
            :current-page="activityStore.currentPage"
            :total-pages="activityStore.totalPages"
            @page-change="handlePageChange"
          />
        </div>
      </div>
    </div>
    </div>
  </AppLayout>
</template>

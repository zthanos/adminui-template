<!--
  Dashboard View
  Main dashboard with welcome message and statistics cards
-->
<template>
  <AppLayout>
    <div>
    <!-- Welcome Section -->
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-base-content">
        Welcome back, {{ userName }}!
      </h1>
      <p class="text-base-content/70 mt-2">
        Here's an overview of your admin dashboard
      </p>
    </div>

    <!-- Statistics Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <StatsCard
        title="Total Users"
        :value="isLoadingStats ? '...' : totalUsers"
        description="Registered users in the system"
        icon="👥"
        :loading="isLoadingStats"
      />
      
      <StatsCard
        title="Recent Activity"
        :value="isLoadingStats ? '...' : recentActivityCount"
        description="Activities in the last 24 hours"
        icon="📊"
        :loading="isLoadingStats"
      />
      
      <StatsCard
        title="Active Sessions"
        :value="activeSessions"
        description="Currently logged in users"
        icon="🔐"
      />
    </div>

    <!-- Quick Actions Section -->
    <div class="mt-8">
      <h2 class="text-xl font-semibold text-base-content mb-4">
        Quick Actions
      </h2>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <router-link
          v-if="hasPermission('manage_users')"
          to="/users"
          class="btn btn-outline btn-primary justify-start"
        >
          <span class="text-xl mr-2">👤</span>
          Manage Users
        </router-link>
        
        <router-link
          v-if="hasPermission('view_audit_logs')"
          to="/activity"
          class="btn btn-outline btn-secondary justify-start"
        >
          <span class="text-xl mr-2">📋</span>
          View Activity Logs
        </router-link>
        
        <router-link
          to="/profile"
          class="btn btn-outline btn-accent justify-start"
        >
          <span class="text-xl mr-2">⚙️</span>
          Edit Profile
        </router-link>
      </div>
    </div>
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useAuthStore } from '@/features/auth/stores/authStore'
import { useUserStore } from '@/features/users/stores/userStore'
import { useActivityStore } from '@/features/activity/stores/activityStore'
import AppLayout from '@/layouts/AppLayout.vue'
import StatsCard from '../components/StatsCard.vue'

const authStore = useAuthStore()
const userStore = useUserStore()
const activityStore = useActivityStore()

// Loading state
const isLoadingStats = ref(false)

// User information
const userName = computed(() => authStore.user?.name || 'User')

// Permission check
const hasPermission = computed(() => authStore.hasPermission)

// Statistics
const totalUsers = computed(() => userStore.totalCount || 0)
const recentActivityCount = computed(() => activityStore.totalCount || 0)
const activeSessions = computed(() => 1) // Placeholder - would come from a real API

// Fetch initial data
onMounted(async () => {
  isLoadingStats.value = true
  try {
    // Fetch user count if user has permission
    if (authStore.hasPermission('manage_users')) {
      await userStore.fetchUsers(1)
    }
    
    // Fetch activity count if user has permission
    if (authStore.hasPermission('view_audit_logs')) {
      await activityStore.fetchLogs(1)
    }
  } catch (error) {
    console.error('Failed to fetch dashboard data:', error)
  } finally {
    isLoadingStats.value = false
  }
})
</script>

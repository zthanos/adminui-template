<template>
  <div class="min-h-screen bg-base-200">
    <Sidebar>
      <!-- Main content area -->
      <div class="flex flex-col h-screen overflow-hidden">
        <!-- Navbar - Fixed at top -->
        <div class="flex-none">
          <Navbar />
        </div>

        <!-- Scrollable content area -->
        <div class="flex-1 overflow-y-auto">
          <!-- Breadcrumbs -->
          <Breadcrumbs v-if="showBreadcrumbs" />

          <!-- Page content -->
          <main class="p-6">
            <slot />
          </main>
        </div>
      </div>
    </Sidebar>

    <!-- Global notification toasts -->
    <NotificationToast />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import Sidebar from '@/shared/ui/Sidebar.vue'
import Navbar from '@/shared/ui/Navbar.vue'
import Breadcrumbs from '@/shared/ui/Breadcrumbs.vue'
import NotificationToast from '@/shared/ui/NotificationToast.vue'

const route = useRoute()

// Hide breadcrumbs on login and callback pages
const showBreadcrumbs = computed(() => {
  const hiddenRoutes = ['/login', '/callback']
  return !hiddenRoutes.includes(route.path)
})
</script>

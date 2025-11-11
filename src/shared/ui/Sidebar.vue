<template>
  <div class="drawer lg:drawer-open">
    <input id="sidebar-drawer" type="checkbox" class="drawer-toggle" v-model="isOpen" />
    <div class="drawer-content">
      <!-- Page content will be rendered here by parent -->
      <slot />
    </div>
    <div class="drawer-side z-40">
      <label for="sidebar-drawer" aria-label="close sidebar" class="drawer-overlay"></label>
      <aside
        :class="[
          'bg-base-200 min-h-full w-64 transition-all duration-300',
          { 'lg:w-20': isCollapsed }
        ]"
      >
        <!-- Logo and collapse button -->
        <div class="flex items-center justify-between p-4 border-b border-base-300">
          <div v-if="!isCollapsed" class="flex items-center gap-2">
            <!-- SVG Logo -->
            <svg
              v-if="branding.logo.type === 'svg'"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="1.5"
              stroke="currentColor"
              :class="[branding.logo.width, branding.logo.height, branding.logo.color]"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                :d="branding.logo.svgPath"
              />
            </svg>
            <!-- Image Logo -->
            <img
              v-else
              :src="branding.logo.imageUrl"
              :alt="`${branding.title} logo`"
              :class="[branding.logo.width, branding.logo.height]"
            />
            <span class="text-xl font-bold">{{ branding.title }}</span>
          </div>
          <button
            @click="toggleCollapse"
            class="btn btn-ghost btn-sm btn-circle hidden lg:flex"
            :class="{ 'mx-auto': isCollapsed }"
            aria-label="Toggle sidebar"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="1.5"
              stroke="currentColor"
              class="w-5 h-5"
              :class="{ 'rotate-180': isCollapsed }"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M18.75 19.5l-7.5-7.5 7.5-7.5m-6 15L5.25 12l7.5-7.5"
              />
            </svg>
          </button>
        </div>

        <!-- Navigation menu -->
        <ul class="menu p-4 gap-2">
          <li v-for="item in visibleNavItems" :key="item.name">
            <router-link
              :to="item.path"
              :class="{ active: isActive(item.path) }"
              class="flex items-center gap-3"
            >
              <component :is="item.icon" class="w-5 h-5" />
              <span v-if="!isCollapsed">{{ item.label }}</span>
            </router-link>
          </li>
        </ul>
      </aside>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, h } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/features/auth/stores/authStore'
import { branding } from '@/shared/config/branding'

const COLLAPSE_STORAGE_KEY = 'sidebar-collapsed'

const route = useRoute()
const authStore = useAuthStore()

const isOpen = ref(false)
const isCollapsed = ref(false)

// Navigation items
const navItems = [
  {
    name: 'dashboard',
    path: '/dashboard',
    label: 'Dashboard',
    icon: () =>
      h(
        'svg',
        {
          xmlns: 'http://www.w3.org/2000/svg',
          fill: 'none',
          viewBox: '0 0 24 24',
          'stroke-width': '1.5',
          stroke: 'currentColor'
        },
        [
          h('path', {
            'stroke-linecap': 'round',
            'stroke-linejoin': 'round',
            d: 'M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25'
          })
        ]
      ),
    permission: null
  },
  {
    name: 'users',
    path: '/users',
    label: 'Users',
    icon: () =>
      h(
        'svg',
        {
          xmlns: 'http://www.w3.org/2000/svg',
          fill: 'none',
          viewBox: '0 0 24 24',
          'stroke-width': '1.5',
          stroke: 'currentColor'
        },
        [
          h('path', {
            'stroke-linecap': 'round',
            'stroke-linejoin': 'round',
            d: 'M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z'
          })
        ]
      ),
    permission: 'manage_users'
  },
  {
    name: 'activity',
    path: '/activity',
    label: 'Activity Logs',
    icon: () =>
      h(
        'svg',
        {
          xmlns: 'http://www.w3.org/2000/svg',
          fill: 'none',
          viewBox: '0 0 24 24',
          'stroke-width': '1.5',
          stroke: 'currentColor'
        },
        [
          h('path', {
            'stroke-linecap': 'round',
            'stroke-linejoin': 'round',
            d: 'M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z'
          })
        ]
      ),
    permission: 'view_audit_logs'
  },
  {
    name: 'profile',
    path: '/profile',
    label: 'Profile',
    icon: () =>
      h(
        'svg',
        {
          xmlns: 'http://www.w3.org/2000/svg',
          fill: 'none',
          viewBox: '0 0 24 24',
          'stroke-width': '1.5',
          stroke: 'currentColor'
        },
        [
          h('path', {
            'stroke-linecap': 'round',
            'stroke-linejoin': 'round',
            d: 'M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z'
          })
        ]
      ),
    permission: null
  }
]

// Filter navigation items based on permissions
const visibleNavItems = computed(() => {
  return navItems.filter((item) => {
    if (!item.permission) return true
    return authStore.hasPermission(item.permission)
  })
})

const isActive = (path: string) => {
  return route.path === path
}

const toggleCollapse = () => {
  isCollapsed.value = !isCollapsed.value
  localStorage.setItem(COLLAPSE_STORAGE_KEY, isCollapsed.value.toString())
}

const loadCollapseState = () => {
  const saved = localStorage.getItem(COLLAPSE_STORAGE_KEY)
  if (saved !== null) {
    isCollapsed.value = saved === 'true'
  }
}

onMounted(() => {
  loadCollapseState()
})
</script>

<style scoped>
.drawer-toggle:checked ~ .drawer-side {
  pointer-events: auto;
  visibility: visible;
}
</style>

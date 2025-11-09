/**
 * Vue Router Configuration
 */

import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

// Auth views
import LoginView from '@/features/auth/views/LoginView.vue'
import CallbackView from '@/features/auth/views/CallbackView.vue'

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'login',
    component: LoginView,
    meta: {
      requiresAuth: false,
      breadcrumb: 'Login',
    },
  },
  {
    path: '/callback',
    name: 'callback',
    component: CallbackView,
    meta: {
      requiresAuth: false,
      breadcrumb: 'Authenticating',
    },
  },
  {
    path: '/dashboard',
    name: 'dashboard',
    component: () => import('@/features/dashboard/views/DashboardView.vue'),
    meta: {
      requiresAuth: true,
      breadcrumb: 'Dashboard',
    },
  },
  {
    path: '/users',
    name: 'users',
    component: () => import('@/features/users/views/UsersView.vue'),
    meta: {
      requiresAuth: true,
      permission: 'manage_users',
      breadcrumb: 'User Management',
    },
  },
  {
    path: '/activity',
    name: 'activity',
    component: () => import('@/features/activity/views/ActivityView.vue'),
    meta: {
      requiresAuth: true,
      permission: 'view_audit_logs',
      breadcrumb: 'Activity Logs',
    },
  },
  {
    path: '/profile',
    name: 'profile',
    component: () => import('@/features/auth/views/ProfileView.vue'),
    meta: {
      requiresAuth: true,
      breadcrumb: 'Profile',
    },
  },
  {
    path: '/',
    redirect: '/dashboard',
  },
  {
    path: '/error',
    name: 'error',
    component: () => import('@/shared/ui/ErrorView.vue'),
    meta: {
      requiresAuth: false,
      breadcrumb: 'Error',
    },
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: () => import('@/shared/ui/NotFoundView.vue'),
    meta: {
      requiresAuth: false,
      breadcrumb: 'Not Found',
    },
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

// Import and register authentication guard
import { authGuard } from '@/shared/guards/authGuard'

router.beforeEach(authGuard)

export default router

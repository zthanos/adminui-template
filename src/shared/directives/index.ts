/**
 * Custom Vue Directives
 */

import type { Directive } from 'vue'
import { useAuthStore } from '@/features/auth/stores/authStore'

/**
 * v-permission directive
 * Conditionally renders elements based on user permissions
 * 
 * Usage:
 * <button v-permission="'manage_users'">Manage Users</button>
 * <div v-permission="['manage_users', 'view_audit_logs']">Content</div>
 */
export const vPermission: Directive<HTMLElement, string | string[]> = {
  mounted(el, binding) {
    const authStore = useAuthStore()
    const requiredPermissions = Array.isArray(binding.value) 
      ? binding.value 
      : [binding.value]

    // Check if user has at least one of the required permissions
    const hasPermission = requiredPermissions.some(permission => 
      authStore.hasPermission(permission)
    )

    if (!hasPermission) {
      // Remove element from DOM if user doesn't have permission
      el.style.display = 'none'
    }
  },
  
  updated(el, binding) {
    const authStore = useAuthStore()
    const requiredPermissions = Array.isArray(binding.value) 
      ? binding.value 
      : [binding.value]

    const hasPermission = requiredPermissions.some(permission => 
      authStore.hasPermission(permission)
    )

    // Toggle visibility based on permission
    el.style.display = hasPermission ? '' : 'none'
  }
}

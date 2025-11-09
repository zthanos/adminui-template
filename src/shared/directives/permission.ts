/**
 * v-permission Custom Directive
 * 
 * Conditionally renders elements based on user permissions
 * 
 * Usage:
 * - Single permission: v-permission="'manage_users'"
 * - Multiple permissions (OR): v-permission="['manage_users', 'view_users']"
 * - Multiple permissions (AND): v-permission.all="['manage_users', 'view_users']"
 */

import type { Directive, DirectiveBinding } from 'vue'
import { useAuthStore } from '@/features/auth/stores/authStore'

interface PermissionElement extends HTMLElement {
  _permissionOriginalDisplay?: string
}

export const vPermission: Directive = {
  mounted(el: PermissionElement, binding: DirectiveBinding) {
    checkPermission(el, binding)
  },
  updated(el: PermissionElement, binding: DirectiveBinding) {
    checkPermission(el, binding)
  },
}

function checkPermission(el: PermissionElement, binding: DirectiveBinding) {
  const authStore = useAuthStore()
  const { value, modifiers } = binding

  // Store original display value if not already stored
  if (el._permissionOriginalDisplay === undefined) {
    el._permissionOriginalDisplay = el.style.display || ''
  }

  let hasPermission = false

  if (typeof value === 'string') {
    // Single permission check
    hasPermission = authStore.hasPermission(value)
  } else if (Array.isArray(value)) {
    if (modifiers.all) {
      // AND logic - user must have all permissions
      hasPermission = value.every((permission) => authStore.hasPermission(permission))
    } else {
      // OR logic (default) - user must have at least one permission
      hasPermission = value.some((permission) => authStore.hasPermission(permission))
    }
  } else {
    console.warn('v-permission: Invalid value. Expected string or array of strings.')
    hasPermission = false
  }

  // Show or hide element based on permission
  if (hasPermission) {
    el.style.display = el._permissionOriginalDisplay
  } else {
    el.style.display = 'none'
  }
}

export default vPermission

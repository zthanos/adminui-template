/**
 * Permissions Composable
 * 
 * Provides permission checking functionality by wrapping authStore.hasPermission
 */

import { computed } from 'vue'
import { useAuthStore } from '@/features/auth/stores/authStore'

export function usePermissions() {
  const authStore = useAuthStore()

  /**
   * Check if the current user has a specific permission
   * @param permission - The permission string to check
   * @returns true if user has the permission, false otherwise
   */
  const hasPermission = (permission: string): boolean => {
    return authStore.hasPermission(permission)
  }

  /**
   * Check if the current user has any of the specified permissions (OR logic)
   * @param permissions - Array of permission strings
   * @returns true if user has at least one permission, false otherwise
   */
  const hasAnyPermission = (permissions: string[]): boolean => {
    return permissions.some((permission) => authStore.hasPermission(permission))
  }

  /**
   * Check if the current user has all of the specified permissions (AND logic)
   * @param permissions - Array of permission strings
   * @returns true if user has all permissions, false otherwise
   */
  const hasAllPermissions = (permissions: string[]): boolean => {
    return permissions.every((permission) => authStore.hasPermission(permission))
  }

  /**
   * Check if the current user has a specific role
   * @param role - The role string to check
   * @returns true if user has the role, false otherwise
   */
  const hasRole = (role: string): boolean => {
    return authStore.hasRole(role)
  }

  /**
   * Check if the current user has any of the specified roles (OR logic)
   * @param roles - Array of role strings
   * @returns true if user has at least one role, false otherwise
   */
  const hasAnyRole = (roles: string[]): boolean => {
    return roles.some((role) => authStore.hasRole(role))
  }

  /**
   * Check if the current user has all of the specified roles (AND logic)
   * @param roles - Array of role strings
   * @returns true if user has all roles, false otherwise
   */
  const hasAllRoles = (roles: string[]): boolean => {
    return roles.every((role) => authStore.hasRole(role))
  }

  /**
   * Reactive computed property for current user's permissions
   */
  const userPermissions = computed(() => authStore.userPermissions)

  /**
   * Reactive computed property for current user's roles
   */
  const userRoles = computed(() => authStore.userRoles)

  return {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    hasRole,
    hasAnyRole,
    hasAllRoles,
    userPermissions,
    userRoles,
  }
}

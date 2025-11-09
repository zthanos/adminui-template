/**
 * Authentication Guard
 * 
 * Protects routes by checking authentication status and permissions
 */

import type { NavigationGuardNext, RouteLocationNormalized } from 'vue-router'
import { useAuthStore } from '@/features/auth/stores/authStore'

export async function authGuard(
  to: RouteLocationNormalized,
  _from: RouteLocationNormalized,
  next: NavigationGuardNext
): Promise<void> {
  try {
    const authStore = useAuthStore()

    // Check if route requires authentication
    const requiresAuth = to.meta.requiresAuth !== false // Default to true

    // Allow public routes
    if (!requiresAuth) {
      next()
      return
    }

    // Check if user is authenticated
    if (!authStore.isAuthenticated) {
      // Store the original route for post-login redirect
      if (to.path !== '/login') {
        sessionStorage.setItem('redirect_after_login', to.fullPath)
      }
      
      // Redirect to login
      next({ name: 'login' })
      return
    }

    // Check permission if required
    const requiredPermission = to.meta.permission as string | undefined
    
    if (requiredPermission && !authStore.hasPermission(requiredPermission)) {
      // User doesn't have required permission
      // Redirect to dashboard with error message
      next({ 
        name: 'dashboard',
        query: { error: 'insufficient_permissions' }
      })
      return
    }

    // All checks passed, allow navigation
    next()
  } catch (error) {
    // Log error and redirect to error page
    console.error('[Auth Guard Error]', error)
    next({ 
      name: 'error',
      query: { message: 'Authentication check failed' }
    })
  }
}

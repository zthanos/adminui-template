/**
 * Global Error Handler
 * Centralized error handling with retry logic and notifications
 */

import { useAuthStore } from '@/features/auth/stores/authStore'
import { useNotification } from '@/shared/composables/useNotification'
import { AuthenticationError, AuthorizationError } from '@/shared/types/api.types'

const MAX_RETRY_ATTEMPTS = 3
const RETRY_DELAY_MS = 1000

/**
 * Handle API errors globally
 */
export async function handleApiError(error: unknown): Promise<void> {
  const { show } = useNotification()
  const authStore = useAuthStore()

  // Handle authentication errors (401)
  if (error instanceof AuthenticationError) {
    show('Your session has expired. Please log in again.', 'error')
    await authStore.logout()
    return
  }

  // Handle authorization errors (403)
  if (error instanceof AuthorizationError) {
    show('You do not have permission to perform this action.', 'error')
    return
  }

  // Handle network errors
  if (error instanceof Error && error.message.includes('Network error')) {
    show('Unable to connect to server. Please check your connection.', 'error')
    return
  }

  // Handle generic errors
  if (error instanceof Error) {
    show(error.message, 'error')
    return
  }

  // Fallback for unknown errors
  show('An unexpected error occurred. Please try again.', 'error')
}

/**
 * Retry function with exponential backoff
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxAttempts: number = MAX_RETRY_ATTEMPTS,
  delayMs: number = RETRY_DELAY_MS
): Promise<T> {
  let lastError: Error | undefined

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Unknown error')

      // Don't retry on authentication or authorization errors
      if (error instanceof AuthenticationError || error instanceof AuthorizationError) {
        throw error
      }

      // Don't retry if this was the last attempt
      if (attempt === maxAttempts) {
        break
      }

      // Wait before retrying with exponential backoff
      const delay = delayMs * Math.pow(2, attempt - 1)
      await sleep(delay)
    }
  }

  throw lastError || new Error('Max retry attempts reached')
}

/**
 * Check if error is retryable (network errors, 5xx errors)
 */
export function isRetryableError(error: unknown): boolean {
  if (error instanceof Error && error.message.includes('Network error')) {
    return true
  }

  // Check for 5xx server errors
  if (typeof error === 'object' && error !== null && 'status' in error) {
    const status = (error as any).status
    return status >= 500 && status < 600
  }

  return false
}

/**
 * Sleep utility for retry delays
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

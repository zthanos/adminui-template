/**
 * Error Handler Composable
 * Provides centralized error handling and logging
 */

import { useNotification } from './useNotification'

export interface ErrorContext {
  component?: string
  action?: string
  metadata?: Record<string, any>
}

export function useErrorHandler() {
  const { error: showError } = useNotification()

  /**
   * Handle and log errors
   */
  const handleError = (
    err: Error | unknown,
    context?: ErrorContext
  ): void => {
    const error = err instanceof Error ? err : new Error(String(err))
    
    // Log error for debugging
    console.error('[Error Handler]', {
      message: error.message,
      stack: error.stack,
      context,
      timestamp: new Date().toISOString()
    })

    // Show user-friendly notification
    const userMessage = getUserFriendlyMessage(error, context)
    showError(userMessage)
  }

  /**
   * Convert technical errors to user-friendly messages
   */
  const getUserFriendlyMessage = (
    error: Error,
    context?: ErrorContext
  ): string => {
    // Network errors
    if (error.message.includes('fetch') || error.message.includes('network')) {
      return 'Network error. Please check your connection and try again.'
    }

    // Authentication errors
    if (error.message.includes('auth') || error.message.includes('token')) {
      return 'Authentication error. Please log in again.'
    }

    // Permission errors
    if (error.message.includes('permission') || error.message.includes('forbidden')) {
      return 'You do not have permission to perform this action.'
    }

    // Validation errors
    if (error.message.includes('validation') || error.message.includes('invalid')) {
      return 'Invalid input. Please check your data and try again.'
    }

    // Context-specific messages
    if (context?.action) {
      return `Failed to ${context.action}. Please try again.`
    }

    // Generic fallback
    return 'An unexpected error occurred. Please try again.'
  }

  /**
   * Handle async operations with error handling
   */
  const withErrorHandling = async <T>(
    operation: () => Promise<T>,
    context?: ErrorContext
  ): Promise<T | null> => {
    try {
      return await operation()
    } catch (err) {
      handleError(err, context)
      return null
    }
  }

  return {
    handleError,
    getUserFriendlyMessage,
    withErrorHandling
  }
}

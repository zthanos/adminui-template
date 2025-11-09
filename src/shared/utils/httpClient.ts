/**
 * HTTP Client with interceptors for authentication and error handling
 */

import { useAuthStore } from '@/features/auth/stores/authStore'
import { AuthenticationError, AuthorizationError, type ApiError } from '@/shared/types/api.types'
import { isRetryableError } from './errorHandler'

// Base API URL from environment
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'

export interface RequestConfig extends RequestInit {
  skipAuth?: boolean
  retryCount?: number
  maxRetries?: number
}

/**
 * HTTP Client wrapper with interceptors
 */
class HttpClient {
  private baseURL: string
  private readonly DEFAULT_MAX_RETRIES = 3
  private readonly RETRY_DELAY_MS = 1000

  constructor(baseURL: string) {
    this.baseURL = baseURL
  }

  /**
   * Make HTTP request with interceptors and retry logic
   */
  async request<T>(endpoint: string, config: RequestConfig = {}): Promise<T> {
    const url = `${this.baseURL}${endpoint}`
    const maxRetries = config.maxRetries ?? this.DEFAULT_MAX_RETRIES
    const retryCount = config.retryCount ?? 0
    
    // Request interceptor - attach access token
    const requestConfig = this.requestInterceptor(config)

    try {
      const response = await fetch(url, requestConfig)
      
      // Response interceptor - handle errors
      return await this.responseInterceptor<T>(response)
    } catch (error) {
      // Handle network errors
      if (error instanceof TypeError && error.message.includes('fetch')) {
        const networkError = new Error('Network error: Unable to connect to server')
        
        // Retry network errors if retries are available
        if (retryCount < maxRetries && isRetryableError(networkError)) {
          await this.sleep(this.RETRY_DELAY_MS * Math.pow(2, retryCount))
          return this.request<T>(endpoint, { ...config, retryCount: retryCount + 1 })
        }
        
        throw networkError
      }

      // Retry 5xx errors if retries are available
      if (retryCount < maxRetries && isRetryableError(error)) {
        await this.sleep(this.RETRY_DELAY_MS * Math.pow(2, retryCount))
        return this.request<T>(endpoint, { ...config, retryCount: retryCount + 1 })
      }

      throw error
    }
  }

  /**
   * Sleep utility for retry delays
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }

  /**
   * Request interceptor - adds authentication and default headers
   */
  private requestInterceptor(config: RequestConfig): RequestInit {
    const headers = new Headers(config.headers)

    // Add default Content-Type if not set
    if (!headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/json')
    }

    // Attach access token unless skipAuth is true
    if (!config.skipAuth) {
      const authStore = useAuthStore()
      if (authStore.accessToken) {
        headers.set('Authorization', `Bearer ${authStore.accessToken}`)
      }
    }

    return {
      ...config,
      headers,
    }
  }

  /**
   * Response interceptor - handles errors and transforms responses
   */
  private async responseInterceptor<T>(response: Response): Promise<T> {
    // Success response
    if (response.ok) {
      // Handle empty responses
      const contentType = response.headers.get('Content-Type')
      if (contentType && contentType.includes('application/json')) {
        return await response.json()
      }
      return {} as T
    }

    // Error response - transform into typed error
    const apiError = await this.parseErrorResponse(response)
    
    // Transform specific status codes into typed errors
    switch (response.status) {
      case 401:
        throw new AuthenticationError(apiError.message || 'Authentication required')
      case 403:
        throw new AuthorizationError(apiError.message || 'Access denied')
      case 400:
      case 422:
        throw this.createValidationError(apiError)
      default:
        throw this.createApiError(apiError)
    }
  }

  /**
   * Parse error response from API
   */
  private async parseErrorResponse(response: Response): Promise<ApiError> {
    let errorData: any

    try {
      errorData = await response.json()
    } catch {
      errorData = { message: response.statusText }
    }

    return {
      status: response.status,
      message: errorData.message || 'An error occurred',
      code: errorData.code || 'UNKNOWN_ERROR',
      details: errorData.details,
    }
  }

  /**
   * Create validation error from API error
   */
  private createValidationError(apiError: ApiError): Error {
    const error = new Error(apiError.message)
    error.name = 'ValidationError'
    Object.assign(error, apiError)
    return error
  }

  /**
   * Create generic API error
   */
  private createApiError(apiError: ApiError): Error {
    const error = new Error(apiError.message)
    error.name = 'ApiError'
    Object.assign(error, apiError)
    return error
  }

  /**
   * Convenience methods for common HTTP verbs
   */

  async get<T>(endpoint: string, config?: RequestConfig): Promise<T> {
    return this.request<T>(endpoint, { ...config, method: 'GET' })
  }

  async post<T>(endpoint: string, data?: any, config?: RequestConfig): Promise<T> {
    return this.request<T>(endpoint, {
      ...config,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async put<T>(endpoint: string, data?: any, config?: RequestConfig): Promise<T> {
    return this.request<T>(endpoint, {
      ...config,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async patch<T>(endpoint: string, data?: any, config?: RequestConfig): Promise<T> {
    return this.request<T>(endpoint, {
      ...config,
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async delete<T>(endpoint: string, config?: RequestConfig): Promise<T> {
    return this.request<T>(endpoint, { ...config, method: 'DELETE' })
  }
}

// Export singleton instance
export const httpClient = new HttpClient(API_BASE_URL)

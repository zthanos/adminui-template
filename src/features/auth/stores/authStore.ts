/**
 * Authentication Pinia Store
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { UserProfile } from '@/shared/types/auth.types'
import {
  generatePKCEChallenge,
  exchangeCodeForTokens,
  getUserProfile,
  revokeTokens,
  getOAuthConfig,
  updateProfile,
} from '../services/authService'

export const useAuthStore = defineStore('auth', () => {
  // State
  const isAuthenticated = ref(false)
  const user = ref<UserProfile | null>(null)
  const accessToken = ref<string | null>(null)
  const idToken = ref<string | null>(null)
  const tokenExpiry = ref<number | null>(null)

  // Getters
  const userRoles = computed(() => user.value?.roles || [])
  const userPermissions = computed(() => user.value?.permissions || [])

  /**
   * Check if user has a specific permission
   */
  const hasPermission = computed(() => {
    return (permission: string): boolean => {
      if (!user.value) return false
      return user.value.permissions.includes(permission)
    }
  })

  /**
   * Check if user has a specific role
   */
  const hasRole = computed(() => {
    return (role: string): boolean => {
      if (!user.value) return false
      return user.value.roles.includes(role)
    }
  })

  // Actions

  /**
   * Initiate OAuth login flow with PKCE
   */
  async function initiateLogin(): Promise<void> {
    const config = getOAuthConfig()
    const { verifier, challenge } = await generatePKCEChallenge()

    // Store verifier in sessionStorage for callback
    sessionStorage.setItem('pkce_verifier', verifier)

    // Build authorization URL
    const params = new URLSearchParams({
      client_id: config.clientId,
      response_type: 'code',
      redirect_uri: config.redirectUri,
      scope: config.scope,
      code_challenge: challenge,
      code_challenge_method: 'S256',
      state: generateState(),
    })

    const authUrl = `${config.authorizationEndpoint}?${params.toString()}`
    
    // Redirect to OAuth provider
    window.location.href = authUrl
  }

  /**
   * Handle OAuth callback and exchange code for tokens
   */
  async function handleCallback(code: string): Promise<void> {
    const verifier = sessionStorage.getItem('pkce_verifier')
    
    if (!verifier) {
      throw new Error('PKCE verifier not found')
    }

    try {
      // Exchange code for tokens
      const tokenResponse = await exchangeCodeForTokens(code, verifier)
      
      // Store tokens
      accessToken.value = tokenResponse.access_token
      idToken.value = tokenResponse.id_token
      tokenExpiry.value = Date.now() + tokenResponse.expires_in * 1000

      // Fetch user profile
      const profile = await getUserProfile(tokenResponse.access_token)
      user.value = profile
      isAuthenticated.value = true

      // Start monitoring token expiry
      startTokenMonitoring()

      // Clean up
      sessionStorage.removeItem('pkce_verifier')
    } catch (error) {
      // Clean up on error
      sessionStorage.removeItem('pkce_verifier')
      throw error
    }
  }

  /**
   * Logout user and revoke tokens
   */
  async function logout(): Promise<void> {
    try {
      if (accessToken.value) {
        await revokeTokens(accessToken.value)
      }
    } catch (error) {
      console.error('Token revocation failed:', error)
    } finally {
      // Stop token monitoring
      if (typeof window !== 'undefined' && (window as any).__tokenMonitoringInterval) {
        clearInterval((window as any).__tokenMonitoringInterval)
        delete (window as any).__tokenMonitoringInterval
      }

      // Clear state
      isAuthenticated.value = false
      user.value = null
      accessToken.value = null
      idToken.value = null
      tokenExpiry.value = null

      // Clear session storage
      sessionStorage.removeItem('pkce_verifier')

      // Redirect to post-logout URI
      const config = getOAuthConfig()
      window.location.href = config.postLogoutUri
    }
  }

  /**
   * Refresh access token
   */
  async function refreshToken(): Promise<void> {
    // Note: Entra ID OAuth 2.0 with PKCE typically doesn't support refresh tokens
    // in the authorization code flow for SPAs. Token refresh would require
    // a refresh_token from the token response.
    
    // If refresh token is not available, we need to re-authenticate
    if (!tokenExpiry.value) {
      throw new Error('No token expiry information available')
    }

    // Check if token is actually expired
    const now = Date.now()
    if (now < tokenExpiry.value) {
      // Token is still valid
      return
    }

    // Token is expired - trigger logout and re-authentication
    console.warn('Token expired, logging out user')
    await logout()
  }

  /**
   * Check if token is expired or about to expire
   */
  function isTokenExpired(): boolean {
    if (!tokenExpiry.value) return true
    
    // Consider token expired if it expires in less than 5 minutes
    const EXPIRY_BUFFER_MS = 5 * 60 * 1000
    return Date.now() >= (tokenExpiry.value - EXPIRY_BUFFER_MS)
  }

  /**
   * Monitor token expiry and refresh if needed
   */
  function startTokenMonitoring(): void {
    // Check token expiry every minute
    const CHECK_INTERVAL_MS = 60 * 1000

    const intervalId = setInterval(async () => {
      if (isAuthenticated.value && isTokenExpired()) {
        try {
          await refreshToken()
        } catch (error) {
          console.error('Token refresh failed:', error)
          clearInterval(intervalId)
        }
      }
    }, CHECK_INTERVAL_MS)

    // Store interval ID for cleanup if needed
    if (typeof window !== 'undefined') {
      (window as any).__tokenMonitoringInterval = intervalId
    }
  }

  /**
   * Update user profile
   */
  async function updateUserProfile(updates: { displayName?: string }): Promise<void> {
    if (!accessToken.value) {
      throw new Error('No access token available')
    }

    try {
      const updatedProfile = await updateProfile(accessToken.value, updates)
      user.value = updatedProfile
    } catch (error) {
      throw error
    }
  }

  return {
    // State
    isAuthenticated,
    user,
    accessToken,
    idToken,
    tokenExpiry,
    
    // Getters
    userRoles,
    userPermissions,
    hasPermission,
    hasRole,
    
    // Actions
    initiateLogin,
    handleCallback,
    logout,
    refreshToken,
    updateUserProfile,
    isTokenExpired,
    startTokenMonitoring,
  }
})

// Helper function to generate random state
function generateState(): string {
  const randomValues = new Uint8Array(16)
  crypto.getRandomValues(randomValues)
  return Array.from(randomValues, (byte) => byte.toString(16).padStart(2, '0')).join('')
}

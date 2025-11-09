/**
 * Authentication Pinia Store
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { UserProfile, IDTokenPayload } from '@/shared/types/auth.types'
import {
  generatePKCEChallenge,
  exchangeCodeForTokens,
  getUserProfile,
  revokeTokens,
  getOIDCConfig,
  decodeIDToken,
  validateIDToken,
  refreshAccessToken,
  endSession,
} from '../services/oidcService'

export const useAuthStore = defineStore('auth', () => {
  // State
  const isAuthenticated = ref(false)
  const user = ref<UserProfile | null>(null)
  const accessToken = ref<string | null>(null)
  const idToken = ref<string | null>(null)
  const tokenExpiry = ref<number | null>(null)
  const refreshToken = ref<string | null>(null)
  const idTokenPayload = ref<IDTokenPayload | null>(null)

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
   * Initiate OIDC login flow with PKCE
   */
  async function initiateLogin(): Promise<void> {
    const config = getOIDCConfig()
    const { verifier, challenge } = await generatePKCEChallenge()

    // Store verifier in sessionStorage for callback
    sessionStorage.setItem('pkce_verifier', verifier)

    // Ensure openid scope is included
    const scopes = config.scope.split(' ')
    if (!scopes.includes('openid')) {
      scopes.unshift('openid')
    }

    // Build authorization URL
    const params = new URLSearchParams({
      client_id: config.clientId,
      response_type: 'code',
      redirect_uri: config.redirectUri,
      scope: scopes.join(' '),
      code_challenge: challenge,
      code_challenge_method: 'S256',
      state: generateState(),
    })

    const authUrl = `${config.authorizationEndpoint}?${params.toString()}`
    
    // Redirect to OIDC provider
    window.location.href = authUrl
  }

  /**
   * Handle OIDC callback and exchange code for tokens
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

      // Store refresh token if present
      if (tokenResponse.refresh_token) {
        refreshToken.value = tokenResponse.refresh_token
      }

      // Decode and validate ID token
      const config = getOIDCConfig()
      const decodedIdToken = decodeIDToken(tokenResponse.id_token)
      validateIDToken(decodedIdToken, config)
      
      // Store decoded ID token payload
      idTokenPayload.value = decodedIdToken

      // Fetch user profile from UserInfo endpoint or ID token
      const profile = await getUserProfile(tokenResponse.access_token, decodedIdToken)
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
    const currentIdToken = idToken.value
    const currentAccessToken = accessToken.value
    const currentRefreshToken = refreshToken.value

    try {
      // Revoke tokens if available
      if (currentAccessToken) {
        await revokeTokens(currentAccessToken, currentRefreshToken || undefined)
      }
    } catch (error) {
      console.error('Token revocation failed:', error)
    } finally {
      // Stop token monitoring
      if (typeof window !== 'undefined' && (window as any).__tokenMonitoringInterval) {
        clearInterval((window as any).__tokenMonitoringInterval)
        delete (window as any).__tokenMonitoringInterval
      }

      // Clear all local state
      isAuthenticated.value = false
      user.value = null
      accessToken.value = null
      idToken.value = null
      tokenExpiry.value = null
      refreshToken.value = null
      idTokenPayload.value = null

      // Clear session storage
      sessionStorage.removeItem('pkce_verifier')

      // End session at identity provider if configured
      if (currentIdToken) {
        endSession(currentIdToken)
      } else {
        // Fallback to local logout only if no ID token
        const config = getOIDCConfig()
        window.location.href = config.postLogoutRedirectUri
      }
    }
  }

  /**
   * Refresh access token using refresh token
   */
  async function refreshTokenAction(): Promise<void> {
    // If no refresh token available, logout and re-authenticate
    if (!refreshToken.value) {
      console.warn('No refresh token available, logging out user')
      await logout()
      return
    }

    try {
      // Use OIDC service to refresh tokens
      const tokenResponse = await refreshAccessToken(refreshToken.value)
      
      // Update stored tokens with refreshed values
      accessToken.value = tokenResponse.access_token
      idToken.value = tokenResponse.id_token
      tokenExpiry.value = Date.now() + tokenResponse.expires_in * 1000

      // Update refresh token if a new one was provided
      if (tokenResponse.refresh_token) {
        refreshToken.value = tokenResponse.refresh_token
      }

      // Decode and store new ID token payload
      const decodedIdToken = decodeIDToken(tokenResponse.id_token)
      idTokenPayload.value = decodedIdToken

      // Update user profile from new token
      const profile = await getUserProfile(tokenResponse.access_token, decodedIdToken)
      user.value = profile
    } catch (error) {
      // Clear session and logout if refresh fails
      console.error('Token refresh failed, logging out user:', error)
      await logout()
    }
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
          await refreshTokenAction()
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
   * Update user profile via backend API
   * Backend handles provider-specific profile update logic
   */
  async function updateUserProfile(updates: { displayName?: string }): Promise<void> {
    if (!accessToken.value) {
      throw new Error('No access token available')
    }

    try {
      // Call backend API endpoint for profile updates
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || ''
      const response = await fetch(`${apiBaseUrl}/api/user/profile`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken.value}`,
        },
        body: JSON.stringify(updates),
      })

      if (!response.ok) {
        // Check if profile updates are not supported
        if (response.status === 501 || response.status === 404) {
          throw new Error(
            'Profile updates are not supported by your identity provider. ' +
            'Please update your profile directly in your identity provider portal.'
          )
        }
        throw new Error(`Profile update failed: ${response.statusText}`)
      }

      const updatedProfile = await response.json()
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
    refreshToken,
    idTokenPayload,
    
    // Getters
    userRoles,
    userPermissions,
    hasPermission,
    hasRole,
    
    // Actions
    initiateLogin,
    handleCallback,
    logout,
    refreshToken: refreshTokenAction,
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

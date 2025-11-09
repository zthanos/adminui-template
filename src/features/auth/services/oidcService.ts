/**
 * OpenID Connect (OIDC) Authentication Service
 * Provider-agnostic OIDC implementation supporting Keycloak, Entra ID, Auth0, and other OIDC providers
 */

import type { TokenResponse, OIDCConfig, IDTokenPayload, UserProfile } from '@/shared/types/auth.types'
import { decodeJWT, isTokenExpired } from './tokenHandler'
import { extractUserProfile } from './claimsMapper'

/**
 * Get OIDC configuration from environment variables with backward compatibility
 * Falls back to VITE_OAUTH_* variables if VITE_OIDC_* are not set
 */
export function getOIDCConfig(): OIDCConfig {
  const hasOIDCConfig = !!import.meta.env.VITE_OIDC_CLIENT_ID
  const hasOAuthConfig = !!import.meta.env.VITE_OAUTH_CLIENT_ID

  // Log deprecation warning if using old OAuth variables
  if (hasOAuthConfig && !hasOIDCConfig) {
    console.warn(
      '⚠️ VITE_OAUTH_* environment variables are deprecated. ' +
      'Please migrate to VITE_OIDC_* variables. ' +
      'See documentation for migration guide.'
    )
  }

  return {
    // Core OIDC endpoints
    issuer: import.meta.env.VITE_OIDC_ISSUER,
    authorizationEndpoint:
      import.meta.env.VITE_OIDC_AUTHORIZATION_ENDPOINT ||
      import.meta.env.VITE_OAUTH_AUTHORIZATION_ENDPOINT,
    tokenEndpoint:
      import.meta.env.VITE_OIDC_TOKEN_ENDPOINT ||
      import.meta.env.VITE_OAUTH_TOKEN_ENDPOINT,
    userinfoEndpoint: import.meta.env.VITE_OIDC_USERINFO_ENDPOINT,
    endSessionEndpoint: import.meta.env.VITE_OIDC_END_SESSION_ENDPOINT,
    revocationEndpoint: import.meta.env.VITE_OIDC_REVOCATION_ENDPOINT,

    // Client configuration
    clientId:
      import.meta.env.VITE_OIDC_CLIENT_ID ||
      import.meta.env.VITE_OAUTH_CLIENT_ID,
    redirectUri:
      import.meta.env.VITE_OIDC_REDIRECT_URI ||
      import.meta.env.VITE_OAUTH_REDIRECT_URI,
    postLogoutRedirectUri:
      import.meta.env.VITE_OIDC_POST_LOGOUT_REDIRECT_URI ||
      import.meta.env.VITE_OAUTH_POST_LOGOUT_URI,
    scope:
      import.meta.env.VITE_OIDC_SCOPE ||
      import.meta.env.VITE_OAUTH_SCOPE ||
      'openid profile email',

    // Claims configuration
    rolesClaim: import.meta.env.VITE_OIDC_ROLES_CLAIM || 'roles',
    permissionsClaim: import.meta.env.VITE_OIDC_PERMISSIONS_CLAIM || 'permissions',
  }
}

/**
 * Generate PKCE code verifier and challenge
 * Copied from existing authService - no changes needed
 */
export async function generatePKCEChallenge(): Promise<{ verifier: string; challenge: string }> {
  // Generate random code verifier (43-128 characters)
  const verifier = generateRandomString(128)

  // Create SHA-256 hash of verifier
  const hash = await sha256(verifier)
  const challenge = base64URLEncode(hash)

  return { verifier, challenge }
}

/**
 * Exchange authorization code for tokens (enhanced for OIDC)
 * Returns TokenResponse with access_token, id_token, and optional refresh_token
 */
export async function exchangeCodeForTokens(
  code: string,
  verifier: string
): Promise<TokenResponse> {
  const config = getOIDCConfig()

  const params = new URLSearchParams({
    grant_type: 'authorization_code',
    client_id: config.clientId,
    code,
    redirect_uri: config.redirectUri,
    code_verifier: verifier,
  })

  const response = await fetch(config.tokenEndpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params.toString(),
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'token_exchange_failed' }))
    throw new Error(`Token exchange failed: ${error.error || response.statusText}`)
  }

  return response.json()
}

/**
 * Decode ID token JWT without external libraries
 * Uses tokenHandler utility for base64 decoding
 */
export function decodeIDToken(idToken: string): IDTokenPayload {
  try {
    return decodeJWT(idToken)
  } catch (error) {
    throw new Error(`Failed to decode ID token: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * Validate ID token claims
 * Verifies issuer, audience, and expiration according to OIDC spec
 */
export function validateIDToken(payload: IDTokenPayload, config: OIDCConfig): void {
  // Verify issuer if configured
  if (config.issuer && payload.iss !== config.issuer) {
    throw new Error(
      `Invalid token issuer. Expected: ${config.issuer}, Got: ${payload.iss}`
    )
  }

  // Verify audience
  const audiences = Array.isArray(payload.aud) ? payload.aud : [payload.aud]
  if (!audiences.includes(config.clientId)) {
    throw new Error(
      `Invalid token audience. Expected: ${config.clientId}, Got: ${audiences.join(', ')}`
    )
  }

  // Verify expiration (with 5-minute buffer)
  if (isTokenExpired(payload)) {
    throw new Error('ID token has expired')
  }

  // Verify issued at time is not in the future (with 5-minute clock skew tolerance)
  const now = Math.floor(Date.now() / 1000)
  const CLOCK_SKEW_TOLERANCE = 5 * 60 // 5 minutes
  if (payload.iat && payload.iat > now + CLOCK_SKEW_TOLERANCE) {
    throw new Error('ID token issued in the future')
  }
}

/**
 * Get user profile from UserInfo endpoint or ID token
 * Fetches user data from the standard OIDC UserInfo endpoint if configured,
 * otherwise extracts profile from ID token claims
 * 
 * @param accessToken - Access token for UserInfo endpoint authentication
 * @param idTokenPayload - Decoded ID token payload
 * @returns UserProfile with user data
 */
export async function getUserProfile(
  accessToken: string,
  idTokenPayload: IDTokenPayload
): Promise<UserProfile> {
  const config = getOIDCConfig()

  // If no UserInfo endpoint configured, use ID token only
  if (!config.userinfoEndpoint) {
    return extractUserProfile(
      idTokenPayload,
      undefined,
      config.rolesClaim,
      config.permissionsClaim
    )
  }

  // Try to fetch from UserInfo endpoint
  try {
    const response = await fetch(config.userinfoEndpoint, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })

    if (!response.ok) {
      console.warn(
        `UserInfo endpoint returned ${response.status}, falling back to ID token claims`
      )
      return extractUserProfile(
        idTokenPayload,
        undefined,
        config.rolesClaim,
        config.permissionsClaim
      )
    }

    // Parse UserInfo response as JSON
    const userinfoData = await response.json()

    // Merge UserInfo data with ID token claims (UserInfo takes precedence)
    return extractUserProfile(
      idTokenPayload,
      userinfoData,
      config.rolesClaim,
      config.permissionsClaim
    )
  } catch (error) {
    // Fallback to ID token only if UserInfo endpoint fails
    console.warn('UserInfo endpoint error, falling back to ID token claims:', error)
    return extractUserProfile(
      idTokenPayload,
      undefined,
      config.rolesClaim,
      config.permissionsClaim
    )
  }
}

/**
 * Refresh access token using refresh token
 * Calls the token endpoint with grant_type=refresh_token
 * 
 * @param refreshToken - Refresh token from previous token response
 * @returns New TokenResponse with updated tokens
 * @throws Error if refresh fails (caller should handle by logging out user)
 */
export async function refreshAccessToken(refreshToken: string): Promise<TokenResponse> {
  const config = getOIDCConfig()

  const params = new URLSearchParams({
    grant_type: 'refresh_token',
    refresh_token: refreshToken,
    client_id: config.clientId,
  })

  try {
    const response = await fetch(config.tokenEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'token_refresh_failed' }))
      throw new Error(`Token refresh failed: ${error.error || response.statusText}`)
    }

    return response.json()
  } catch (error) {
    // Throw error for caller to handle (should clear session and redirect to login)
    console.error('Token refresh failed:', error)
    throw new Error('Session expired, please log in again')
  }
}

/**
 * Revoke tokens at the identity provider
 * Calls the revocation endpoint if configured to invalidate tokens
 * 
 * @param accessToken - Access token to revoke
 * @param refreshToken - Optional refresh token to revoke
 */
export async function revokeTokens(
  accessToken: string,
  refreshToken?: string
): Promise<void> {
  const config = getOIDCConfig()

  // If no revocation endpoint configured, skip revocation
  if (!config.revocationEndpoint) {
    console.log('No revocation endpoint configured, skipping token revocation')
    return
  }

  // Revoke access token
  try {
    const params = new URLSearchParams({
      token: accessToken,
      client_id: config.clientId,
      token_type_hint: 'access_token',
    })

    const response = await fetch(config.revocationEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    })

    if (!response.ok) {
      console.error('Failed to revoke access token:', response.statusText)
    }
  } catch (error) {
    // Log error but don't fail logout
    console.error('Error revoking access token:', error)
  }

  // Revoke refresh token if provided
  if (refreshToken) {
    try {
      const params = new URLSearchParams({
        token: refreshToken,
        client_id: config.clientId,
        token_type_hint: 'refresh_token',
      })

      const response = await fetch(config.revocationEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params.toString(),
      })

      if (!response.ok) {
        console.error('Failed to revoke refresh token:', response.statusText)
      }
    } catch (error) {
      // Log error but don't fail logout
      console.error('Error revoking refresh token:', error)
    }
  }
}

/**
 * End session at the identity provider
 * Redirects to the end_session_endpoint with ID token hint and post-logout redirect URI
 * 
 * @param idToken - ID token to include as hint
 */
export function endSession(idToken: string): void {
  const config = getOIDCConfig()

  // If no end_session_endpoint configured, skip provider logout
  if (!config.endSessionEndpoint) {
    console.log('No end_session_endpoint configured, performing local logout only')
    return
  }

  // Build logout URL with parameters
  const params = new URLSearchParams({
    id_token_hint: idToken,
    post_logout_redirect_uri: config.postLogoutRedirectUri,
  })

  const logoutUrl = `${config.endSessionEndpoint}?${params.toString()}`

  // Redirect to identity provider logout
  window.location.href = logoutUrl
}

// Helper functions (copied from authService)

function generateRandomString(length: number): string {
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~'
  const randomValues = new Uint8Array(length)
  crypto.getRandomValues(randomValues)

  return Array.from(randomValues)
    .map((value) => charset[value % charset.length])
    .join('')
}

async function sha256(plain: string): Promise<ArrayBuffer> {
  const encoder = new TextEncoder()
  const data = encoder.encode(plain)
  return await crypto.subtle.digest('SHA-256', data)
}

function base64URLEncode(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer)
  let binary = ''
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i])
  }

  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '')
}

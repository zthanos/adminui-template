/**
 * OAuth 2.0 Authentication Service with PKCE
 */

import type { TokenResponse, UserProfile, OAuthConfig } from '@/shared/types/auth.types'

/**
 * Generate PKCE code verifier and challenge
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
 * Exchange authorization code for tokens
 */
export async function exchangeCodeForTokens(
  code: string,
  verifier: string
): Promise<TokenResponse> {
  const config = getOAuthConfig()
  
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
 * Get user profile from ID token or userinfo endpoint
 */
export async function getUserProfile(accessToken: string): Promise<UserProfile> {
  // Call Microsoft Graph API to get user profile
  // Note: This uses direct fetch since it's an external API (Microsoft Graph)
  const response = await fetch('https://graph.microsoft.com/v1.0/me', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })

  if (!response.ok) {
    throw new Error('Failed to fetch user profile')
  }

  const data = await response.json()
  
  // Transform Microsoft Graph response to UserProfile
  return {
    id: data.id,
    email: data.mail || data.userPrincipalName,
    name: data.displayName,
    roles: data.roles || [],
    permissions: data.permissions || [],
  }
}

/**
 * Revoke access tokens
 */
export async function revokeTokens(_accessToken: string): Promise<void> {
  // Entra ID doesn't have a standard revocation endpoint
  // Token revocation happens server-side when user logs out
  // This is a placeholder for future implementation
  console.log('Token revocation requested')
}

/**
 * Update user profile
 */
export async function updateProfile(
  accessToken: string,
  updates: { displayName?: string }
): Promise<UserProfile> {
  // Call Microsoft Graph API to update user profile
  // Note: This uses direct fetch since it's an external API (Microsoft Graph)
  const response = await fetch('https://graph.microsoft.com/v1.0/me', {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      displayName: updates.displayName,
    }),
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'profile_update_failed' }))
    throw new Error(`Profile update failed: ${error.error || response.statusText}`)
  }

  // Fetch updated profile
  return await getUserProfile(accessToken)
}

/**
 * Get OAuth configuration from environment variables
 */
export function getOAuthConfig(): OAuthConfig {
  return {
    authorizationEndpoint: import.meta.env.VITE_OAUTH_AUTHORIZATION_ENDPOINT,
    tokenEndpoint: import.meta.env.VITE_OAUTH_TOKEN_ENDPOINT,
    clientId: import.meta.env.VITE_OAUTH_CLIENT_ID,
    redirectUri: import.meta.env.VITE_OAUTH_REDIRECT_URI,
    postLogoutUri: import.meta.env.VITE_OAUTH_POST_LOGOUT_URI,
    scope: import.meta.env.VITE_OAUTH_SCOPE,
  }
}

// Helper functions

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

/**
 * Authentication-related type definitions
 */

export interface UserProfile {
  id: string
  email: string
  name: string
  roles: string[]
  permissions: string[]
}

export interface TokenResponse {
  access_token: string
  id_token: string
  token_type: string
  expires_in: number
  refresh_token?: string
}

export interface OAuthConfig {
  authorizationEndpoint: string
  tokenEndpoint: string
  clientId: string
  redirectUri: string
  postLogoutUri: string
  scope: string
}

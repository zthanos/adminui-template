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
  scope?: string
}

export interface OAuthConfig {
  authorizationEndpoint: string
  tokenEndpoint: string
  clientId: string
  redirectUri: string
  postLogoutUri: string
  scope: string
}

/**
 * OIDC Configuration Interface
 * Defines all OIDC endpoints and configuration options for provider-agnostic authentication
 */
export interface OIDCConfig {
  // Core OIDC endpoints
  authorizationEndpoint: string
  tokenEndpoint: string
  userinfoEndpoint?: string
  endSessionEndpoint?: string
  revocationEndpoint?: string
  issuer?: string // For token validation (Requirement 5.2)

  // Client configuration
  clientId: string
  redirectUri: string
  postLogoutRedirectUri: string
  scope: string

  // Claims configuration
  rolesClaim?: string // e.g., "roles", "realm_access.roles"
  permissionsClaim?: string
}

/**
 * ID Token Payload Interface
 * Represents the decoded JWT ID token structure following OIDC standards
 */
export interface IDTokenPayload {
  // Standard OIDC claims
  iss: string // Issuer
  sub: string // Subject (user ID)
  aud: string | string[] // Audience
  exp: number // Expiration time (Unix timestamp)
  iat: number // Issued at (Unix timestamp)

  // Standard profile claims
  email?: string
  email_verified?: boolean
  name?: string
  preferred_username?: string

  // Custom claims (provider-specific)
  [key: string]: any
}

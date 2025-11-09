/**
 * Claims Mapper Service
 * 
 * Handles extraction and transformation of user data from OIDC tokens and UserInfo responses.
 * Supports flexible claims mapping for different identity providers.
 * 
 * Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 4.1, 4.2, 4.3, 4.4, 4.5
 */

import type { IDTokenPayload, UserProfile } from '@/shared/types/auth.types'

/**
 * UserInfo response data structure
 * Can contain any claims returned by the identity provider's UserInfo endpoint
 */
interface UserInfoData {
  sub?: string
  email?: string
  email_verified?: boolean
  name?: string
  preferred_username?: string
  [key: string]: any
}

/**
 * Extract a nested claim from an object using dot notation
 * 
 * @param claims - The claims object to search
 * @param path - Dot-notation path (e.g., "realm_access.roles")
 * @returns The value at the specified path, or undefined if not found
 * 
 * @example
 * getNestedClaim({ realm_access: { roles: ['admin'] } }, 'realm_access.roles')
 * // Returns: ['admin']
 */
export function getNestedClaim(claims: Record<string, any>, path: string): any {
  if (!path || !claims) {
    return undefined
  }

  const parts = path.split('.')
  let current: any = claims

  for (const part of parts) {
    if (current === null || current === undefined || typeof current !== 'object') {
      return undefined
    }
    current = current[part]
  }

  return current
}

/**
 * Extract roles from claims using a configurable claim path
 * 
 * @param claims - The claims object (ID token or UserInfo data)
 * @param rolesClaim - The claim path to extract roles from (supports dot notation)
 * @returns Array of role strings, or empty array if not found
 * 
 * Requirements: 4.1, 4.2, 4.3, 4.4
 */
export function extractRoles(claims: Record<string, any>, rolesClaim: string = 'roles'): string[] {
  const rolesValue = getNestedClaim(claims, rolesClaim)

  // Handle array of strings
  if (Array.isArray(rolesValue)) {
    return rolesValue.filter(role => typeof role === 'string')
  }

  // Handle single string value
  if (typeof rolesValue === 'string') {
    return [rolesValue]
  }

  // Default to empty array if not found or invalid format
  return []
}

/**
 * Extract permissions from claims using a configurable claim path
 * 
 * @param claims - The claims object (ID token or UserInfo data)
 * @param permissionsClaim - The claim path to extract permissions from (supports dot notation)
 * @returns Array of permission strings, or empty array if not found
 * 
 * Requirements: 4.5
 */
export function extractPermissions(
  claims: Record<string, any>,
  permissionsClaim: string = 'permissions'
): string[] {
  const permissionsValue = getNestedClaim(claims, permissionsClaim)

  // Handle array of strings
  if (Array.isArray(permissionsValue)) {
    return permissionsValue.filter(permission => typeof permission === 'string')
  }

  // Handle single string value
  if (typeof permissionsValue === 'string') {
    return [permissionsValue]
  }

  // Default to empty array if not found or invalid format
  return []
}

/**
 * Extract user profile from ID token and optional UserInfo data
 * 
 * Priority order for user profile fields:
 * 1. UserInfo endpoint data (if available)
 * 2. ID token claims
 * 3. Default values
 * 
 * @param idToken - Decoded ID token payload
 * @param userinfoData - Optional UserInfo endpoint response data
 * @param rolesClaim - Claim path for roles (default: 'roles')
 * @param permissionsClaim - Claim path for permissions (default: 'permissions')
 * @returns UserProfile object with extracted data
 * 
 * Requirements: 3.1, 3.2, 3.3, 3.4, 3.5
 */
export function extractUserProfile(
  idToken: IDTokenPayload,
  userinfoData?: UserInfoData,
  rolesClaim: string = 'roles',
  permissionsClaim: string = 'permissions'
): UserProfile {
  // Combine claims with priority: UserInfo > ID token
  const combinedClaims = {
    ...idToken,
    ...(userinfoData || {})
  }

  // Extract user ID from sub claim (required by OIDC spec)
  const id = combinedClaims.sub || idToken.sub || ''

  // Extract email with priority: UserInfo > ID token > empty string
  const email = userinfoData?.email || idToken.email || ''

  // Extract name with fallback chain: name > preferred_username > empty string
  const name = 
    userinfoData?.name || 
    idToken.name || 
    userinfoData?.preferred_username || 
    idToken.preferred_username || 
    ''

  // Extract roles from combined claims
  const roles = extractRoles(combinedClaims, rolesClaim)

  // Extract permissions from combined claims
  const permissions = extractPermissions(combinedClaims, permissionsClaim)

  return {
    id,
    email,
    name,
    roles,
    permissions
  }
}

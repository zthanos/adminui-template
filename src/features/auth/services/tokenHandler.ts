/**
 * Token Handler Service
 * Provides utilities for JWT token decoding, validation, and expiration checking
 * without external dependencies
 */

import type { IDTokenPayload } from '@/shared/types/auth.types'

/**
 * Custom error for token validation failures
 */
export class TokenValidationError extends Error {
  constructor(
    message: string,
    public code: string
  ) {
    super(message)
    this.name = 'TokenValidationError'
  }
}

/**
 * Decodes a base64URL-encoded string
 * Base64URL is like base64 but uses - instead of + and _ instead of /
 * and removes padding (=)
 *
 * @param str - Base64URL encoded string
 * @returns Decoded string
 */
export function base64URLDecode(str: string): string {
  // Replace base64url characters with base64 characters
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/')

  // Add padding if needed
  const padding = base64.length % 4
  if (padding) {
    base64 += '='.repeat(4 - padding)
  }

  // Decode base64 to string
  try {
    // Use atob for browser environment
    const decoded = atob(base64)
    // Handle UTF-8 encoding
    return decodeURIComponent(
      decoded
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    )
  } catch (error) {
    throw new TokenValidationError('Failed to decode base64URL string', 'DECODE_ERROR')
  }
}

/**
 * Validates that a token has the correct JWT structure (3 parts separated by dots)
 *
 * @param token - JWT token string
 * @returns true if valid structure, false otherwise
 */
export function validateTokenStructure(token: string): boolean {
  if (!token || typeof token !== 'string') {
    return false
  }

  const parts = token.split('.')
  return parts.length === 3 && parts.every((part) => part.length > 0)
}

/**
 * Decodes a JWT token and returns the payload
 * Does NOT verify the signature - assumes the token comes from a trusted source
 *
 * @param token - JWT token string
 * @returns Decoded ID token payload
 * @throws TokenValidationError if token format is invalid
 */
export function decodeJWT(token: string): IDTokenPayload {
  if (!validateTokenStructure(token)) {
    throw new TokenValidationError('Invalid JWT format: token must have 3 parts', 'INVALID_FORMAT')
  }

  const parts = token.split('.')
  const payload = parts[1]

  try {
    const decoded = base64URLDecode(payload)
    return JSON.parse(decoded) as IDTokenPayload
  } catch (error) {
    if (error instanceof TokenValidationError) {
      throw error
    }
    throw new TokenValidationError('Failed to parse JWT payload', 'PARSE_ERROR')
  }
}

/**
 * Extracts claims (payload) from a JWT token
 * Alias for decodeJWT for semantic clarity
 *
 * @param token - JWT token string
 * @returns Decoded claims object
 */
export function extractClaims(token: string): IDTokenPayload {
  return decodeJWT(token)
}

/**
 * Checks if a token is expired based on the 'exp' claim
 * Includes a 5-minute buffer to account for clock skew and network latency
 *
 * @param token - JWT token string or decoded payload
 * @param bufferMinutes - Buffer time in minutes (default: 5)
 * @returns true if token is expired or will expire within buffer time
 */
export function isTokenExpired(token: string | IDTokenPayload, bufferMinutes: number = 5): boolean {
  try {
    const payload = typeof token === 'string' ? decodeJWT(token) : token

    if (!payload.exp) {
      // If no expiration claim, consider it expired for safety
      return true
    }

    // Convert exp (seconds) to milliseconds and subtract buffer
    const expirationTime = payload.exp * 1000
    const bufferMs = bufferMinutes * 60 * 1000
    const now = Date.now()

    return now >= expirationTime - bufferMs
  } catch (error) {
    // If we can't decode the token, consider it expired
    return true
  }
}

/**
 * API error handling type definitions
 */

export interface ApiError {
  status: number
  message: string
  code: string
  details?: Record<string, any>
}

export class AuthenticationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'AuthenticationError'
  }
}

export class AuthorizationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'AuthorizationError'
  }
}

export class ValidationError extends Error {
  public fields: Record<string, string[]>

  constructor(message: string, fields: Record<string, string[]>) {
    super(message)
    this.name = 'ValidationError'
    this.fields = fields
  }
}

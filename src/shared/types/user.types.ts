/**
 * User management type definitions
 */

export interface User {
  id: string
  email: string
  name: string
  roles: string[]
  status: 'active' | 'inactive' | 'suspended'
  createdAt: string
  lastLoginAt: string | null
}

export interface Role {
  id: string
  name: string
  permissions: string[]
  description: string
}

export interface PaginationParams {
  page: number
  pageSize: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

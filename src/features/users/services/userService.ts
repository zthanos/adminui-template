/**
 * User Management Service
 * Handles API calls for user CRUD operations
 */

import { httpClient } from '@/shared/utils/httpClient'
import type { User, PaginationParams, PaginatedResponse } from '@/shared/types/user.types'

/**
 * Get paginated list of users
 */
export async function getUsers(params: PaginationParams): Promise<PaginatedResponse<User>> {
  const queryParams = new URLSearchParams({
    page: params.page.toString(),
    pageSize: params.pageSize.toString(),
    ...(params.sortBy && { sortBy: params.sortBy }),
    ...(params.sortOrder && { sortOrder: params.sortOrder }),
  })

  return httpClient.get<PaginatedResponse<User>>(`/users?${queryParams.toString()}`)
}

/**
 * Search users by query string
 */
export async function searchUsers(
  query: string,
  params: PaginationParams
): Promise<PaginatedResponse<User>> {
  const queryParams = new URLSearchParams({
    q: query,
    page: params.page.toString(),
    pageSize: params.pageSize.toString(),
    ...(params.sortBy && { sortBy: params.sortBy }),
    ...(params.sortOrder && { sortOrder: params.sortOrder }),
  })

  return httpClient.get<PaginatedResponse<User>>(`/users/search?${queryParams.toString()}`)
}

/**
 * Update user roles
 */
export async function updateUserRoles(userId: string, roles: string[]): Promise<User> {
  return httpClient.put<User>(`/users/${userId}/roles`, { roles })
}

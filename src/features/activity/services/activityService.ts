/**
 * Activity Tracking Service
 * Handles API calls for activity log operations
 */

import { httpClient } from '@/shared/utils/httpClient'
import type { ActivityLog, ActivityQueryParams } from '@/shared/types/activity.types'
import type { PaginatedResponse } from '@/shared/types/user.types'

/**
 * Get paginated list of activity logs with filters
 */
export async function getLogs(params: ActivityQueryParams): Promise<PaginatedResponse<ActivityLog>> {
  const queryParams = new URLSearchParams({
    page: params.page.toString(),
    pageSize: params.pageSize.toString(),
    ...(params.sortBy && { sortBy: params.sortBy }),
    ...(params.sortOrder && { sortOrder: params.sortOrder }),
  })

  // Add filter parameters
  if (params.filters.startDate) {
    queryParams.append('startDate', params.filters.startDate)
  }
  if (params.filters.endDate) {
    queryParams.append('endDate', params.filters.endDate)
  }
  if (params.filters.userId) {
    queryParams.append('userId', params.filters.userId)
  }
  if (params.filters.actionType) {
    queryParams.append('actionType', params.filters.actionType)
  }
  if (params.filters.status) {
    queryParams.append('status', params.filters.status)
  }

  return httpClient.get<PaginatedResponse<ActivityLog>>(`/activity/logs?${queryParams.toString()}`)
}

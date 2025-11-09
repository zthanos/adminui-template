/**
 * Activity tracking and audit log type definitions
 */

import type { PaginationParams } from './user.types'

export interface ActivityLog {
  id: string
  userId: string
  userName: string
  action: string
  resourceType: string
  resourceId: string | null
  status: 'success' | 'failure'
  timestamp: string
  ipAddress: string
  userAgent: string
  details?: Record<string, any>
}

export interface ActivityFilters {
  startDate?: string
  endDate?: string
  userId?: string
  actionType?: string
  status?: 'success' | 'failure'
}

export interface ActivityQueryParams extends PaginationParams {
  filters: ActivityFilters
}

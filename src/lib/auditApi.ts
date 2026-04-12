import api from './api';

export interface AuditLog {
  _id: string;
  action: string;
  performedBy: string;
  performedByEmail: string;
  target: string;
  details?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface AuditApiResponse {
  data: AuditLog[];
  total?: number;
  page?: number;
  limit?: number;
}

/**
 * Audit Log API - Fetch activity logs from backend
 */
export const auditAPI = {
  /**
   * Get all audit logs with optional filtering
   * @param limit Maximum number of logs to return (default: 100)
   * @param skip Number of logs to skip (for pagination)
   * @param action Filter by action type
   * @param startDate ISO date string to filter logs after this date
   * @param endDate ISO date string to filter logs before this date
   */
  getAll: async (
    limit: number = 100,
    skip: number = 0,
    action?: string,
    startDate?: string,
    endDate?: string
  ): Promise<AuditApiResponse> => {
    const params: Record<string, any> = { limit, skip };
    if (action) params.action = action;
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    
    try {
      const response = await api.get('/admin/audit-logs', { params });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch audit logs:', error);
      throw error;
    }
  },

  /**
   * Get recent activity logs (last N entries)
   */
  getRecent: async (limit: number = 10): Promise<AuditLog[]> => {
    try {
      const response = await api.get('/admin/audit-logs', { params: { limit } });
      return response.data.data || response.data;
    } catch (error) {
      console.error('Failed to fetch recent activity:', error);
      return [];
    }
  },

  /**
   * Get activity logs by action type
   */
  getByAction: async (action: string, limit: number = 50): Promise<AuditLog[]> => {
    try {
      const response = await api.get('/admin/audit-logs', { 
        params: { action, limit } 
      });
      return response.data.data || response.data;
    } catch (error) {
      console.error(`Failed to fetch ${action} logs:`, error);
      return [];
    }
  },

  /**
   * Get activity logs within date range
   */
  getByDateRange: async (
    startDate: string,
    endDate: string,
    limit: number = 100
  ): Promise<AuditLog[]> => {
    try {
      const response = await api.get('/admin/audit-logs', {
        params: { startDate, endDate, limit }
      });
      return response.data.data || response.data;
    } catch (error) {
      console.error('Failed to fetch logs by date range:', error);
      return [];
    }
  },
};

import api from './api';

export const analyticsAPI = {
  getOverview: () => api.get('/admin/analytics/overview'),
  getSales: (params?: any) => api.get('/admin/analytics/sales', { params }),
  getRevenue: (params?: any) => api.get('/admin/analytics/revenue', { params }),
  getTopProducts: (params?: any) => api.get('/admin/analytics/top-products', { params }),
  getTopCustomers: (params?: any) => api.get('/admin/analytics/top-customers', { params }),
  getOrdersStats: (params?: any) => api.get('/admin/analytics/orders', { params }),
};

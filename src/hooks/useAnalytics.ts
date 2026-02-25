import useSWR from 'swr';
import { analyticsAPI } from '@/lib/analyticsApi';

export function useAnalyticsOverview() {
  const { data, error } = useSWR('/admin/analytics/overview', analyticsAPI.getOverview);
  return {
    overview: data?.data,
    isLoading: !error && !data,
    isError: error,
  };
}

export function useSalesAnalytics(params?: any) {
  const { data, error } = useSWR(['/admin/analytics/sales', params], () => analyticsAPI.getSales(params));
  return {
    sales: data?.data,
    isLoading: !error && !data,
    isError: error,
  };
}

export function useRevenueAnalytics(params?: any) {
  const { data, error } = useSWR(['/admin/analytics/revenue', params], () => analyticsAPI.getRevenue(params));
  return {
    revenue: data?.data,
    isLoading: !error && !data,
    isError: error,
  };
}

export function useTopProducts(params?: any) {
  const { data, error } = useSWR(['/admin/analytics/top-products', params], () => analyticsAPI.getTopProducts(params));
  return {
    topProducts: data?.data,
    isLoading: !error && !data,
    isError: error,
  };
}

export function useTopCustomers(params?: any) {
  const { data, error } = useSWR(['/admin/analytics/top-customers', params], () => analyticsAPI.getTopCustomers(params));
  return {
    topCustomers: data?.data,
    isLoading: !error && !data,
    isError: error,
  };
}

export function useOrdersStats(params?: any) {
  const { data, error } = useSWR(['/admin/analytics/orders', params], () => analyticsAPI.getOrdersStats(params));
  return {
    ordersStats: data?.data,
    isLoading: !error && !data,
    isError: error,
  };
}

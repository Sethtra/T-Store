import { useQuery } from '@tanstack/react-query';
import api from '../lib/api';
import type { Order } from './useOrders';

export interface DashboardStats {
  totalOrders: number;
  totalUsers: number;
  totalRevenue: number;
  totalVisitors: number;
  pendingOrders: number;
  revenueByPeriod: {
    day: number;
    week: number;
    month: number;
    year: number;
  };
}

export interface AdminDashboardData {
  stats: DashboardStats;
  recent_orders: Order[];
}

export const useAdminDashboardData = () => {
  return useQuery({
    queryKey: ['admin', 'dashboard-data'],
    queryFn: async (): Promise<AdminDashboardData> => {
      const response = await api.get('/admin/dashboard-data');
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });
};

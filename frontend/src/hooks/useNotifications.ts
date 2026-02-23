import { useQuery } from '@tanstack/react-query';
import api from '../lib/api';

export interface Notification {
  id: string;
  type: 'out_of_stock' | 'low_stock' | 'new_order';
  title: string;
  message: string;
  product_id?: number;
  order_id?: number;
  created_at: string;
}

export interface NotificationCounts {
  total: number;
  out_of_stock: number;
  low_stock: number;
  new_orders: number;
}

interface NotificationsResponse {
  notifications: Notification[];
  counts: NotificationCounts;
}

export const useAdminNotifications = () => {
  return useQuery({
    queryKey: ['admin', 'notifications'],
    queryFn: async (): Promise<NotificationsResponse> => {
      const response = await api.get('/admin/notifications');
      return response.data;
    },
    refetchInterval: 60000, // Poll every 60 seconds
    staleTime: 30000, // Consider fresh for 30 seconds
  });
};

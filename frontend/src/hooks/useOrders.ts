import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';

// Types — imported from centralized types directory, re-exported for backward compatibility
import type { Order, OrderItem, CreateOrderData } from '../types/order';
export type { Order, OrderItem, CreateOrderData };

// Customer: Fetch own orders
export const useOrders = () => {
  return useQuery({
    queryKey: ['orders'],
    queryFn: async (): Promise<Order[]> => {
      const response = await api.get('/orders');
      return response.data;
    },
    enabled: !!localStorage.getItem('auth_token'),
  });
};

// Customer: Fetch single order
export const useOrder = (id: number) => {
  return useQuery({
    queryKey: ['order', id],
    queryFn: async (): Promise<Order> => {
      const response = await api.get(`/orders/${id}`);
      return response.data;
    },
    enabled: !!id,
  });
};

// Customer: Create order (checkout)
export const useCreateOrder = () => {
  return useMutation({
    mutationFn: async (data: CreateOrderData) => {
      const response = await api.post('/orders', data);
      return response.data;
    },
  });
};

// Payment: Create Stripe Intent
export const useCreateStripeIntent = () => {
  return useMutation({
    mutationFn: async (data: { order_id: number }) => {
      const response = await api.post('/payment/stripe/create-intent', data);
      return response.data;
    },
  });
};

// Payment: Create ABA PayWay Transaction
export const useCreatePaywayTransaction = () => {
  return useMutation({
    mutationFn: async (data: { order_id: number }) => {
      const response = await api.post('/payment/payway/create', data);
      return response.data as { 
        order_id: number, 
        payway_response: { qrString?: string, qrImage?: string, abapay_deeplink?: string, status?: { code: string, message: string, tran_id: string } } 
      };
    },
  });
};

// Payment: Check PayWay payment status
export const useCheckPaywayStatus = () => {
  return useMutation({
    mutationFn: async (data: { order_id: number }) => {
      const response = await api.get('/payment/payway/status', { params: data });
      return response.data;
    },
  });
};

// Payment: Simulate PayWay Payment (Dev Mode)
export const useSimulatePaywayPayment = () => {
  return useMutation({
    mutationFn: async (data: { order_id: number }) => {
      const response = await api.post('/payment/payway/simulate', data);
      return response.data;
    },
  });
};

// Admin: Fetch all orders with filters
export interface AdminOrderFilters {
  status?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  perPage?: number;
}

export const useAdminOrders = (filters: AdminOrderFilters = {}) => {
  return useQuery({
    queryKey: ['admin', 'orders', filters],
    queryFn: async (): Promise<{ data: Order[]; meta: { total: number; current_page: number; last_page: number } }> => {
      const params = new URLSearchParams();
      if (filters.status) params.append('status', filters.status);
      if (filters.startDate) params.append('start_date', filters.startDate);
      if (filters.endDate) params.append('end_date', filters.endDate);
      if (filters.page) params.append('page', String(filters.page));
      if (filters.perPage) params.append('per_page', String(filters.perPage));
      
      const response = await api.get(`/admin/orders?${params.toString()}`);
      return response.data;
    },
  });
};

// Admin: Update order status
export const useUpdateOrderStatus = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, status }: { id: number; status: Order['status'] }) => {
      const response = await api.patch(`/admin/orders/${id}/status`, { status });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'orders'] });
    },
  });
};

// Admin: Dashboard stats
export interface DashboardStats {
  totalOrders: number;
  totalRevenue: number;
  pendingOrders: number;
  totalUsers: number;
  recentOrders: Order[];
  totalVisitors: number;
  revenueByPeriod: {
    day: number;
    week: number;
    month: number;
    year: number;
  };
}

export const useDashboardStats = () => {
  return useQuery({
    queryKey: ['admin', 'dashboard'],
    queryFn: async (): Promise<DashboardStats> => {
      const response = await api.get('/admin/dashboard');
      return response.data;
    },
    staleTime: 60 * 1000,
  });
};

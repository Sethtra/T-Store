import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';
import { useCartStore } from '../stores/cartStore';

// Types
export interface OrderItem {
  id: number;
  product_id: number;
  product_title: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: number;
  user_id: number;
  status: 'pending' | 'processing' | 'shipped' | 'completed' | 'cancelled';
  total: number;
  payment_intent?: string;
  items: OrderItem[];
  created_at: string;
  updated_at: string;
}

export interface CreateOrderData {
  items: {
    product_id: number;
    quantity: number;
  }[];
  payment_method: 'stripe' | 'paypal';
}

// Customer: Fetch own orders
export const useOrders = () => {
  return useQuery({
    queryKey: ['orders'],
    queryFn: async (): Promise<Order[]> => {
      const response = await api.get('/orders');
      return response.data;
    },
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
  const queryClient = useQueryClient();
  const clearCart = useCartStore((state) => state.clearCart);
  
  return useMutation({
    mutationFn: async (data: CreateOrderData) => {
      const response = await api.post('/orders', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      clearCart();
    },
  });
};

// Admin: Fetch all orders with filters
export interface AdminOrderFilters {
  status?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
}

export const useAdminOrders = (filters: AdminOrderFilters = {}) => {
  return useQuery({
    queryKey: ['admin', 'orders', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.status) params.append('status', filters.status);
      if (filters.startDate) params.append('start_date', filters.startDate);
      if (filters.endDate) params.append('end_date', filters.endDate);
      if (filters.page) params.append('page', String(filters.page));
      
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
  recentOrders: Order[];
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
    staleTime: 60 * 1000, // Refresh every minute
  });
};

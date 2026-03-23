import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';

export interface ProductInventory {
  id: number;
  title: string;
  price: number;
  stock: number;
  category: {
    id: number;
    name: string;
  };
}

export interface StockMovement {
  id: number;
  product_id: number;
  quantity_change: number;
  type: 'sale' | 'restock' | 'adjustment' | 'cancellation';
  reference: string | null;
  notes: string | null;
  created_at: string;
  created_by: {
    id: number;
    name: string;
  } | null;
}

export interface InventoryFilters {
  search?: string;
  status?: string; //  'in', 'low', 'out'
  category?: string;
  sort?: string;
  order?: 'asc' | 'desc';
  page?: number;
  per_page?: number;
}

// Fetch all products with stock
export const useAdminInventory = (filters: InventoryFilters = {}) => {
  return useQuery({
    queryKey: ['admin-inventory', filters],
    queryFn: async () => {
      const response = await api.get('/admin/inventory', { params: filters });
      return response.data;
    },
  });
};

// Fetch stock history for a product
export const useStockHistory = (productId: number | null, page = 1) => {
  return useQuery({
    queryKey: ['stock-history', productId, page],
    queryFn: async () => {
      if (!productId) return null;
      const response = await api.get(`/admin/inventory/${productId}/history`, { params: { page } });
      return response.data;
    },
    enabled: !!productId,
  });
};

// Manual Adjust Stock
export const useAdjustStock = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: { product_id: number; quantity_change: number; notes: string }) => {
      const response = await api.post('/admin/inventory/adjust', data);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin-inventory'] });
      queryClient.invalidateQueries({ queryKey: ['stock-history', variables.product_id] });
      queryClient.invalidateQueries({ queryKey: ['products'] }); // also useful if the public store is impacted
    },
  });
};

// Bulk Adjust Stock
export const useBulkAdjustStock = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: { adjustments: { product_id: number; quantity_change: number }[]; notes?: string }) => {
      const response = await api.post('/admin/inventory/bulk-adjust', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-inventory'] });
      queryClient.invalidateQueries({ queryKey: ['stock-history'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
};

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';

// Types — imported from centralized types directory, re-exported for backward compatibility
import type { AdminUser, AdminUserDetail, AdminUserFilters } from '../types/user';
export type { AdminUser, AdminUserDetail, AdminUserFilters };

// Admin: Fetch paginated users
export const useAdminUsers = (filters: AdminUserFilters = {}) => {
  return useQuery({
    queryKey: ['admin', 'users', filters],
    queryFn: async (): Promise<{ data: AdminUser[]; meta: { total: number; current_page: number; last_page: number; per_page: number } }> => {
      const params = new URLSearchParams();
      if (filters.search) params.append('search', filters.search);
      if (filters.role) params.append('role', filters.role);
      if (filters.status) params.append('status', filters.status);
      if (filters.page) params.append('page', String(filters.page));
      if (filters.perPage) params.append('per_page', String(filters.perPage));
      if (filters.sortBy) params.append('sort_by', filters.sortBy);
      if (filters.sortDir) params.append('sort_dir', filters.sortDir);

      const response = await api.get(`/admin/users?${params.toString()}`);
      return response.data;
    },
  });
};

// Admin: Fetch single user details
export const useAdminUser = (id: number | null) => {
  return useQuery({
    queryKey: ['admin', 'user', id],
    queryFn: async (): Promise<AdminUserDetail> => {
      const response = await api.get(`/admin/users/${id}`);
      return response.data;
    },
    enabled: !!id,
  });
};

// Admin: Update user role/status
export const useUpdateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: { role?: string; status?: string } }) => {
      const response = await api.put(`/admin/users/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'user'] });
    },
  });
};

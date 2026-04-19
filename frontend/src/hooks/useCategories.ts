import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';
import type { Category } from './useProducts';
export type { Category };

// Admin: Fetch categories hierarchically
export const useAdminCategories = () => {
  return useQuery({
    queryKey: ['admin', 'categories'],
    queryFn: async (): Promise<Category[]> => {
      const response = await api.get('/admin/categories');
      return response.data;
    },
  });
};

// Admin: Fetch all categories flat (for dropdown)
export const useAllCategories = () => {
  return useQuery({
    queryKey: ['admin', 'categories', 'all'],
    queryFn: async (): Promise<Category[]> => {
      const response = await api.get('/admin/categories/all');
      return response.data;
    },
  });
};

// Admin: Create category
export const useCreateCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { name: string; parent_id?: number | null }) => {
      const response = await api.post('/admin/categories', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'categories'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'categories', 'all'] });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
};

// Admin: Update category
export const useUpdateCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      id, 
      data 
    }: { 
      id: number; 
      data: { name?: string; parent_id?: number | null } 
    }) => {
      const response = await api.put(`/admin/categories/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'categories'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'categories', 'all'] });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
};

// Admin: Delete category
export const useDeleteCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/admin/categories/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'categories'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'categories', 'all'] });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
};

// Admin: Upload Category Image
export const useUploadCategoryImage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, file }: { id: number; file: File }) => {
      const formData = new FormData();
      formData.append('image', file);

      const response = await api.post(`/admin/categories/${id}/image`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'categories'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'categories', 'all'] });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
};

// Admin: Delete Category Image
export const useDeleteCategoryImage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const response = await api.delete(`/admin/categories/${id}/image`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'categories'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'categories', 'all'] });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
};

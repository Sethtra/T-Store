import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';
import type { Category } from './useProducts';

export interface CategoryDisplay {
  id: number;
  position: 'main' | 'featured' | 'small_1' | 'small_2';
  category_id: number | null;
  category?: Category;
  title: string;
  description: string | null;
  image_url: string | null;
  button_text: string;
  link: string | null;
  is_active: boolean;
  order: number;
  created_at: string;
  updated_at: string;
}

// Public: Fetch all active category displays
export const useCategoryDisplays = () => {
  return useQuery({
    queryKey: ['category-displays'],
    queryFn: async (): Promise<CategoryDisplay[]> => {
      const response = await api.get('/category-displays');
      return response.data;
    },
    staleTime: 10 * 60 * 1000, // Cache for 10 minutes
  });
};

// Admin: Fetch all category displays
export const useAdminCategoryDisplays = () => {
  return useQuery({
    queryKey: ['admin', 'category-displays'],
    queryFn: async (): Promise<CategoryDisplay[]> => {
      const response = await api.get('/admin/category-displays');
      return response.data;
    },
  });
};

// Admin: Update a category display
export const useUpdateCategoryDisplay = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<CategoryDisplay> }) => {
      const response = await api.put(`/admin/category-displays/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'category-displays'] });
      queryClient.invalidateQueries({ queryKey: ['category-displays'] });
    },
  });
};

// Admin: Upload image for a category display
export const useUploadCategoryDisplayImage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, file }: { id: number; file: File }) => {
      const formData = new FormData();
      formData.append('image', file);
      const response = await api.post(`/admin/category-displays/${id}/image`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'category-displays'] });
      queryClient.invalidateQueries({ queryKey: ['category-displays'] });
    },
  });
};

// Admin: Delete image from a category display
export const useDeleteCategoryDisplayImage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const response = await api.delete(`/admin/category-displays/${id}/image`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'category-displays'] });
      queryClient.invalidateQueries({ queryKey: ['category-displays'] });
    },
  });
};

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';

// Types
export interface MainBanner {
  id: number;
  type: 'main';
  image: string;
  title: string;
  title_gradient?: string;
  text_color?: string;
  tag?: string;
  description: string;
  primary_button_text?: string;
  primary_button_link?: string;
  secondary_button_text?: string;
  secondary_button_link?: string;
  is_active: boolean;
  order: number;
}

export interface SectionBanner {
  id: number;
  type: 'section';
  image: string;
  title: string;
  text_color?: string;
  description: string;
  button_text?: string;
  button_link?: string;
  is_active: boolean;
  order: number;
}

export type Banner = MainBanner | SectionBanner;

interface BannersResponse {
  main: MainBanner[];
  section: SectionBanner[];
}

// Public: Fetch main banners
export const useMainBanners = () => {
  return useQuery({
    queryKey: ['banners', 'main'],
    queryFn: async (): Promise<MainBanner[]> => {
      const response = await api.get('/banners/main');
      return response.data;
    },
  });
};

// Public: Fetch section banners
export const useSectionBanners = () => {
  return useQuery({
    queryKey: ['banners', 'section'],
    queryFn: async (): Promise<SectionBanner[]> => {
      const response = await api.get('/banners/section');
      return response.data;
    },
  });
};

// Admin: Fetch all banners
export const useAdminBanners = () => {
  return useQuery({
    queryKey: ['admin', 'banners'],
    queryFn: async (): Promise<BannersResponse> => {
      const response = await api.get('/admin/banners');
      return response.data;
    },
  });
};

// Admin: Create banner
export const useCreateBanner = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: FormData | Partial<Banner>) => {
      const response = await api.post('/admin/banners', data, {
        headers: data instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : {},
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'banners'] });
      queryClient.invalidateQueries({ queryKey: ['banners'] });
    },
  });
};

// Admin: Update banner
export const useUpdateBanner = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: FormData | Partial<Banner> }) => {
      const response = await api.put(`/admin/banners/${id}`, data, {
        headers: data instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : {},
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'banners'] });
      queryClient.invalidateQueries({ queryKey: ['banners'] });
    },
  });
};

// Admin: Delete banner
export const useDeleteBanner = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/admin/banners/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'banners'] });
      queryClient.invalidateQueries({ queryKey: ['banners'] });
    },
  });
};

// Admin: Reorder banners
export const useReorderBanners = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (banners: Array<{ id: number; order: number }>) => {
      const response = await api.post('/admin/banners/reorder', { banners });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'banners'] });
      queryClient.invalidateQueries({ queryKey: ['banners'] });
    },
  });
};

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';

export interface SiteSettings {
  site_logo: string | null;
  site_logo_url: string | null;
  site_favicon: string | null;
  site_favicon_url: string | null;
  site_name: string;
}

/**
 * Public hook — fetches site settings (logo, name) for display across the app.
 * Cached for 1 hour since these change very rarely.
 */
export const useSiteSettings = () => {
  return useQuery<SiteSettings>({
    queryKey: ['site-settings'],
    queryFn: async () => {
      const response = await api.get('/site-settings');
      return response.data;
    },
    staleTime: 60 * 60 * 1000, // 1 hour cache
  });
};

/**
 * Admin: Upload a new site logo.
 */
export const useUploadLogo = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('logo', file);
      const response = await api.post('/admin/site-settings/logo', formData);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['site-settings'] });
      queryClient.invalidateQueries({ queryKey: ['app-bootstrap'] });
    },
  });
};

/**
 * Admin: Delete the current site logo (revert to default).
 */
export const useDeleteLogo = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const response = await api.delete('/admin/site-settings/logo');
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['site-settings'] });
      queryClient.invalidateQueries({ queryKey: ['app-bootstrap'] });
    },
  });
};

/**
 * Admin: Update the site name.
 */
export const useUpdateSiteName = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (siteName: string) => {
      const response = await api.put('/admin/site-settings/name', { site_name: siteName });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['site-settings'] });
      queryClient.invalidateQueries({ queryKey: ['app-bootstrap'] });
    },
  });
};

/**
 * Admin: Upload a new site favicon.
 */
export const useUploadFavicon = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('favicon', file);
      const response = await api.post('/admin/site-settings/favicon', formData);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['site-settings'] });
    },
  });
};

/**
 * Admin: Delete the current site favicon (revert to default).
 */
export const useDeleteFavicon = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const response = await api.delete('/admin/site-settings/favicon');
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['site-settings'] });
    },
  });
};

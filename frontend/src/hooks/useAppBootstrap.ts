import { useQuery } from '@tanstack/react-query';
import api from '../lib/api';
import type { Category } from './useProducts';

export interface AppBootstrapData {
  categories: Category[];
  version: string;
}

export const useAppBootstrap = () => {
  return useQuery({
    queryKey: ['app-bootstrap'],
    queryFn: async (): Promise<AppBootstrapData> => {
      const response = await api.get('/app-bootstrap');
      return response.data;
    },
    staleTime: 60 * 60 * 1000, // Cache for 1 hour
  });
};

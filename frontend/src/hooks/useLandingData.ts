import { useQuery } from '@tanstack/react-query';
import api from '../lib/api';

// Types — imported from centralized types directory, re-exported for backward compatibility
import type { Product } from '../types/product';
import type {
  LandingSectionProduct,
  LandingSection,
  CategoryDisplay,
  Banner,
  LandingData,
} from '../types/landing';
export type { Product, LandingSectionProduct, LandingSection, CategoryDisplay, Banner, LandingData };

export const useLandingData = () => {
  return useQuery({
    queryKey: ['landing-data'],
    queryFn: async (): Promise<LandingData> => {
      const response = await api.get('/landing-data');
      return response.data;
    },
    staleTime: 10 * 60 * 1000, // Cache for 10 minutes
  });
};

import { useQuery } from '@tanstack/react-query';
import api from '../lib/api';
import type { Product } from './useProducts';

// Consolidated Types
export interface LandingSectionProduct {
  id: number;
  title: string;
  title_kh: string;
  slug: string;
  price: number;
  image_url: string;
  images: string[];
  category?: string;
  category_kh?: string;
}

export interface LandingSection {
  id: number;
  section_type: "hero_main" | "hero_featured" | "hero_small" | "curated_excellence";
  title: string;
  title_kh: string;
  description: string;
  description_kh: string;
  image?: string;
  custom_image?: string;
  order: number;
  product: LandingSectionProduct;
}

export interface CategoryDisplay {
  id: number;
  position: "main" | "featured" | "small_1" | "small_2";
  title: string;
  title_kh: string;
  description?: string;
  description_kh?: string;
  image_url: string;
  link: string;
  is_active: boolean;
}

export type { Product };

export interface Banner {
  id: number;
  title: string;
  title_kh: string;
  subtitle?: string;
  subtitle_kh?: string;
  description?: string;
  description_kh?: string;
  image_url: string;
  link_url?: string;
  order: number;
  is_active: boolean;
  type: 'main' | 'section';
}

export interface LandingData {
  banners: {
    main: Banner[];
    section: Banner[];
  };
  featured_products: Product[];
  landing_sections: LandingSection[];
  category_displays: CategoryDisplay[];
}

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

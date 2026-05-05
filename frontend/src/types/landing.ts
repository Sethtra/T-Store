// Landing Page Types
// Centralized type definitions — single source of truth

import type { Product } from './product';

export type SectionType = 'hero_main' | 'hero_featured' | 'hero_small' | 'curated_excellence';

export interface LandingSectionProduct {
  id: number;
  name?: string;
  title?: string;
  title_kh?: string;
  slug: string;
  price: number;
  image_url: string;
  images: string[];
  category?: string;
  category_kh?: string;
}

export interface LandingSection {
  id: number;
  section_type: SectionType;
  title: string;
  title_kh: string;
  description: string;
  description_kh: string;
  title_color?: string;
  description_color?: string;
  title_color_dark?: string;
  description_color_dark?: string;
  image?: string;
  custom_image?: string;
  order: number;
  product: LandingSectionProduct;
}

export interface LandingSectionFormData {
  section_type: SectionType;
  product_id: number;
  title?: string;
  title_kh?: string;
  description?: string;
  description_kh?: string;
  title_color?: string;
  description_color?: string;
  title_color_dark?: string;
  description_color_dark?: string;
  is_active?: boolean;
  order?: number;
}

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

export interface CategoryDisplay {
  id: number;
  position: 'main' | 'featured' | 'small_1' | 'small_2';
  category_id?: number | null;
  category?: any;
  title: string;
  title_kh: string | null;
  description?: string | null;
  description_kh?: string | null;
  image_url: string | null;
  button_text?: string;
  button_text_kh?: string | null;
  link: string | null;
  is_active: boolean;
  order?: number;
  created_at?: string;
  updated_at?: string;
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

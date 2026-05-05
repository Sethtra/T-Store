// Product & Category Types
// Centralized type definitions — single source of truth

export interface Product {
  id: number;
  slug: string;
  title: string;
  title_kh: string;
  description: string;
  description_kh: string;
  price: number;
  stock: number;
  sold: number;
  category_id: number | null;
  category?: Category;
  images: string[];
  attributes: Record<string, string | string[]>;
  created_at: string;
}

export interface Category {
  id: number;
  name: string;
  name_kh: string;
  slug: string;
  banner_image?: string;
  products_count?: number;
  parent_id?: number | null;
  children?: Category[];
}

export interface ProductFilters {
  search?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: 'price_asc' | 'price_desc' | 'newest' | 'popular';
  page?: number;
  limit?: number;
}

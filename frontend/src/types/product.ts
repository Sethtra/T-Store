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
  /** Optional "was" price; a discount shows when it is above price. */
  original_price?: number | string | null;
  stock: number;
  sold: number;
  category_id: number | null;
  category?: Category;
  images: string[];
  attributes: Record<string, string | string[]>;
  /** Phone specification groups; see utils/phoneSpecs.ts */
  specs?: PhoneSpecs | null;
  /** Colour options, each with a fixed six-angle photo set */
  colors?: ProductColor[];
  /** Memory options shoppers can buy (storefront) */
  active_variants?: ProductVariant[];
  /** All memory options, including switched-off ones (admin) */
  variants?: ProductVariant[];
  created_at: string;
}

/** One memory option (RAM and/or storage) with its own price and stock. */
export interface ProductVariant {
  id: number;
  ram: string | null;
  storage: string | null;
  price: number | string;
  original_price?: number | string | null;
  stock: number;
  is_active?: boolean;
  /** "12GB / 256GB" */
  label: string;
}

export type ColorAngle = 'front' | 'rear' | 'left' | 'right' | 'top' | 'bottom';

export interface ProductColor {
  id: number;
  name: string;
  name_kh?: string | null;
  hex?: string | null;
  images?: Partial<Record<ColorAngle, string | null>> | null;
  sort_order?: number;
}

export type PhoneOS = 'Android' | 'iOS' | 'HarmonyOS' | 'Other';

/** Every group has optional free text; typed fields feed filters and the card's headline specs. */
export interface PhoneSpecs {
  display?: { text?: string; size_in?: number; refresh_hz?: number };
  chipset?: { text?: string };
  rear_camera?: { text?: string };
  front_camera?: { text?: string };
  battery?: { text?: string; mah?: number };
  build?: { text?: string };
  software?: { text?: string; os?: PhoneOS };
  brightness?: { text?: string; nits?: number };
  memory?: { text?: string };
  charging?: { text?: string; watts?: number };
  size_weight?: { text?: string; weight_g?: number };
  connectivity?: { text?: string; five_g?: boolean; nfc?: boolean; esim?: boolean; wifi7?: boolean };
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

import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import api from '../lib/api';

// Types
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

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

// Fetch products with filters and pagination (PUBLIC - customer facing)
export const useProducts = (filters: ProductFilters = {}) => {
  return useQuery({
    queryKey: ['products', filters],
    queryFn: async (): Promise<PaginatedResponse<Product>> => {
      const params = new URLSearchParams();
      
      if (filters.search) params.append('search', filters.search);
      if (filters.category) params.append('category', filters.category);
      if (filters.minPrice) params.append('min_price', String(filters.minPrice));
      if (filters.maxPrice) params.append('max_price', String(filters.maxPrice));
      if (filters.sortBy) params.append('sort', filters.sortBy);
      if (filters.page) params.append('page', String(filters.page));
      if (filters.limit) params.append('limit', String(filters.limit));

      const response = await api.get(`/products?${params.toString()}`);
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    placeholderData: keepPreviousData, // Keep old data visible while loading new page
  });
};

// Fetch products for ADMIN panel (uses admin endpoint - always fresh, no backend cache)
export const useAdminProducts = (filters: ProductFilters = {}) => {
  return useQuery({
    queryKey: ['admin-products', filters],
    queryFn: async (): Promise<PaginatedResponse<Product>> => {
      const params = new URLSearchParams();
      
      if (filters.search) params.append('search', filters.search);
      if (filters.page) params.append('page', String(filters.page));
      if (filters.limit) params.append('limit', String(filters.limit));

      const response = await api.get(`/admin/products?${params.toString()}`);
      return response.data;
    },
    staleTime: 0, // Always fetch fresh data in admin
    placeholderData: keepPreviousData,
  });
};

// Fetch single product by slug (Now bundled with related products)
export const useProduct = (slug: string) => {
  return useQuery({
    queryKey: ['product', slug],
    queryFn: async (): Promise<{ product: Product; related: Product[] }> => {
      const response = await api.get(`/products/${slug}`);
      return response.data;
    },
    enabled: !!slug,
    staleTime: 5 * 60 * 1000,
  });
};

// Fetch featured products for homepage
export const useFeaturedProducts = () => {
  return useQuery({
    queryKey: ['products', 'featured'],
    queryFn: async (): Promise<Product[]> => {
      const response = await api.get('/products/featured');
      return response.data;
    },
    staleTime: 10 * 60 * 1000, // Cache for 10 minutes
  });
};

// Fetch categories
export const useCategories = () => {
  return useQuery({
    queryKey: ['categories'],
    queryFn: async (): Promise<Category[]> => {
      const response = await api.get('/categories');
      return response.data;
    },
    staleTime: 30 * 60 * 1000, // Cache for 30 minutes
  });
};

// Admin: Create product
export const useCreateProduct = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (product: Partial<Product> | FormData) => {
      // Axios automatically sets the correct Content-Type with boundary for FormData
      const response = await api.post('/admin/products', product);
      return response.data;
    },
    onSuccess: () => {
      // Invalidate both admin and public product caches
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
};

// Admin: Update product
export const useUpdateProduct = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<Product> | FormData }) => {
      // If data is FormData, we need to send POST with _method=PUT mechanism
      // because native PUT requests cannot parse multipart/form-data in PHP
      const isFormData = data instanceof FormData;
      const response = isFormData 
        ? await api.post(`/admin/products/${id}`, data)
        : await api.put(`/admin/products/${id}`, data);
      return response.data;
    },
    onSuccess: (updatedProduct) => {
      // Invalidate all products queries (admin + public)
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      // Also invalidate the specific product page by slug if we have it
      if (updatedProduct?.product?.slug) {
        queryClient.invalidateQueries({ queryKey: ['product', updatedProduct.product.slug] });
      }
    },
  });
};

// Admin: Delete product
export const useDeleteProduct = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/admin/products/${id}`);
    },
    onSuccess: () => {
      // Immediately wipe admin and public caches so deletion is instant
      queryClient.removeQueries({ queryKey: ['admin-products'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
};

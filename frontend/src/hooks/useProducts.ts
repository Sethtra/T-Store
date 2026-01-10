import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';

// Types
export interface Product {
  id: number;
  slug: string;
  title: string;
  description: string;
  price: number;
  stock: number;
  sold: number;
  category_id: number | null;
  category?: Category;
  images: string[];
  attributes: Record<string, string>;
  created_at: string;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  banner_image?: string;
  products_count?: number;
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

// Fetch products with filters and pagination
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
  });
};

// Fetch single product by slug
export const useProduct = (slug: string) => {
  return useQuery({
    queryKey: ['product', slug],
    queryFn: async (): Promise<Product> => {
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
    mutationFn: async (product: Partial<Product>) => {
      const response = await api.post('/admin/products', product);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
};

// Admin: Update product
export const useUpdateProduct = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<Product> }) => {
      const response = await api.put(`/admin/products/${id}`, data);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['product', variables.id] });
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
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
};

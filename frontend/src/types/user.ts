// User Types
// Centralized type definitions — single source of truth

export interface User {
  id: number;
  name: string;
  email: string;
  role: 'customer' | 'admin';
  created_at: string;
}

export interface AdminUser {
  id: number;
  name: string;
  email: string;
  role: string;
  status: string;
  google_id: boolean;
  orders_count: number;
  total_spent: number;
  created_at: string;
}

export interface AdminUserDetail extends AdminUser {
  stats: {
    total_orders: number;
    total_spent: number;
    last_order_at: string | null;
  };
  orders: {
    id: number;
    tracking_id: string;
    status: string;
    total: number;
    items_count: number;
    created_at: string;
  }[];
}

export interface AdminUserFilters {
  search?: string;
  role?: string;
  status?: string;
  page?: number;
  perPage?: number;
  sortBy?: string;
  sortDir?: string;
}

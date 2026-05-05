// Order Types
// Centralized type definitions — single source of truth

export interface OrderItem {
  id: number;
  product_id: number;
  product_title: string;
  quantity: number;
  price: number;
  product?: {
    image_url?: string;
    images?: string[];
  };
  attributes?: Record<string, string>;
}

export interface Order {
  id: number;
  user_id: number;
  tracking_id?: string;
  status: 'pending' | 'processing' | 'shipped' | 'completed' | 'cancelled';
  payment_status?: 'pending' | 'paid' | 'failed' | 'cancelled';
  total: number;
  payment_intent?: string;
  items: OrderItem[];
  shipping_email?: string;
  shipping_name?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateOrderData {
  items: {
    product_id: number;
    quantity: number;
  }[];
  payment_method: 'stripe' | 'payway';
}

export type OrderStatus = Order['status'];
export type PaymentStatus = NonNullable<Order['payment_status']>;

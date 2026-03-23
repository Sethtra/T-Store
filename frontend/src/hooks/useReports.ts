import { useQuery } from '@tanstack/react-query';
import api from '../lib/api';

export interface SalesSummary {
  revenue: { value: number; change: number };
  orders: { value: number; change: number };
  avg_order_value: { value: number; change: number };
  new_customers: { value: number; change: number };
}

export interface RevenueDataPoint {
  date: string;
  revenue: number;
  orders_count: number;
}

export interface TopProductData {
  id: number;
  title: string;
  total_quantity: number;
  total_revenue: number;
}

export const useSalesSummary = (days: number = 30) => {
  return useQuery({
    queryKey: ['reports-summary', days],
    queryFn: async () => {
      const response = await api.get('/admin/reports/summary', { params: { days } });
      return response.data;
    },
  });
};

export const useRevenueChart = (days: number = 30) => {
  return useQuery({
    queryKey: ['reports-revenue', days],
    queryFn: async () => {
      const response = await api.get('/admin/reports/revenue', { params: { days } });
      return response.data.data;
    },
  });
};

export const useTopProducts = (days: number = 30, limit: number = 5) => {
  return useQuery({
    queryKey: ['reports-top-products', days, limit],
    queryFn: async () => {
      const response = await api.get('/admin/reports/top-products', { params: { days, limit } });
      return response.data.data;
    },
  });
};

// Functions to trigger CSV downloads
export const exportOrdersCsv = (days: number = 30) => {
  // We use window.open for downloads so the browser handles the file save prompt
  const token = localStorage.getItem('token');
  const url = `${import.meta.env.VITE_API_URL || 'http://localhost:8000/api'}/admin/export/orders?days=${days}`;
  
  fetch(url, {
    headers: { Authorization: `Bearer ${token}` }
  })
  .then(response => response.blob())
  .then(blob => {
    const downloadUrl = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = `tstore_orders_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  });
};

export const exportProductsCsv = () => {
  const token = localStorage.getItem('token');
  const url = `${import.meta.env.VITE_API_URL || 'http://localhost:8000/api'}/admin/export/products`;
  
  fetch(url, {
    headers: { Authorization: `Bearer ${token}` }
  })
  .then(response => response.blob())
  .then(blob => {
    const downloadUrl = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = `tstore_products_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  });
};

export const exportUsersCsv = () => {
  const token = localStorage.getItem('token');
  const url = `${import.meta.env.VITE_API_URL || 'http://localhost:8000/api'}/admin/export/users`;
  
  fetch(url, {
    headers: { Authorization: `Bearer ${token}` }
  })
  .then(response => response.blob())
  .then(blob => {
    const downloadUrl = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = `tstore_users_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  });
};

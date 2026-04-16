import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../lib/api';
import { useCartStore } from './cartStore';

export interface User {
  id: number;
  name: string;
  email: string;
  role: 'customer' | 'admin';
  created_at: string;
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  
  // Actions
  login: (email: string, password: string, remember?: boolean) => Promise<void>;
  register: (name: string, email: string, password: string, password_confirmation: string) => Promise<void>;
  logout: () => Promise<void>;
  fetchUser: () => Promise<void>;
  setUser: (user: User | null) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isLoading: false,
      isAuthenticated: false,

      setUser: (user) => {
        set({ user, isAuthenticated: !!user });
      },

      login: async (email, password, remember) => {
        set({ isLoading: true });
        try {
          const response = await api.post('/login', { email, password, remember: remember || false });
          if (response.data.token) {
            localStorage.setItem('auth_token', response.data.token);
          }
          await get().fetchUser();
        } finally {
          set({ isLoading: false });
        }
      },

      register: async (name, email, password, password_confirmation) => {
        set({ isLoading: true });
        try {
          const response = await api.post('/register', { name, email, password, password_confirmation });
          if (response.data.token) {
            localStorage.setItem('auth_token', response.data.token);
          }
          await get().fetchUser();
        } finally {
          set({ isLoading: false });
        }
      },

      logout: async () => {
        set({ isLoading: true });
        try {
          await api.post('/logout');
        } catch {
          // Ignore failures on logout (e.g. 401)
        } finally {
          localStorage.removeItem('auth_token');
          set({ user: null, isAuthenticated: false, isLoading: false });
          // Clear cart on logout to ensure privacy across accounts
          useCartStore.getState().clearCart();
        }
      },

      fetchUser: async () => {
        set({ isLoading: true });
        try {
          const response = await api.get('/user');
          set({ user: response.data, isAuthenticated: true });
        } catch {
          set({ user: null, isAuthenticated: false });
        } finally {
          set({ isLoading: false });
        }
      },
    }),
    {
      name: 't-store-auth',
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
    }
  )
);


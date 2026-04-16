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
        useCartStore.getState().syncCartWithUser(user ? String(user.id) : null);
      },

      login: async (email, password, remember) => {
        set({ isLoading: true });
        try {
           // ... existing implementation remains here but we await fetchUser which handles the sync ...
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
          // Dettach from user cart and switch back to an empty guest cart
          useCartStore.getState().syncCartWithUser(null);
        }
      },

      fetchUser: async () => {
        set({ isLoading: true });
        try {
          const response = await api.get('/user');
          set({ user: response.data, isAuthenticated: true });
          useCartStore.getState().syncCartWithUser(String(response.data.id));
        } catch {
          set({ user: null, isAuthenticated: false });
          useCartStore.getState().syncCartWithUser(null);
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


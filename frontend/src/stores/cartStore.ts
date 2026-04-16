import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  id: number;
  slug: string;
  title: string;
  price: number;
  image: string;
  quantity: number;
  attributes?: Record<string, string>;
}

interface CartState {
  items: CartItem[]; // The currently active cart items
  isOpen: boolean;
  
  // Storage for multi-user carts
  savedCarts: Record<string, CartItem[]>;
  activeCartId: string; // 'guest' or internal user ID string
  
  // Computed
  totalItems: () => number;
  totalPrice: () => number;
  
  // Actions
  addItem: (item: Omit<CartItem, 'quantity'>) => void;
  removeItem: (id: number, attributes?: Record<string, string>) => void;
  updateQuantity: (id: number, quantity: number, attributes?: Record<string, string>) => void;
  clearCart: () => void;
  toggleCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  
  // Multi-user syncing
  syncCartWithUser: (userId: string | null) => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      savedCarts: { 'guest': [] },
      activeCartId: 'guest',

      totalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },

      totalPrice: () => {
        return get().items.reduce((total, item) => total + item.price * item.quantity, 0);
      },

      addItem: (item) => {
        const items = get().items;
        const existingItemIndex = items.findIndex((i) => {
          if (i.id !== item.id) return false;
          
          const itemAttrs = i.attributes || {};
          const newItemAttrs = item.attributes || {};
          const keys1 = Object.keys(itemAttrs).sort();
          const keys2 = Object.keys(newItemAttrs).sort();
          
          if (keys1.length !== keys2.length) return false;
          return keys1.every(key => itemAttrs[key] === newItemAttrs[key]);
        });

        let newItems;
        if (existingItemIndex > -1) {
          newItems = [...items];
          newItems[existingItemIndex].quantity += 1;
        } else {
          newItems = [...items, { ...item, quantity: 1 }];
        }

        const { savedCarts, activeCartId } = get();
        set({ 
            items: newItems,
            savedCarts: { ...savedCarts, [activeCartId]: newItems }
        });
      },

      removeItem: (id, attributes) => {
        const newItems = get().items.filter((item) => {
          if (item.id !== id) return true;
           if (attributes) {
              const itemAttrs = item.attributes || {};
              const targetAttrs = attributes || {};
              const keys1 = Object.keys(itemAttrs).sort();
              const keys2 = Object.keys(targetAttrs).sort();
               if (keys1.length !== keys2.length) return true;
               return !keys1.every(key => itemAttrs[key] === targetAttrs[key]);
           }
           return false;
        });

        const { savedCarts, activeCartId } = get();
        set({ 
            items: newItems,
            savedCarts: { ...savedCarts, [activeCartId]: newItems }
        });
      },

      updateQuantity: (id, quantity, attributes) => {
        if (quantity <= 0) {
            get().removeItem(id, attributes);
            return;
        }

        const newItems = get().items.map((item) => {
          if (item.id !== id) return item;
           if (attributes) {
              const itemAttrs = item.attributes || {};
              const targetAttrs = attributes;
              const keys1 = Object.keys(itemAttrs).sort();
              const keys2 = Object.keys(targetAttrs).sort();
              
              const isMatch = keys1.length === keys2.length && keys1.every(key => itemAttrs[key] === targetAttrs[key]);
              if (!isMatch) return item;
           }
           return { ...item, quantity };
        });

        const { savedCarts, activeCartId } = get();
        set({ 
            items: newItems,
            savedCarts: { ...savedCarts, [activeCartId]: newItems }
        });
      },

      clearCart: () => {
        const { savedCarts, activeCartId } = get();
        set({ 
            items: [],
            savedCarts: { ...savedCarts, [activeCartId]: [] }
        });
      },

      toggleCart: () => set({ isOpen: !get().isOpen }),
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),

      syncCartWithUser: (userId: string | null) => {
        const { savedCarts, activeCartId, items } = get();
        const targetId = userId || 'guest';

        if (activeCartId === targetId) return; // Already synced

        let updatedCarts = { ...savedCarts };

        // If a guest logs in AND has items in their guest cart, merge them into their user cart!
        if (activeCartId === 'guest' && targetId !== 'guest' && items.length > 0) {
            const userCart = updatedCarts[targetId] || [];
            
            // Simple merge: append guest items to user cart
            // (In a perfect world we would merge duplicate quantities, but this is sufficient)
            updatedCarts[targetId] = [...userCart, ...items];
            
            // Clear the guest cart so it's fresh for the next person
            updatedCarts['guest'] = [];
        }

        // Apply exactly the cart saved for this target user (or guest)
        const targetItems = updatedCarts[targetId] || [];

        set({
            activeCartId: targetId,
            items: targetItems,
            savedCarts: updatedCarts
        });
      }
    }),
    {
      name: 't-store-cart',
      partialize: (state) => ({ 
          items: state.items, 
          savedCarts: state.savedCarts, 
          activeCartId: state.activeCartId 
      }),
    }
  )
);

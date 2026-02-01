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
  items: CartItem[];
  isOpen: boolean;
  
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
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      totalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },

      totalPrice: () => {
        return get().items.reduce((total, item) => total + item.price * item.quantity, 0);
      },

      addItem: (item) => {
        const items = get().items;
        // Check if item exists with SAME ID and SAME attributes
        const existingItemIndex = items.findIndex((i) => {
          if (i.id !== item.id) return false;
          
          // Compare attributes deeply
          const itemAttrs = i.attributes || {};
          const newItemAttrs = item.attributes || {};
          
          const keys1 = Object.keys(itemAttrs).sort();
          const keys2 = Object.keys(newItemAttrs).sort();
          
          if (keys1.length !== keys2.length) return false;
          
          return keys1.every(key => itemAttrs[key] === newItemAttrs[key]);
        });

        if (existingItemIndex > -1) {
          const newItems = [...items];
          newItems[existingItemIndex].quantity += 1;
          set({ items: newItems });
        } else {
          set({ items: [...items, { ...item, quantity: 1 }] });
        }
      },

      removeItem: (id, attributes) => {
        set({
          items: get().items.filter((item) => {
            if (item.id !== id) return true;
             // If attributes provided, only remove matching one
             if (attributes) {
                const itemAttrs = item.attributes || {};
                const targetAttrs = attributes || {};
                const keys1 = Object.keys(itemAttrs).sort();
                const keys2 = Object.keys(targetAttrs).sort();
                 if (keys1.length !== keys2.length) return true; // Keep if length mismatch
                 return !keys1.every(key => itemAttrs[key] === targetAttrs[key]); // Keep if values mismatch
             }
             return false; // Remove if id matches and no attributes specified (or maybe we should require attributes for removal?)
             // NOTE: Ideally removeItem should probably take an index or a unique cart ID, but for now we filter. 
             // Behavior change: If user removes, we probably want to find the EXACT item.
          })
        });
      },

      updateQuantity: (id, quantity, attributes) => {
        if (quantity <= 0) {
           // We need to call remove with attributes
           // But typescript might complain if I just call removeItem(id) without attributes if I changed the signature
           // Let's implement logic here directly or fix signature
           const items = get().items.filter(item => {
               if (item.id !== id) return true;
                if (attributes) {
                    const itemAttrs = item.attributes || {};
                    const targetAttrs = attributes;
                     const keys1 = Object.keys(itemAttrs).sort();
                    const keys2 = Object.keys(targetAttrs).sort();
                    if (keys1.length !== keys2.length) return true; 
                    return !keys1.every(key => itemAttrs[key] === targetAttrs[key]);
                }
                return false;
           });
           set({ items });
           return;
        }

        set({
          items: get().items.map((item) => {
            if (item.id !== id) return item;
             
             // Check attributes if provided
             if (attributes) {
                const itemAttrs = item.attributes || {};
                const targetAttrs = attributes;
                const keys1 = Object.keys(itemAttrs).sort();
                const keys2 = Object.keys(targetAttrs).sort();
                
                const isMatch = keys1.length === keys2.length && keys1.every(key => itemAttrs[key] === targetAttrs[key]);
                if (!isMatch) return item;
             }
             
             return { ...item, quantity };
          }),
        });
      },

      clearCart: () => {
        set({ items: [] });
      },

      toggleCart: () => {
        set({ isOpen: !get().isOpen });
      },

      openCart: () => {
        set({ isOpen: true });
      },

      closeCart: () => {
        set({ isOpen: false });
      },
    }),
    {
      name: 't-store-cart',
      partialize: (state) => ({ items: state.items }),
    }
  )
);

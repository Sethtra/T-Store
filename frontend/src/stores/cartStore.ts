import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../lib/api';

export interface CartItem {
  id: number;
  slug: string;
  title: string;
  price: number;
  image: string;
  quantity: number;
  attributes?: Record<string, string>;
  cart_item_id?: number; // Backend exact ID
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
  syncCartWithUser: (userId: string | null) => Promise<void>;
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

        // Cloud sync if authenticated
        if (activeCartId !== 'guest') {
          api.post('/cart/items', {
            product_id: item.id,
            quantity: 1,
            attributes: item.attributes || null
          }).then((res) => {
             // Optionally update local items with real cart_item_ids from the server
             if (res.data?.cart) {
                 set({ 
                     items: res.data.cart,
                     savedCarts: { ...get().savedCarts, [activeCartId]: res.data.cart }
                 });
             }
          }).catch(console.error);
        }
      },

      removeItem: (id, attributes) => {
        const currentItem = get().items.find(item => {
            if (item.id !== id) return false;
            if (attributes) {
              const itemAttrs = item.attributes || {};
              const targetAttrs = attributes || {};
              const keys1 = Object.keys(itemAttrs).sort();
              const keys2 = Object.keys(targetAttrs).sort();
              if (keys1.length !== keys2.length) return false;
              return keys1.every(key => itemAttrs[key] === targetAttrs[key]);
           }
           return true; // Match if id matches and no attributes filter specified
        });

        const newItems = get().items.filter(item => item !== currentItem);

        const { savedCarts, activeCartId } = get();
        set({ 
            items: newItems,
            savedCarts: { ...savedCarts, [activeCartId]: newItems }
        });

        // Cloud sync if authenticated
        if (activeCartId !== 'guest' && currentItem?.cart_item_id) {
            api.delete(`/cart/items/${currentItem.cart_item_id}`).then((res) => {
                if (res.data?.cart) {
                    set({ 
                        items: res.data.cart,
                        savedCarts: { ...get().savedCarts, [activeCartId]: res.data.cart }
                    });
                }
            }).catch(console.error);
        }
      },

      updateQuantity: (id, quantity, attributes) => {
        if (quantity <= 0) {
            get().removeItem(id, attributes);
            return;
        }

        let targetItem: CartItem | undefined;
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
           targetItem = item;
           return { ...item, quantity };
        });

        const { savedCarts, activeCartId } = get();
        set({ 
            items: newItems,
            savedCarts: { ...savedCarts, [activeCartId]: newItems }
        });

        // Cloud sync if authenticated
        if (activeCartId !== 'guest' && targetItem?.cart_item_id) {
            api.put(`/cart/items/${targetItem.cart_item_id}`, { quantity }).catch(console.error);
        }
      },

      clearCart: () => {
        const { savedCarts, activeCartId } = get();
        set({ 
            items: [],
            savedCarts: { ...savedCarts, [activeCartId]: [] }
        });

        // Cloud sync if authenticated
        if (activeCartId !== 'guest') {
            api.delete('/cart').catch(console.error);
        }
      },

      toggleCart: () => set({ isOpen: !get().isOpen }),
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),

      syncCartWithUser: async (userId: string | null) => {
        const { savedCarts, activeCartId, items } = get();
        const targetId = userId || 'guest';

        // If logging out (or App load but guest), we just switch back to guest mode locally
        if (targetId === 'guest') {
            if (activeCartId !== 'guest') {
               set({
                   activeCartId: 'guest',
                   items: savedCarts['guest'] || []
               });
            }
            return;
        }

        // --- At this point, we know we are switching to an Authenticated User! ---
        
        let updatedCarts = { ...savedCarts };
        let payloadItems: any[] = [];

        // If a guest logs in AND has temporary items, we will push them to the server
        if (activeCartId === 'guest' && items.length > 0) {
            // Prepare payload to send to /api/cart/sync
            payloadItems = items.map(i => ({
                product_id: i.id,
                quantity: i.quantity,
                attributes: i.attributes
            }));
            
            // Clear the local guest cart now that it is being migrated
            updatedCarts['guest'] = [];
        }

        // Optimistically set ID to prevent duplicate fires
        set({ activeCartId: targetId });

        try {
            let res;
            if (payloadItems.length > 0) {
                // Sync local guest items into the cloud database
                res = await api.post('/cart/sync', { items: payloadItems });
            } else {
                // Just fetch the latest cloud cart
                res = await api.get('/cart');
            }

            if (res.data?.cart) {
                updatedCarts[targetId] = res.data.cart;
                set({
                    items: res.data.cart,
                    savedCarts: updatedCarts
                });
            }
        } catch (error) {
            console.error("Failed to sync cloud cart", error);
        }
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

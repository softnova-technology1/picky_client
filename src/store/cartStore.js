import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],       // guest cart in localStorage
      total: 0,
      coupon: null,
      couponDiscount: 0,

      addItem: (product, quantity = 1) => {
        const items = get().items;
        const idx = items.findIndex((i) => i.productId === product._id);
        let newItems;
        if (idx > -1) {
          newItems = items.map((i, index) =>
            index === idx ? { ...i, quantity: i.quantity + quantity } : i
          );
        } else {
          newItems = [...items, {
            productId: product._id,
            name: product.name,
            image: product.images?.[0] || null,
            price: product.discountPrice || product.price,
            quantity,
          }];
        }
        set({ items: newItems, total: calcTotal(newItems) });
      },

      updateQty: (productId, quantity) => {
        const items = quantity === 0
          ? get().items.filter((i) => i.productId !== productId)
          : get().items.map((i) => i.productId === productId ? { ...i, quantity } : i);
        set({ items, total: calcTotal(items) });
      },

      removeItem: (productId) => {
        const items = get().items.filter((i) => i.productId !== productId);
        set({ items, total: calcTotal(items) });
      },

      clearCart: () => set({ items: [], total: 0, coupon: null, couponDiscount: 0 }),

      setServerCart: (serverCart) => {
        set({
          items: serverCart.items || [],
          coupon: serverCart.coupon,
          couponDiscount: serverCart.couponDiscount || 0,
          total: calcTotal(serverCart.items || []),
        });
      },
    }),
    {
      name: 'picky-cart',
      partialize: (state) => ({ items: state.items }),
    }
  )
);

const calcTotal = (items) =>
  items.reduce((sum, i) => sum + i.price * i.quantity, 0);

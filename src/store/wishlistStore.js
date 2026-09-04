import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useWishlistStore = create(
  persist(
    (set, get) => ({
      items: [], // Array of product objects or IDs

      isInWishlist: (productId) => {
        const { items } = get();
        return items.some(
          (i) => (i._id || i.id || i) === (productId._id || productId.id || productId)
        );
      },

      toggleItem: (product) => {
        const { items } = get();
        const pId = product._id || product.id || product;
        const exists = items.some((i) => (i._id || i.id || i) === pId);

        if (exists) {
          set({ items: items.filter((i) => (i._id || i.id || i) !== pId) });
        } else {
          set({ items: [...items, product] });
        }
      },

      removeItem: (productId) => {
        const { items } = get();
        const pId = productId._id || productId.id || productId;
        set({ items: items.filter((i) => (i._id || i.id || i) !== pId) });
      },

      setWishlist: (products) => {
        set({ items: products || [] });
      },

      clearWishlist: () => {
        set({ items: [] });
      },
    }),
    {
      name: 'picky-wishlist',
    }
  )
);

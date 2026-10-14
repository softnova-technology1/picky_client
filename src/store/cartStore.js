import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { cartService } from '../services/cart.service';
import { useAuthStore } from './authStore';

const getItemId = (item) => {
  if (!item) return '';
  if (typeof item === 'string') return item;
  return item._id || item.id || item.productId || item.product?._id || item.product?.id || item.product || '';
};

const qtyDebounceTimers = {};

export const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],       // guest / local cart items
      total: 0,
      coupon: null,
      couponDiscount: 0,

      setCoupon: (code, discount) => set({ coupon: code, couponDiscount: discount }),

      addItem: (product, quantity = 1) => {
        const items = get().items;
        const prodId = getItemId(product);
        if (!prodId) return;

        const availableSizes = Array.isArray(product.variants?.options) && product.variants.options.length > 0
          ? product.variants.options
          : Array.isArray(product.sizes) && product.sizes.length > 0
            ? product.sizes
            : [];

        const availableColors = Array.isArray(product.variants?.colors) && product.variants.colors.length > 0
          ? product.variants.colors
          : Array.isArray(product.colors) && product.colors.length > 0
            ? product.colors
            : [];

        const idx = items.findIndex((i) => getItemId(i) === prodId);
        let newItems;
        if (idx > -1) {
          const updatedItem = { ...items[idx], quantity: (items[idx].quantity || 1) + quantity };
          newItems = [
            updatedItem,
            ...items.filter((_, index) => index !== idx),
          ];
        } else {
          newItems = [
            {
              _id: prodId,
              id: prodId,
              productId: prodId,
              slug: product.slug,
              name: product.name,
              image: product.images?.[0] || product.image || null,
              images: product.images || (product.image ? [product.image] : []),
              price: product.discountPrice || product.price || 0,
              discountPrice: product.discountPrice || product.price || 0,
              originalPrice: product.originalPrice || product.price || 0,
              selectedSize: product.selectedSize || null,
              selectedColor: product.selectedColor || null,
              availableSizes,
              availableColors,
              hasVariants: availableSizes.length > 0 || availableColors.length > 0,
              quantity,
            },
            ...items,
          ];
        }
        set({ items: newItems, total: calcTotal(newItems), coupon: null, couponDiscount: 0 });

        // Real-time backend MongoDB sync with debounce
        try {
          const auth = useAuthStore.getState();
          if (auth?.isLoggedIn && auth?.accessToken) {
            const itemInList = newItems.find((i) => getItemId(i) === prodId);
            const totalQty = itemInList ? itemInList.quantity : quantity;
            if (qtyDebounceTimers[prodId]) {
              clearTimeout(qtyDebounceTimers[prodId]);
            }
            qtyDebounceTimers[prodId] = setTimeout(() => {
              cartService.updateQty(prodId, totalQty).catch(() => {
                cartService.addItem(prodId, quantity).catch(() => null);
              });
              delete qtyDebounceTimers[prodId];
            }, 300);
          }
        } catch (_) {}
      },

      updateVariant: (target, { selectedSize, selectedColor }) => {
        const targetId = String(getItemId(target));
        if (!targetId) return;

        const currentItems = get().items;
        const newItems = currentItems.map((i) => {
          if (String(getItemId(i)) === targetId) {
            return {
              ...i,
              ...(selectedSize !== undefined ? { selectedSize } : {}),
              ...(selectedColor !== undefined ? { selectedColor } : {}),
            };
          }
          return i;
        });
        set({ items: newItems });
      },

      updateQty: (target, quantity) => {
        const targetId = String(getItemId(target));
        if (!targetId) return;

        const currentItems = get().items;
        const newItems =
          quantity <= 0
            ? currentItems.filter((i) => String(getItemId(i)) !== targetId)
            : currentItems.map((i) =>
                String(getItemId(i)) === targetId ? { ...i, quantity } : i
              );
        set({ items: newItems, total: calcTotal(newItems), coupon: null, couponDiscount: 0 });

        // Clear previous pending debounce for this product
        if (qtyDebounceTimers[targetId]) {
          clearTimeout(qtyDebounceTimers[targetId]);
          delete qtyDebounceTimers[targetId];
        }

        // Real-time backend MongoDB sync with 300ms debounce
        try {
          const auth = useAuthStore.getState();
          if (auth?.isLoggedIn && auth?.accessToken) {
            if (quantity <= 0) {
              cartService.removeItem(targetId).catch(() => null);
            } else {
              qtyDebounceTimers[targetId] = setTimeout(() => {
                cartService.updateQty(targetId, quantity).catch((err) => {
                  const msg = err?.response?.data?.message || err?.response?.data?.error || '';
                  if (msg.toLowerCase().includes('stock')) {
                    cartService.getCart().then((res) => {
                      if (res.data?.data) get().setServerCart(res.data.data);
                    }).catch(() => null);
                  }
                });
                delete qtyDebounceTimers[targetId];
              }, 300);
            }
          }
        } catch (_) {}
      },

      removeItem: (target) => {
        const targetId = String(getItemId(target));
        if (!targetId) return;

        if (qtyDebounceTimers[targetId]) {
          clearTimeout(qtyDebounceTimers[targetId]);
          delete qtyDebounceTimers[targetId];
        }

        const newItems = get().items.filter((i) => String(getItemId(i)) !== targetId);
        set({ items: newItems, total: calcTotal(newItems), coupon: null, couponDiscount: 0 });

        // Real-time backend MongoDB sync
        try {
          const auth = useAuthStore.getState();
          if (auth?.isLoggedIn && auth?.accessToken) {
            cartService.removeItem(targetId).catch(() => null);
          }
        } catch (_) {}
      },

      clearCart: () => {
        set({ items: [], total: 0, coupon: null, couponDiscount: 0 });
        try {
          const auth = useAuthStore.getState();
          if (auth?.isLoggedIn && auth?.accessToken) {
            cartService.clear().catch(() => null);
          }
        } catch (_) {}
      },


      fetchCart: async () => {
        try {
          const auth = useAuthStore.getState();
          if (auth?.isLoggedIn && auth?.accessToken) {
            const res = await cartService.get();
            const serverCart = res?.data || res;
            if (serverCart && Array.isArray(serverCart.items)) {
              get().setServerCart(serverCart);
            }
          }
        } catch (_) {}
      },

      setServerCart: (serverCart) => {
        const rawItems = serverCart.items || [];
        const normalizedItems = rawItems.map((i) => {
          const id = getItemId(i);
          return {
            ...i,
            _id: id,
            id: id,
            productId: id,
            name: i.name || i.product?.name || 'Product',
            image: i.image || i.images?.[0] || i.product?.images?.[0] || i.product?.image || null,
            price: i.price || i.discountPrice || i.product?.discountPrice || i.product?.price || 0,
            quantity: i.quantity || 1,
          };
        });
        set({
          items: normalizedItems,
          coupon: serverCart.coupon || null,
          couponDiscount: serverCart.couponDiscount || 0,
          total: calcTotal(normalizedItems),
        });
      },
    }),
    {
      name: 'picky-cart',
      partialize: (state) => ({ items: state.items, coupon: state.coupon, couponDiscount: state.couponDiscount }),
    }
  )
);

const calcTotal = (items = []) =>
  items.reduce((sum, i) => sum + (i.discountPrice || i.price || 0) * (i.quantity || 1), 0);

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const getItemId = (item) => {
  if (!item) return '';
  if (typeof item === 'string') return item;
  return item._id || item.id || item.productId || item.product?._id || item.product?.id || item.product || '';
};

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
          newItems = items.map((i, index) =>
            index === idx ? { ...i, quantity: (i.quantity || 1) + quantity } : i
          );
        } else {
          newItems = [
            ...items,
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
          ];
        }
        set({ items: newItems, total: calcTotal(newItems), coupon: null, couponDiscount: 0 });
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
      },

      removeItem: (target) => {
        const targetId = String(getItemId(target));
        if (!targetId) return;

        const newItems = get().items.filter((i) => String(getItemId(i)) !== targetId);
        set({ items: newItems, total: calcTotal(newItems), coupon: null, couponDiscount: 0 });
      },

      clearCart: () => set({ items: [], total: 0, coupon: null, couponDiscount: 0 }),

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

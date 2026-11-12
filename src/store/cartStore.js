import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { cartService } from '../services/cart.service';
import { useAuthStore } from './authStore';

const getItemId = (item) => {
  if (!item) return '';
  if (typeof item === 'string') return item;
  return item.cartItemId || item._id || item.id || item.productId || item.product?._id || item.product?.id || item.product || '';
};

const getProductId = (item) => {
  if (!item) return '';
  if (typeof item === 'string') {
    return item.includes('_custom_') ? item.split('_custom_')[0] : item;
  }
  const raw = item.productId || item.product?._id || item.product?.id || item._id || item.id || (typeof item.product === 'string' ? item.product : '');
  const s = raw ? raw.toString() : '';
  return s.includes('_custom_') ? s.split('_custom_')[0] : s;
};

const qtyDebounceTimers = {};

export const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],       // guest / local cart items
      total: 0,
      coupon: null,
      couponDiscount: 0,
      buyNowItem: null, // express checkout item (never pollutes shopping cart)

      setCoupon: (code, discount) => set({ coupon: code, couponDiscount: discount }),
      setBuyNowItem: (item) => {
        if (!item) {
          set({ buyNowItem: null });
          return;
        }
        const prodId = getProductId(item);
        const isCustomized = Boolean(item.isCustomized);
        const customizationCost = isCustomized ? Number(item.customizationCost || item.customizationPrice || 0) : 0;
        const basePrice = Number(
          item.basePrice !== undefined 
            ? item.basePrice 
            : (item.discountPrice || item.price || 0)
        );
        const totalPrice = basePrice + customizationCost;
        const origBase = Number(item.originalPrice || item.price || basePrice);
        const totalOriginal = origBase + customizationCost;

        set({
          buyNowItem: {
            ...item,
            _id: prodId,
            id: prodId,
            productId: prodId,
            basePrice,
            customizationCost,
            isCustomized,
            customization: item.customization || null,
            price: totalPrice,
            discountPrice: totalPrice,
            originalPrice: totalOriginal,
          },
        });
      },
      clearBuyNowItem: () => set({ buyNowItem: null }),
      updateBuyNowQty: (quantity) => {
        const current = get().buyNowItem;
        if (!current) return;
        if (quantity <= 0) {
          set({ buyNowItem: null });
        } else {
          const maxStock = typeof current.stock === 'number' ? current.stock : 99;
          const cappedQty = Math.min(quantity, maxStock);
          set({ buyNowItem: { ...current, quantity: cappedQty } });
        }
      },

      addItem: (product, quantity = 1) => {
        const items = get().items;
        const prodId = getProductId(product);
        if (!prodId) return;

        const isCustomized = Boolean(product.isCustomized);
        const customizationCost = isCustomized ? Number(product.customizationCost || product.customizationPrice || 0) : 0;
        const basePrice = Number(
          product.basePrice !== undefined 
            ? product.basePrice 
            : (product.discountPrice || product.price || 0)
        );
        const totalPrice = basePrice + customizationCost;
        const origBase = Number(product.originalPrice || product.price || basePrice);
        const totalOriginal = origBase + customizationCost;

        // Distinct key for customized items so different customizations don't overwrite each other
        const itemKey = product.cartItemId || (isCustomized ? `${prodId}_custom_${Date.now()}` : prodId);

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

        const stockLimit = typeof product.stock === 'number' ? product.stock : 10;
        const idx = items.findIndex((i) => getItemId(i) === itemKey);
        let newItems;
        if (idx > -1) {
          const currentStock = typeof items[idx].stock === 'number' ? items[idx].stock : stockLimit;
          const nextQty = Math.min((items[idx].quantity || 1) + quantity, currentStock);
          const updatedItem = { ...items[idx], quantity: nextQty, stock: currentStock };
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
              cartItemId: itemKey,
              slug: product.slug,
              name: product.name,
              image: product.images?.[0] || product.image || null,
              images: product.images || (product.image ? [product.image] : []),
              // Crucially: base product price and customization cost are calculated and tracked separately:
              basePrice,
              customizationCost,
              isCustomized,
              customization: product.customization || null,
              // Total price (base price + customization cost) reflected in cart:
              price: totalPrice,
              discountPrice: totalPrice,
              originalPrice: totalOriginal,
              selectedSize: product.selectedSize || product.customization?.size || null,
              selectedColor: product.selectedColor || (typeof product.customization?.color === 'object' ? product.customization?.color?.name : product.customization?.color) || null,
              selectedVariant: product.selectedVariant || null,
              availableSizes,
              availableColors,
              hasVariants: availableSizes.length > 0 || availableColors.length > 0,
              quantity: Math.min(quantity, stockLimit),
              stock: stockLimit,
              category: product.category || null,
              sku: product.sku || '',
            },
            ...items,
          ];
        }
        set({ items: newItems, total: calcTotal(newItems), coupon: null, couponDiscount: 0 });

        // Real-time backend MongoDB sync
        try {
          const auth = useAuthStore.getState();
          if (auth?.isLoggedIn && auth?.accessToken) {
            if (isCustomized) {
              // Crucial: For customized items, ALWAYS call cartService.addItem directly with customization specs!
              cartService.addItem(prodId, quantity, {
                basePrice,
                customizationCost,
                isCustomized: true,
                customization: product.customization || null,
              }).catch(() => null);
            } else {
              const itemInList = newItems.find((i) => getItemId(i) === itemKey);
              const totalQty = itemInList ? itemInList.quantity : quantity;
              if (qtyDebounceTimers[itemKey]) {
                clearTimeout(qtyDebounceTimers[itemKey]);
              }
              qtyDebounceTimers[itemKey] = setTimeout(() => {
                cartService.updateQty(prodId, totalQty).catch(() => {
                  cartService.addItem(prodId, quantity).catch(() => null);
                });
                delete qtyDebounceTimers[itemKey];
              }, 300);
            }
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
        const cleanProdId = getProductId(target);
        if (!targetId) return;

        const currentBuyNow = get().buyNowItem;
        if (currentBuyNow && String(getItemId(currentBuyNow)) === targetId) {
          if (quantity <= 0) {
            set({ buyNowItem: null });
          } else {
            const maxStock = typeof currentBuyNow.stock === 'number' ? currentBuyNow.stock : 99;
            const cappedQty = Math.min(quantity, maxStock);
            set({ buyNowItem: { ...currentBuyNow, quantity: cappedQty } });
          }
        }

        const currentItems = get().items;
        const newItems =
          quantity <= 0
            ? currentItems.filter((i) => String(getItemId(i)) !== targetId)
            : currentItems.map((i) => {
                if (String(getItemId(i)) === targetId) {
                  const maxStock = typeof i.stock === 'number' ? i.stock : 99;
                  const cappedQty = Math.min(quantity, maxStock);
                  return { ...i, quantity: cappedQty };
                }
                return i;
              });
        set({ items: newItems, total: calcTotal(newItems), coupon: null, couponDiscount: 0 });

        // Clear previous pending debounce for this product
        if (qtyDebounceTimers[targetId]) {
          clearTimeout(qtyDebounceTimers[targetId]);
          delete qtyDebounceTimers[targetId];
        }

        // Real-time backend MongoDB sync with 300ms debounce
        try {
          const auth = useAuthStore.getState();
          if (auth?.isLoggedIn && auth?.accessToken && cleanProdId) {
            if (quantity <= 0) {
              cartService.removeItem(cleanProdId).catch(() => null);
            } else {
              qtyDebounceTimers[targetId] = setTimeout(() => {
                cartService.updateQty(cleanProdId, quantity).catch((err) => {
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
        const cleanProdId = getProductId(target);
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
          if (auth?.isLoggedIn && auth?.accessToken && cleanProdId) {
            cartService.removeItem(cleanProdId).catch(() => null);
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
          const prodId = getProductId(i);
          const isCust = Boolean(i.isCustomized);
          const cartKey = i.cartItemId || (isCust ? `${prodId}_custom_${i.customization?.orderId || i.customization?.orderRef || Date.now()}` : prodId);
          const basePrice = i.basePrice !== undefined ? Number(i.basePrice) : (i.discountPrice || i.price || i.product?.discountPrice || i.product?.price || 0);
          const customizationCost = Number(i.customizationCost || (isCust ? (i.product?.customizationPrice || 0) : 0));
          const totalPrice = i.price || (basePrice + customizationCost);
          return {
            ...i,
            _id: prodId,
            id: prodId,
            productId: prodId,
            cartItemId: cartKey,
            name: i.name || i.product?.name || 'Product',
            image: i.image || i.images?.[0] || i.product?.images?.[0] || i.product?.image || null,
            basePrice,
            customizationCost,
            isCustomized: isCust,
            customization: i.customization || null,
            price: totalPrice,
            discountPrice: totalPrice,
            quantity: i.quantity || 1,
            selectedSize: i.selectedSize || i.customization?.size || null,
            selectedColor: i.selectedColor || (typeof i.customization?.color === 'object' ? i.customization?.color?.name : i.customization?.color) || null,
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
      partialize: (state) => ({ items: state.items, coupon: state.coupon, couponDiscount: state.couponDiscount, buyNowItem: state.buyNowItem }),
    }
  )
);

const calcTotal = (items = []) =>
  items.reduce((sum, i) => sum + (i.discountPrice || i.price || 0) * (i.quantity || 1), 0);

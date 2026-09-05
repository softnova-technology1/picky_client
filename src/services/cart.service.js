import api from './api';
import { validateCoupon } from '../data';

export const cartService = {
  get: () => api.get('/cart'),
  addItem: (productId, quantity) => api.post('/cart/items', { productId, quantity }),
  updateQty: (productId, quantity) => api.patch('/cart/items', { productId, quantity }),
  removeItem: (productId) => api.delete(`/cart/items/${productId}`),
  clear: () => api.delete('/cart'),
  merge: (items) => api.post('/cart/merge', { items }),

  applyCoupon: async (code, subtotal = 1000) => {
    try {
      const res = await api.post('/cart/coupon', { code });
      if (res?.data) return res;
    } catch (err) {
      console.warn('Backend coupon verify unavailable, checking local Data:', err?.message || err);
    }
    const result = validateCoupon(code, subtotal);
    if (!result.valid) {
      throw new Error(result.message);
    }
    return { data: result };
  },

  removeCoupon: () => api.delete('/cart/coupon'),
};


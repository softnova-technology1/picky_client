import api from './api';

export const cartService = {
  get: () => api.get('/cart'),
  getCart: () => api.get('/cart'),
  addItem: (productId, quantity, extra = {}) => api.post('/cart/items', { productId, quantity, ...extra }),
  updateQty: (productId, quantity) => api.patch('/cart/items', { productId, quantity }),
  removeItem: (productId) => api.delete(`/cart/items/${productId}`),
  clear: () => api.delete('/cart'),
  merge: (items) => api.post('/cart/merge', { items }),

  applyCoupon: (code) => api.post('/cart/coupon', { code }),
  removeCoupon: () => api.delete('/cart/coupon'),
};

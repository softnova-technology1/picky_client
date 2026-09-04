import api from './api';

export const wishlistService = {
  get: () => api.get('/wishlist'),
  toggle: (productId) => api.post('/wishlist/toggle', { productId }),
  merge: (productIds) => api.post('/wishlist/merge', { productIds }),
  remove: (productId) => api.delete(`/wishlist/items/${productId}`),
};

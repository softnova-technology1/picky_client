import api from './api';

export const productService = {
  list: (params) => api.get('/products', { params }),
  search: (q, params) => api.get('/products/search', { params: { search: q, ...params } }),
  getBySlug: (slug) => api.get(`/products/${slug}`),
  // Admin
  create: (formData) => api.post('/products', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  update: (id, formData) => api.put(`/products/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  remove: (id) => api.delete(`/products/${id}`),
};

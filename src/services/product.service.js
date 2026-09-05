import api from './api';
import { getProducts, getProductBySlug, searchProducts } from '../data';

export const productService = {
  list: async (params) => {
    try {
      const res = await api.get('/products', { params });
      const items = res?.data?.data || res?.data;
      if (Array.isArray(items) && items.length > 0) {
        return res;
      }
    } catch (err) {
      console.warn('Backend product list unavailable, using local Data:', err?.message || err);
    }
    const localData = getProducts(params);
    return { data: { data: localData, total: localData.length } };
  },

  search: async (q, params) => {
    try {
      const res = await api.get('/products/search', { params: { search: q, ...params } });
      const items = res?.data?.data || res?.data;
      if (Array.isArray(items) && items.length > 0) {
        return res;
      }
    } catch (err) {
      console.warn('Backend search unavailable, using local Data:', err?.message || err);
    }
    const localData = searchProducts(q, params);
    return { data: { data: localData, total: localData.length } };
  },

  getBySlug: async (slug) => {
    try {
      const res = await api.get(`/products/${slug}`);
      if (res?.data) {
        return res;
      }
    } catch (err) {
      console.warn('Backend product detail unavailable, using local Data:', err?.message || err);
    }
    const product = getProductBySlug(slug);
    return { data: product };
  },

  // Admin
  create: (formData) => api.post('/products', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  update: (id, formData) => api.put(`/products/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  remove: (id) => api.delete(`/products/${id}`),
};


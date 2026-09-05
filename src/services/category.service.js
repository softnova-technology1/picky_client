import api from './api';
import { getCategories, getCategoryBySlug } from '../data';

export const categoryService = {
  list: async () => {
    try {
      const res = await api.get('/categories');
      const items = res?.data?.data || res?.data;
      if (Array.isArray(items) && items.length > 0) {
        return res;
      }
    } catch (err) {
      console.warn('Backend category list unavailable, using local Data:', err?.message || err);
    }
    return { data: getCategories() };
  },

  getBySlug: async (slug) => {
    try {
      const res = await api.get(`/categories/${slug}`);
      if (res?.data) {
        return res;
      }
    } catch (err) {
      console.warn('Backend category getBySlug unavailable, using local Data:', err?.message || err);
    }
    return { data: getCategoryBySlug(slug) };
  },

  // Admin
  create: (formData) => api.post('/categories', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  update: (id, formData) => api.put(`/categories/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  remove: (id) => api.delete(`/categories/${id}`),
};


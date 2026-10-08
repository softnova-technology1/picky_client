import api from './api';

export const categoryService = {
  list: () => api.get('/categories'),
  getBySlug: (slug) => api.get(`/categories/${slug}`),

  // Admin
  create: (formData) => api.post('/categories', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  update: (id, formData) => api.put(`/categories/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  remove: (id) => api.delete(`/categories/${id}`),
  getSubCategories: (params) => api.get('/subcategories', { params }),
};


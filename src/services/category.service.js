import api from './api';

export const categoryService = {
  list: (params) => api.get('/categories', { params }),
  getBySlug: (slug) => api.get(`/categories/${slug}`),

  // Admin
  create: (formData) => api.post('/categories', formData),
  update: (id, formData) => api.put(`/categories/${id}`, formData),
  remove: (id) => api.delete(`/categories/${id}`),
  uploadCategoryImage: (formData) => api.post('/categories/upload-image', formData),
  getSubCategories: (params) => api.get('/subcategories', { params }),
};


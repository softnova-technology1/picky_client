import api from './api';

export const adminService = {
  // Reports
  getSalesSummary: () => api.get('/reports/sales'),
  getTopProducts: (limit = 5) => api.get('/reports/top-products', { params: { limit } }),
  getOrdersReport: (params) => api.get('/reports/orders', { params }),

  // Orders & Tracking
  getOrders: (params) => api.get('/orders/admin/list', { params }),
  getOrderDetail: (id) => api.get(`/orders/admin/${id}`),
  addTracking: (id, data) => api.patch(`/orders/admin/${id}/tracking`, data),
  updateOrderStatus: (id, data) => api.patch(`/orders/admin/${id}/status`, data),

  // Products
  createProduct: (formData) => api.post('/products', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  updateProduct: (id, formData) => api.put(`/products/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  deleteProduct: (id) => api.delete(`/products/${id}`),

  // Categories
  createCategory: (formData) => api.post('/categories', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  updateCategory: (id, formData) => api.put(`/categories/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  updateCategoryCharacteristics: (id, characteristics) => api.patch(`/categories/${id}/characteristics`, { characteristics }),
  deleteCategory: (id) => api.delete(`/categories/${id}`),

  // Coupons
  getCoupons: () => api.get('/coupons'),
  createCoupon: (data) => api.post('/coupons', data),
  updateCoupon: (id, data) => api.put(`/coupons/${id}`, data),
  toggleCoupon: (id) => api.patch(`/coupons/${id}/toggle`),
  deleteCoupon: (id) => api.delete(`/coupons/${id}`),

  // Discounts
  getDiscounts: () => api.get('/discounts'),
  createDiscount: (data) => api.post('/discounts', data),
  updateDiscount: (id, data) => api.put(`/discounts/${id}`, data),
  toggleDiscount: (id) => api.patch(`/discounts/${id}/toggle`),
  deleteDiscount: (id) => api.delete(`/discounts/${id}`),

  // Customers
  getCustomers: (params) => api.get('/customers', { params }),
  getCustomerDetail: (id) => api.get(`/customers/${id}`),

  // Settings
  getSettings: () => api.get('/settings'),
  updateSettings: (data) => api.patch('/settings', data),

  // Inventory
  getInventory: (params) => api.get('/inventory', { params }),
  updateInventoryStock: (productId, data) => api.patch(`/inventory/${productId}`, data),
};


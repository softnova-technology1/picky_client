import api from './api';
import { broadcastCatalogUpdate } from '../utils/realtimeSync';

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
  deleteOrder: (id) => api.delete(`/orders/admin/${id}`),

  // Products (Instant Live Sync to Storefront)
  createProduct: (formData) => api.post('/products', formData).then((res) => { broadcastCatalogUpdate('PRODUCT_CREATED'); return res; }),
  updateProduct: (id, formData) => api.put(`/products/${id}`, formData).then((res) => { broadcastCatalogUpdate('PRODUCT_UPDATED'); return res; }),
  toggleProduct: (id) => api.patch(`/products/${id}/toggle`).then((res) => { broadcastCatalogUpdate('PRODUCT_TOGGLED'); return res; }),
  deleteProduct: (id) => api.delete(`/products/${id}`).then((res) => { broadcastCatalogUpdate('PRODUCT_DELETED'); return res; }),

  // Categories (Instant Live Sync to Storefront)
  createCategory: (formData) => api.post('/categories', formData).then((res) => { broadcastCatalogUpdate('CATEGORY_CREATED'); return res; }),
  updateCategory: (id, formData) => api.put(`/categories/${id}`, formData).then((res) => { broadcastCatalogUpdate('CATEGORY_UPDATED'); return res; }),
  uploadCategoryImage: (formData) => api.post('/categories/upload-image', formData),
  updateCategoryCharacteristics: (id, characteristics) => api.patch(`/categories/${id}/characteristics`, { characteristics }),
  deleteCategory: (id) => api.delete(`/categories/${id}`).then((res) => { broadcastCatalogUpdate('CATEGORY_DELETED'); return res; }),

  // SubCategories (Instant Live Sync to Storefront)
  getSubCategories: (params) => api.get('/subcategories', { params }),
  createSubCategory: (data) => api.post('/subcategories', data).then((res) => { broadcastCatalogUpdate('SUBCATEGORY_CREATED'); return res; }),
  updateSubCategory: (id, data) => api.put(`/subcategories/${id}`, data).then((res) => { broadcastCatalogUpdate('SUBCATEGORY_UPDATED'); return res; }),
  deleteSubCategory: (id) => api.delete(`/subcategories/${id}`).then((res) => { broadcastCatalogUpdate('SUBCATEGORY_DELETED'); return res; }),
  bulkDeleteSubCategories: (ids) => api.post('/subcategories/bulk-delete', { ids }).then((res) => { broadcastCatalogUpdate('SUBCATEGORIES_BULK_DELETED'); return res; }),
  uploadSubCategoryImage: (formData) => api.post('/subcategories/upload-image', formData),

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
  deleteCustomer: (id) => api.delete(`/customers/${id}`),
  bulkDeleteCustomers: (ids) => api.post('/customers/bulk-delete', { ids }),

  // Settings
  getSettings: () => api.get('/settings'),
  updateSettings: (data) => api.patch('/settings', data),

  // Inventory
  getInventory: (params) => api.get('/inventory', { params }),
  updateInventoryStock: (productId, data) => api.patch(`/inventory/${productId}`, data).then((res) => { broadcastCatalogUpdate('INVENTORY_UPDATED'); return res; }),
  deleteInventory: (productId) => api.delete(`/inventory/${productId}`).then((res) => { broadcastCatalogUpdate('INVENTORY_DELETED'); return res; }),
  toggleProductStatus: (id) =>
    api.patch(`/products/${id}/toggle`).catch(() => api.patch(`/inventory/${id}/toggle-status`)).then((res) => { broadcastCatalogUpdate('INVENTORY_TOGGLED'); return res; }),

  // Customization
  getCustomizations: () => api.get('/customization'),
  updateCustomization: (pageId, sections) => api.put('/customization', { pageId, sections }),
  clearCustomizationImage: (payload) => api.post('/customization/clear-image', payload),

  // Upload & S3 Storage
  uploadImage: (formData) => api.post('/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  deleteImage: (urlOrKey) => api.delete('/upload', { data: { url: urlOrKey } }).catch(() => api.post('/upload/delete', { url: urlOrKey })),

  // Blog Page (MongoDB & S3)
  getBlogData: () => api.get('/blog'),
  updateBlogData: (data) => api.put('/blog', data),
  uploadBlogImage: (formData) => api.post('/blog/upload-image', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
};

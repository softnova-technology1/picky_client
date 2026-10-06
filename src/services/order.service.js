import api from './api';

export const orderService = {
  createRazorpayOrder: (body) => api.post('/orders/razorpay/create-order', body),
  verifyRazorpayPayment: (body) => api.post('/orders/razorpay/verify', body),

  list: (params) => api.get('/orders', { params }),
  getById: (id) => api.get(`/orders/${id}`),
  getTracking: (id) => api.get(`/orders/${id}/tracking`),

  // Admin
  adminList: (params) => api.get('/orders/admin/list', { params }),
  adminGetById: (id) => api.get(`/orders/admin/${id}`),
  addTracking: (id, body) => api.patch(`/orders/admin/${id}/tracking`, body),
  updateStatus: (id, body) => api.patch(`/orders/admin/${id}/status`, body),
};


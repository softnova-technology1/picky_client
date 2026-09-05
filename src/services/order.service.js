import api from './api';
import { getOrders, getOrderById } from '../data';

export const orderService = {
  createRazorpayOrder: (body) => api.post('/orders/razorpay/create-order', body),
  verifyRazorpayPayment: (body) => api.post('/orders/razorpay/verify', body),

  list: async (params) => {
    try {
      const res = await api.get('/orders', { params });
      const items = res?.data?.data || res?.data;
      if (Array.isArray(items) && items.length > 0) {
        return res;
      }
    } catch (err) {
      console.warn('Backend orders unavailable, using local Data:', err?.message || err);
    }
    const orders = getOrders();
    return { data: { data: orders, total: orders.length } };
  },

  getById: async (id) => {
    try {
      const res = await api.get(`/orders/${id}`);
      if (res?.data) return res;
    } catch (err) {
      console.warn('Backend order detail unavailable, using local Data:', err?.message || err);
    }
    return { data: getOrderById(id) };
  },

  getTracking: async (id) => {
    try {
      const res = await api.get(`/orders/${id}/tracking`);
      if (res?.data) return res;
    } catch (err) {
      console.warn('Backend tracking unavailable, using local Data:', err?.message || err);
    }
    return { data: getOrderById(id) };
  },

  // Admin
  adminList: (params) => api.get('/orders/admin/list', { params }),
  adminGetById: (id) => api.get(`/orders/admin/${id}`),
  addTracking: (id, body) => api.patch(`/orders/admin/${id}/tracking`, body),
  updateStatus: (id, body) => api.patch(`/orders/admin/${id}/status`, body),
};


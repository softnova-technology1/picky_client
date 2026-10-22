import api from './api';

export const returnService = {
  // Admin: Get all returns with live filters and KPI statistics
  getAll: (params = {}) => api.get('/returns', { params }),

  // Get single return details
  getById: (id) => api.get(`/returns/${id}`),

  // Customer: Create self-service return request
  create: (data) => api.post('/returns', data),

  // Admin: Approve & schedule reverse courier pickup
  approve: (id, data) => api.patch(`/returns/${id}/approve`, data),

  // Admin: Mark in-transit
  markInTransit: (id) => api.patch(`/returns/${id}/in-transit`),

  // Admin: Warehouse inspection / QC passed
  markInspected: (id, data) => api.patch(`/returns/${id}/inspect`, data),

  // Admin: Process Instant Razorpay Refund
  processRefund: (id, data) => api.patch(`/returns/${id}/refund`, data),

  // Admin: Reject return request
  reject: (id, data) => api.patch(`/returns/${id}/reject`, data),

  // Customer: Get my returns
  getMyReturns: () => api.get('/returns/my-returns'),
};

export default returnService;

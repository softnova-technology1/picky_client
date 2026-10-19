import api from './api';

export const reviewService = {
  // 1. Upload review photo to S3 with backend Sharp compression (max 5MB)
  uploadPhoto: async (file) => {
    const formData = new FormData();
    formData.append('photo', file);
    const res = await api.post('/reviews/upload-photo', formData);
    return res?.data?.url || res?.url;
  },

  // 2. Submit new customer review
  create: async (payload) => {
    const res = await api.post('/reviews', payload);
    return res?.data || res;
  },

  // 3. Get published reviews for a product (PDP)
  getByProduct: async (productId) => {
    const res = await api.get(`/reviews/product/${productId}`);
    return res?.data || res;
  },

  // 4. Admin: Get all reviews with status & KPI stats
  getAdminReviews: async (params = {}) => {
    const res = await api.get('/reviews/admin', { params });
    return res?.data || res;
  },

  // 5. Admin: Update review moderation status (approve / reject / flag)
  updateStatus: async (reviewId, status, rejectionReason = null) => {
    const res = await api.patch(`/reviews/admin/${reviewId}/status`, { status, rejectionReason });
    return res?.data || res;
  },

  // 6. Admin: Add official store reply
  reply: async (reviewId, text, author) => {
    const res = await api.post(`/reviews/admin/${reviewId}/reply`, { text, author });
    return res?.data || res;
  },

  // 7. Admin: Delete official store reply
  deleteReply: async (reviewId) => {
    const res = await api.delete(`/reviews/admin/${reviewId}/reply`);
    return res?.data || res;
  },

  // 8. Admin: Delete review permanently
  delete: async (reviewId) => {
    const res = await api.delete(`/reviews/admin/${reviewId}`);
    return res?.data || res;
  },

  // 9. Admin: Toggle featured review
  toggleFeatured: async (reviewId) => {
    const res = await api.patch(`/reviews/admin/${reviewId}/featured`);
    return res?.data || res;
  },

  // 10. Admin: Bulk update status
  bulkUpdateStatus: async (reviewIds, status, rejectionReason = null) => {
    const res = await api.post('/reviews/admin/bulk-status', { reviewIds, status, rejectionReason });
    return res?.data || res;
  },

  // 11. Admin: Bulk delete reviews
  bulkDelete: async (reviewIds) => {
    const res = await api.post('/reviews/admin/bulk-delete', { reviewIds });
    return res?.data || res;
  },

  // 12. Admin: Mark all reviews as viewed
  markAllViewed: async () => {
    const res = await api.post('/reviews/admin/mark-viewed');
    return res?.data || res;
  },
};


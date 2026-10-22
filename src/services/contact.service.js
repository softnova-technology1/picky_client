import api from './api';

export const contactService = {
  /**
   * Directly upload reference file to AWS S3 bucket (picky/inquiries)
   */
  uploadFile: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/contact/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  /**
   * Submit Contact / Inquiry Form (FormData or JSON payload with S3 file info)
   */
  submit: (payload) => api.post('/contact', payload),

  /**
   * Admin: List all inquiries with source, status, search, and pagination
   */
  list: (params) => api.get('/contact', { params }),

  /**
   * Admin: Get single inquiry
   */
  getById: (id) => api.get(`/contact/${id}`),

  /**
   * Admin: Mark inquiry as read/unread
   */
  markAsRead: (id, isRead = true) => api.patch(`/contact/${id}/read`, { isRead }),

  /**
   * Admin: Bulk mark inquiries as read/unread
   */
  bulkReadInquiries: (ids, isRead = true) => api.patch('/contact/bulk-read', { ids, isRead }),

  /**
   * Admin: Bulk delete inquiries
   */
  bulkDeleteInquiries: (ids) => api.post('/contact/bulk-delete', { ids }),

  /**
   * Admin: Mark all inquiries as read
   */
  markAllInquiriesRead: () => api.patch('/contact/mark-all-read'),

  /**
   * Admin: Delete inquiry
   */
  delete: (id) => api.delete(`/contact/${id}`),

  /**
   * Admin: Fetch real-time notifications
   */
  getNotifications: (params) => api.get('/notifications', { params }),

  /**
   * Admin: Mark all notifications as read
   */
  markAllNotificationsRead: () => api.patch('/notifications/mark-all-read'),

  /**
   * Admin: Mark notification as read
   */
  markNotificationRead: (id) => api.patch(`/notifications/${id}/read`),

  /**
   * Admin: Delete notification
   */
  toggleStarNotification: (id) => api.patch(`/notifications/${id}/star`),
  bulkReadNotifications: (ids) => api.patch('/notifications/bulk-read', { ids }),
  bulkDeleteNotifications: (ids) => api.post('/notifications/bulk-delete', { ids }),
  deleteNotification: (id) => api.delete(`/notifications/${id}`),
};

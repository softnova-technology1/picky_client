import api from './api';

export const contactService = {
  /**
   * Submit Contact Form (FormData with optional file)
   */
  submit: (formData) => api.post('/contact', formData),

  /**
   * Admin: List all contact inquiries
   */
  list: (params) => api.get('/contact', { params }),

  /**
   * Admin: Get single inquiry
   */
  getById: (id) => api.get(`/contact/${id}`),

  /**
   * Admin: Mark inquiry as read
   */
  markAsRead: (id) => api.patch(`/contact/${id}/read`),

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
  deleteNotification: (id) => api.delete(`/notifications/${id}`),
};

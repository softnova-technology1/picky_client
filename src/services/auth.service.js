import api from './api';

export const authService = {
  sendOTP: (phone) => api.post('/auth/send-otp', { phone }),
  verifyOTP: (phone, otp) => api.post('/auth/verify-otp', { phone, otp }),
  adminLogin: async (email, password) => {
    const cleanEmail = (email || '').trim().toLowerCase();
    const cleanPassword = (password || '').trim();
    return await api.post('/auth/admin/login', { email: cleanEmail, password: cleanPassword });
  },
  refresh: (refreshToken) => api.post('/auth/refresh', { refreshToken }),
  logout: () => api.post('/auth/logout'),  // server reads userId from JWT Bearer token
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.patch('/auth/profile', data),
  getAddresses: () => api.get('/auth/addresses'),
  addAddress: (data) => api.post('/auth/addresses', data),
  setDefaultAddress: (id) => api.patch(`/auth/addresses/${id}/default`),
  deleteAddress: (id) => api.delete(`/auth/addresses/${id}`),
};

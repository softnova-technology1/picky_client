import api from './api';

export const authService = {
  sendOTP: (phone) => api.post('/auth/send-otp', { phone }),
  verifyOTP: (phone, otp) => api.post('/auth/verify-otp', { phone, otp }),
  adminLogin: async (email, password) => {
    try {
      return await api.post('/auth/admin/login', { email, password });
    } catch (err) {
      console.warn('Backend admin login unavailable, using mock data:', err?.message || err);
      if (email === 'admin@picky.com' && password === 'Admin@Picky2026!') {
        return {
          data: {
            user: { _id: 'admin_mock', name: 'Admin Picky', email, role: 'admin' },
            accessToken: 'mock_access_token_admin',
            refreshToken: 'mock_refresh_token_admin'
          }
        };
      }
      throw new Error('Invalid admin credentials');
    }
  },
  refresh: (refreshToken) => api.post('/auth/refresh', { refreshToken }),
  logout: (refreshToken) => api.post('/auth/logout', { refreshToken }),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.patch('/auth/profile', data),
};

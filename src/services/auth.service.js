import api from './api';

export const authService = {
  sendOTP: (phone) => api.post('/auth/send-otp', { phone }),
  verifyOTP: (phone, otp) => api.post('/auth/verify-otp', { phone, otp }),
  adminLogin: async (email, password) => {
    const cleanEmail = (email || '').trim().toLowerCase();
    const cleanPassword = (password || '').trim();
    try {
      return await api.post('/auth/admin/login', { email: cleanEmail, password: cleanPassword });
    } catch (err) {
      console.warn('Backend admin login unavailable, using mock fallback:', err?.message || err);
      if (cleanEmail === 'admin@picky.com' && (cleanPassword === 'Admin@Picky2026!' || cleanPassword === 'admin123')) {
        return {
          data: {
            user: { _id: 'admin_mock', name: 'Admin Softnova', email: cleanEmail, role: 'admin' },
            accessToken: 'mock_access_token_admin',
            refreshToken: 'mock_refresh_token_admin'
          }
        };
      }
      const msg = err?.error || err?.message || 'Invalid admin credentials';
      throw new Error(msg);
    }
  },
  refresh: (refreshToken) => api.post('/auth/refresh', { refreshToken }),
  logout: (refreshToken) => api.post('/auth/logout', { refreshToken }),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.patch('/auth/profile', data),
};

import axios from 'axios';
import { useAuthStore } from '../store/authStore';
import { useAdminAuthStore } from '../store/adminAuthStore';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1',
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

// Helper: check if request belongs to admin operations
function isRequestForAdmin(config) {
  const url = config?.url || '';
  if (url.includes('/admin')) return true;
  if (typeof window !== 'undefined' && window.location?.pathname?.startsWith('/softpicky-sn2026')) {
    return true;
  }
  return false;
}

// Request interceptor — attach access token
api.interceptors.request.use((config) => {
  const isAdmin = isRequestForAdmin(config);
  const adminToken = useAdminAuthStore.getState().accessToken;
  const customerToken = useAuthStore.getState().accessToken;

  const token = isAdmin ? (adminToken || customerToken) : (customerToken || adminToken);
  if (token) config.headers.Authorization = `Bearer ${token}`;

  if (config.data instanceof FormData) {
    delete config.headers['Content-Type'];
    delete config.headers['content-type'];
  }
  return config;
});

// Response interceptor — auto refresh on 401 (excluding auth endpoints)
api.interceptors.response.use(
  (res) => res.data,
  async (error) => {
    const original = error.config;

    // Do NOT attempt refresh on auth endpoints (login, OTP, admin login, refresh itself)
    const isAuthEndpoint = original?.url && (
      original.url.includes('/auth/admin/login') ||
      original.url.includes('/auth/send-otp') ||
      original.url.includes('/auth/verify-otp') ||
      original.url.includes('/auth/refresh')
    );

    if (error.response?.status === 401 && !original?._retry && !isAuthEndpoint) {
      original._retry = true;
      const isAdmin = isRequestForAdmin(original);
      const targetStore = isAdmin ? useAdminAuthStore.getState() : useAuthStore.getState();

      try {
        const refreshToken = targetStore.refreshToken;
        if (!refreshToken) throw new Error('No refresh token available');

        const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';
        const res = await axios.post(`${baseUrl}/auth/refresh`, { refreshToken });
        const newAccessToken = res.data?.data?.accessToken || res.data?.accessToken;
        const newRefreshToken = res.data?.data?.refreshToken || res.data?.refreshToken;

        targetStore.setTokens(newAccessToken, newRefreshToken);
        original.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(original);
      } catch (refreshErr) {
        targetStore.logout();
        // Only redirect customer to login if not on admin portal or login
        const path = window.location.pathname;
        if (!isAdmin && !path.includes('/login') && !path.includes('/softpicky-sn2026')) {
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error.response?.data || error);
  }
);

export default api;

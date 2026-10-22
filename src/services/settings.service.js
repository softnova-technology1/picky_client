import api from './api';
import { applyTheme } from '../utils/theme';

export const settingsService = {
  getSettings: async () => {
    const res = await api.get('/settings');
    try {
      const data = res?.data || res;
      if (data?.shipping) {
        localStorage.setItem('picky_shipping_settings', JSON.stringify(data.shipping));
      }
      if (data) {
        localStorage.setItem('picky_store_settings', JSON.stringify(data));
      }
      if (data?.theme) {
        applyTheme(data.theme);
      }
    } catch (_) {}
    return res;
  },

  getCachedShippingSettings: () => {
    try {
      const saved = localStorage.getItem('picky_shipping_settings');
      if (saved) return JSON.parse(saved);
      const storeSaved = localStorage.getItem('picky_admin_settings');
      if (storeSaved) {
        const parsed = JSON.parse(storeSaved);
        if (parsed?.shipping) return parsed.shipping;
      }
    } catch (_) {}
    return null;
  },

  getCachedStoreSettings: () => {
    try {
      const saved = localStorage.getItem('picky_store_settings');
      if (saved) return JSON.parse(saved);
      const adminSaved = localStorage.getItem('picky_admin_settings');
      if (adminSaved) return JSON.parse(adminSaved);
    } catch (_) {}
    return null;
  },

  updateSettings: (data) => api.patch('/settings', data),
};

export default settingsService;


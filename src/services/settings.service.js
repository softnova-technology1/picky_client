import api from './api';

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

  updateSettings: (data) => api.patch('/settings', data),
};

export default settingsService;


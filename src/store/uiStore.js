import { create } from 'zustand';

const SIDEBAR_STORAGE_KEY = 'picky_admin_sidebar_collapsed';
const SIDEBAR_PAGES_STORAGE_KEY = 'picky_admin_sidebar_pages';

export const DEFAULT_SIDEBAR_PAGES = {
  dashboard: true,
  orders: true,
  returns: true,
  abandonedCarts: true,
  products: true,
  categories: true,
  subcategories: true,
  inventory: true,
  reviews: true,
  customers: true,
  coupons: true,
  discounts: true,
  broadcast: true,
  flashSales: true,
  inquiries: true,
  customization: true,
  notifications: true,
  settings: true,
};

const getInitialSidebarCollapsed = () => {
  try {
    return localStorage.getItem(SIDEBAR_STORAGE_KEY) === 'true';
  } catch (_) {
    return false;
  }
};

const getInitialSidebarPages = () => {
  try {
    const saved = localStorage.getItem(SIDEBAR_PAGES_STORAGE_KEY);
    if (saved) {
      return { ...DEFAULT_SIDEBAR_PAGES, ...JSON.parse(saved), settings: true };
    }
  } catch (_) {}
  return { ...DEFAULT_SIDEBAR_PAGES };
};

export const useUiStore = create((set) => ({
  isLoading: false,
  toast: null,      // { message, type: 'success' | 'error' | 'info' }
  modal: null,      // { id, props }
  adminSidebarCollapsed: getInitialSidebarCollapsed(),
  adminSidebarPages: getInitialSidebarPages(),

  setLoading: (v) => set({ isLoading: v }),
  showToast: (message, type = 'success') => {
    set({ toast: { message, type } });
    setTimeout(() => set({ toast: null }), 3500);
  },
  openModal: (id, props = {}) => set({ modal: { id, props } }),
  closeModal: () => set({ modal: null }),

  toggleAdminSidebar: () =>
    set((state) => {
      const next = !state.adminSidebarCollapsed;
      try {
        localStorage.setItem(SIDEBAR_STORAGE_KEY, String(next));
      } catch (_) {}
      return { adminSidebarCollapsed: next };
    }),

  setAdminSidebarCollapsed: (v) => {
    try {
      localStorage.setItem(SIDEBAR_STORAGE_KEY, String(v));
    } catch (_) {}
    set({ adminSidebarCollapsed: v });
  },

  setAdminSidebarPages: (pages) => {
    const updated = { ...DEFAULT_SIDEBAR_PAGES, ...pages, settings: true };
    try {
      localStorage.setItem(SIDEBAR_PAGES_STORAGE_KEY, JSON.stringify(updated));
    } catch (_) {}
    set({ adminSidebarPages: updated });
  },

  toggleAdminSidebarPage: (pageKey) =>
    set((state) => {
      if (pageKey === 'settings') return state; // Settings always kept active
      const current = state.adminSidebarPages || DEFAULT_SIDEBAR_PAGES;
      const updated = {
        ...current,
        [pageKey]: current[pageKey] === false ? true : false,
        settings: true,
      };
      try {
        localStorage.setItem(SIDEBAR_PAGES_STORAGE_KEY, JSON.stringify(updated));
      } catch (_) {}
      return { adminSidebarPages: updated };
    }),

  resetAdminSidebarPages: () => {
    try {
      localStorage.setItem(SIDEBAR_PAGES_STORAGE_KEY, JSON.stringify(DEFAULT_SIDEBAR_PAGES));
    } catch (_) {}
    set({ adminSidebarPages: { ...DEFAULT_SIDEBAR_PAGES } });
  },
}));

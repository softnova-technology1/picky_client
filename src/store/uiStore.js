import { create } from 'zustand';

export const useUiStore = create((set) => ({
  isLoading: false,
  toast: null,      // { message, type: 'success' | 'error' | 'info' }
  modal: null,      // { id, props }

  setLoading: (v) => set({ isLoading: v }),
  showToast: (message, type = 'success') => {
    set({ toast: { message, type } });
    setTimeout(() => set({ toast: null }), 3500);
  },
  openModal: (id, props = {}) => set({ modal: { id, props } }),
  closeModal: () => set({ modal: null }),
}));

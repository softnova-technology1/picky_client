import { create } from 'zustand';

export const useOrderStore = create((set) => ({
  orders: [],
  activeOrder: null,
  trackingInfo: null,

  setOrders: (orders) => set({ orders }),
  setActiveOrder: (order) => set({ activeOrder: order }),
  setTrackingInfo: (info) => set({ trackingInfo: info }),
  clearOrder: () => set({ activeOrder: null, trackingInfo: null }),
}));

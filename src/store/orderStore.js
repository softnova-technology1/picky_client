import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { MOCK_ORDERS_EXTENDED } from '../data/adminMockData';

// ─── Picky Shared Order Store ────────────────────────────────────────────────
// Single source of truth for orders.
// Persists in localStorage and syncs with backend API.

export const useOrderStore = create(
  persist(
    (set, get) => ({
      orders: [...MOCK_ORDERS_EXTENDED],
      activeOrder: null,
      trackingInfo: null,

  // ── Customer: Add a newly placed order (from Checkout) ──────────────────────
  addOrder: (order) => {
    set((state) => ({ orders: [order, ...state.orders] }));
  },

  // ── Customer: Get all orders (for /orders page) ─────────────────────────────
  getOrders: () => get().orders,

  // ── Customer: Get a single order by ID (for /orders/:id) ─────────────────────
  getOrderById: (id) => {
    const orders = get().orders;
    return orders.find((o) => o._id === id || o.id === id) || null;
  },

  // ── Admin: Update order status ────────────────────────────────────────────────
  // Progression: confirmed → shipped → delivered | cancelled (terminal)
  updateOrderStatus: (orderId, newStatus) => {
    set((state) => ({
      orders: state.orders.map((o) =>
        o._id === orderId || o.id === orderId
          ? { ...o, status: newStatus, updatedAt: new Date().toISOString() }
          : o
      ),
    }));
  },

  // ── Admin: Update AWB tracking info ──────────────────────────────────────────
  updateOrderTracking: (orderId, { trackingId, courier }) => {
    set((state) => ({
      orders: state.orders.map((o) =>
        o._id === orderId || o.id === orderId
          ? {
              ...o,
              trackingId: trackingId || o.trackingId,
              courier: courier || o.courier,
              updatedAt: new Date().toISOString(),
            }
          : o
      ),
    }));
  },

  // ── Admin: Full order update (status + AWB together) ─────────────────────────
  updateOrder: (orderId, updates) => {
    set((state) => ({
      orders: state.orders.map((o) =>
        o._id === orderId || o.id === orderId
          ? { ...o, ...updates, updatedAt: new Date().toISOString() }
          : o
      ),
    }));
  },

      setOrders: (orders) => set({ orders }),
      setActiveOrder: (order) => set({ activeOrder: order }),
      setTrackingInfo: (info) => set({ trackingInfo: info }),
      clearOrder: () => set({ activeOrder: null, trackingInfo: null }),
    }),
    {
      name: 'picky_order_store',
      partialize: (state) => ({ orders: state.orders }),
    }
  )
);

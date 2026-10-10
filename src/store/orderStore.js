import { create } from 'zustand';

// ─── Picky Shared Order Store ────────────────────────────────────────────────
// In-memory store synced directly with backend MongoDB database (NO localStorage).

export const useOrderStore = create((set, get) => ({
  orders: [],
  activeOrder: null,
  trackingInfo: null,

  // ── Customer: Add a newly placed order (in-memory) ───────────────────────────
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

  // ── Admin: Full order update ────────────────────────────────────────────────
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
}));

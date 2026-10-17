import { create } from 'zustand';

export const LOW_STOCK_THRESHOLD = 5;

// ─── Picky Shared Mock Stock Store ───────────────────────────────────────────
// Single source of truth for product stock levels in mock mode.
// AdminInventory adjustments here reflect in ProductCard / ProductDetail stock badges.

export const useMockStockStore = create((set, get) => ({
  // { productId: stockNumber }
  stockMap: {},

  // ── Get stock for a single product ───────────────────────────────────────────
  getStock: (productId) => {
    const map = get().stockMap;
    return map[productId] !== undefined ? map[productId] : null;
  },

  // ── Admin: Adjust stock (add or subtract) ────────────────────────────────────
  adjustStock: (productId, delta) => {
    set((state) => {
      const current = state.stockMap[productId] ?? 0;
      const updated = Math.max(0, current + delta);
      return { stockMap: { ...state.stockMap, [productId]: updated } };
    });
  },

  // ── Admin: Set stock to exact value ──────────────────────────────────────────
  setStock: (productId, value) => {
    set((state) => ({
      stockMap: { ...state.stockMap, [productId]: Math.max(0, value) },
    }));
  },

  getInventoryList: () => [],
}));

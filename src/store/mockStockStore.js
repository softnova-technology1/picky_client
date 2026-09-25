import { create } from 'zustand';
import { MOCK_PRODUCTS } from '../data/adminMockData';

// ─── Picky Shared Mock Stock Store ───────────────────────────────────────────
// Single source of truth for product stock levels in mock mode.
// AdminInventory adjustments here reflect in ProductCard / ProductDetail stock badges.

// Build initial stock map from MOCK_PRODUCTS (productId → stock)
const buildStockMap = (products) => {
  const map = {};
  products.forEach((p) => {
    map[p._id] = typeof p.stock === 'number' ? p.stock : 0;
  });
  return map;
};

export const useMockStockStore = create((set, get) => ({
  // { productId: stockNumber }
  stockMap: buildStockMap(MOCK_PRODUCTS),

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

  // ── Get all as inventory-ready array (mirrors MOCK_INVENTORY shape) ──────────
  getInventoryList: () => {
    const map = get().stockMap;
    return MOCK_PRODUCTS.map((p, idx) => {
      const catCode = p.category?.slug ? p.category.slug.split('-').map(s => s[0]).join('').toUpperCase() : 'GEN';
      const fallbackSku = `${catCode}-${String(idx + 1).padStart(3, '0')}`;
      return {
        _id: `inv_${p._id}`,
        productId: p._id,
        productName: p.name,
        sku: p.sku || fallbackSku,
        slug: p.slug,
        category: p.category?.name || 'General',
        categoryId: p.category?._id || '',
        subCategory: p.subCategory?.name || 'General',
        image: p.images?.[0] || p.image || '',
        currentStock: map[p._id] ?? p.stock ?? 0,
        lowStockThreshold: 5,
        price: p.price,
        sellingPrice: p.discountPrice || p.price,
        lastUpdated: new Date().toLocaleDateString('en-IN'),
        lastReason: 'Initial Load',
      };
    });
  },
}));

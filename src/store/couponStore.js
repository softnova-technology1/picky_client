import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { MOCK_COUPONS, MOCK_DISCOUNTS } from '../data/adminMockData';

// ─── Date Helpers ─────────────────────────────────────────────────────────────

// Helper: Parse date to end of that day (23:59:59.999)
export function parseEndOfDay(dateStr) {
  if (!dateStr) return null;
  if (typeof dateStr === 'string' && /^\d{4}-\d{2}-\d{2}/.test(dateStr)) {
    const parts = dateStr.slice(0, 10).split('-');
    const y = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10);
    const d = parseInt(parts[2], 10);
    return new Date(y, m - 1, d, 23, 59, 59, 999);
  }
  const dt = new Date(dateStr);
  return isNaN(dt.getTime()) ? null : dt;
}

// Helper: Format date to "12 Jun 26"
export function formatValidityDate(dateStr) {
  if (!dateStr) return '';
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  if (typeof dateStr === 'string' && /^\d{4}-\d{2}-\d{2}/.test(dateStr)) {
    const parts = dateStr.slice(0, 10).split('-');
    const y = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10);
    const d = parseInt(parts[2], 10);
    return `${d} ${months[m - 1]} ${String(y).slice(-2)}`;
  }
  const dt = new Date(dateStr);
  if (isNaN(dt.getTime())) return String(dateStr);
  return `${dt.getDate()} ${months[dt.getMonth()]} ${String(dt.getFullYear()).slice(-2)}`;
}

// Helper: Compute status ('Expired' | 'Disabled' | 'Active') for promo coupon
export function getCouponStatus(coupon) {
  if (!coupon) return 'Disabled';
  if (coupon.validTill) {
    const end = parseEndOfDay(coupon.validTill);
    if (end && new Date() > end) {
      return 'Expired';
    }
  }
  if (!coupon.isActive) {
    return 'Disabled';
  }
  return 'Active';
}

// Helper: Compute status ('Expired' | 'Disabled' | 'Active') for automatic discount
export function getDiscountStatus(discount) {
  if (!discount) return 'Disabled';
  if (discount.validTill) {
    const end = parseEndOfDay(discount.validTill);
    if (end && new Date() > end) {
      return 'Expired';
    }
  }
  if (!discount.isActive) {
    return 'Disabled';
  }
  return 'Active';
}

// Helper: Check if coupon is expiring soon (within 3 days and active)
export function isExpiringSoon(coupon, status) {
  if (status !== 'Active' || !coupon?.validTill) return false;
  const end = parseEndOfDay(coupon.validTill);
  if (!end) return false;
  const now = new Date();
  const diffMs = end.getTime() - now.getTime();
  const threeDaysMs = 3 * 24 * 60 * 60 * 1000;
  return diffMs > 0 && diffMs <= threeDaysMs;
}

export const DEFAULT_COUPONS = [
  {
    _id: 'cpn_welcome100',
    code: 'WELCOME100',
    type: 'flat',
    value: 100,
    minOrderAmount: 999,
    maxDiscountAmount: 100,
    isActive: true,
    applicableOn: 'All Products',
    validTill: '2026-12-31',
  },
  {
    _id: 'cpn_picky10',
    code: 'PICKY10',
    type: 'percentage',
    value: 10,
    minOrderAmount: 499,
    maxDiscountAmount: 300,
    isActive: true,
    applicableOn: 'All Products',
    validTill: '2026-12-31',
  },
  {
    _id: 'cpn_festive20',
    code: 'FESTIVE20',
    type: 'percentage',
    value: 20,
    minOrderAmount: 1499,
    maxDiscountAmount: 500,
    isActive: true,
    applicableOn: 'All Products',
    validTill: '2026-12-31',
  },
];

// ─── Picky Shared Coupon Store ────────────────────────────────────────────────
// Single shared source of truth for coupons and automatic discounts.
// Status changes in Coupons page reflect immediately in Reports page and Checkout.

export const useCouponStore = create(
  persist(
    (set, get) => ({
      coupons: [...DEFAULT_COUPONS],
      discounts: [...MOCK_DISCOUNTS],

      setCoupons: (coupons) => set({ coupons }),
      setDiscounts: (discounts) => set({ discounts }),

      toggleCoupon: (couponId) => {
        set((state) => ({
          coupons: state.coupons.map((c) =>
            c._id === couponId || c.code === couponId
              ? { ...c, isActive: !c.isActive }
              : c
          ),
        }));
      },

      updateCoupon: (couponId, updates) => {
        set((state) => ({
          coupons: state.coupons.map((c) =>
            c._id === couponId || c.code === couponId
              ? { ...c, ...updates }
              : c
          ),
        }));
      },

      addCoupon: (newCoupon) => {
        set((state) => ({
          coupons: [newCoupon, ...state.coupons],
        }));
      },

      deleteCoupon: (couponId) => {
        set((state) => ({
          coupons: state.coupons.filter(
            (c) => c._id !== couponId && c.code !== couponId
          ),
        }));
      },

      toggleDiscount: (discountId) => {
        set((state) => ({
          discounts: state.discounts.map((d) =>
            d._id === discountId ? { ...d, isActive: !d.isActive } : d
          ),
        }));
      },

      updateDiscount: (discountId, updates) => {
        set((state) => ({
          discounts: state.discounts.map((d) =>
            d._id === discountId ? { ...d, ...updates } : d
          ),
        }));
      },

      addDiscount: (newDiscount) => {
        set((state) => ({
          discounts: [newDiscount, ...state.discounts],
        }));
      },

      deleteDiscount: (discountId) => {
        set((state) => ({
          discounts: state.discounts.filter((d) => d._id !== discountId),
        }));
      },
    }),
    {
      name: 'picky_coupon_store',
      partialize: (state) => ({
        coupons: state.coupons,
        discounts: state.discounts,
      }),
      onRehydrateStorage: () => (state) => {
        if (!state) return;
        if (!state.coupons || state.coupons.length === 0) {
          state.coupons = [...DEFAULT_COUPONS];
        }
        if (!state.discounts || state.discounts.length === 0) {
          state.discounts = [...MOCK_DISCOUNTS];
        }
      },
    }
  )
);

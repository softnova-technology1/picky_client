import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// ─── Date Helpers ─────────────────────────────────────────────────────────────

// Helper: Parse date or datetime string to start of period
export function parseCouponStartDate(dateStr) {
  if (!dateStr) return null;
  if (dateStr instanceof Date) return isNaN(dateStr.getTime()) ? null : dateStr;
  const str = String(dateStr).trim();
  if (str.includes('T') || str.includes(':')) {
    const dt = new Date(str);
    return isNaN(dt.getTime()) ? null : dt;
  }
  if (/^\d{4}-\d{2}-\d{2}/.test(str)) {
    const parts = str.slice(0, 10).split('-');
    const y = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10);
    const d = parseInt(parts[2], 10);
    return new Date(y, m - 1, d, 0, 0, 0, 0);
  }
  const dt = new Date(str);
  return isNaN(dt.getTime()) ? null : dt;
}

// Helper: Parse date or datetime string to end of period
export function parseCouponEndDate(dateStr) {
  if (!dateStr) return null;
  if (dateStr instanceof Date) return isNaN(dateStr.getTime()) ? null : dateStr;
  const str = String(dateStr).trim();
  if (str.includes('T') || str.includes(':')) {
    const dt = new Date(str);
    return isNaN(dt.getTime()) ? null : dt;
  }
  if (/^\d{4}-\d{2}-\d{2}/.test(str)) {
    const parts = str.slice(0, 10).split('-');
    const y = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10);
    const d = parseInt(parts[2], 10);
    return new Date(y, m - 1, d, 23, 59, 59, 999);
  }
  const dt = new Date(str);
  return isNaN(dt.getTime()) ? null : dt;
}

// Helper: Parse date to end of that day (backward compatibility)
export function parseEndOfDay(dateStr) {
  return parseCouponEndDate(dateStr);
}

// Helper: Format ISO/Date string into YYYY-MM-DDTHH:mm for <input type="datetime-local">
export function toDateTimeLocalInput(dateVal) {
  if (!dateVal) return '';
  const dt = dateVal instanceof Date ? dateVal : new Date(dateVal);
  if (isNaN(dt.getTime())) return '';
  const y = dt.getFullYear();
  const m = String(dt.getMonth() + 1).padStart(2, '0');
  const d = String(dt.getDate()).padStart(2, '0');
  const hh = String(dt.getHours()).padStart(2, '0');
  const mm = String(dt.getMinutes()).padStart(2, '0');
  return `${y}-${m}-${d}T${hh}:${mm}`;
}

// Helper: Format date & time to "12 Jun 26, 2:30 PM" or "12 Jun 26"
export function formatValidityDate(dateStr) {
  if (!dateStr) return '';
  const dt = dateStr instanceof Date ? dateStr : new Date(dateStr);
  if (isNaN(dt.getTime())) return String(dateStr);

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const d = dt.getDate();
  const m = months[dt.getMonth()];
  const y = String(dt.getFullYear()).slice(-2);

  const hasTime = typeof dateStr === 'string'
    ? (dateStr.includes('T') || dateStr.includes(':'))
    : (dt.getHours() !== 0 || dt.getMinutes() !== 0);

  if (hasTime) {
    const hours = dt.getHours();
    const minutes = String(dt.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const h12 = hours % 12 || 12;
    return `${d} ${m} ${y}, ${h12}:${minutes} ${ampm}`;
  }

  return `${d} ${m} ${y}`;
}

// Helper: Compute status ('Active' | 'Scheduled' | 'Expired' | 'Disabled') for promo coupon
export function getCouponStatus(coupon) {
  if (!coupon) return 'Disabled';
  if (coupon.isActive === false) {
    return 'Disabled';
  }

  const now = new Date();
  const startDate = coupon.validFrom || coupon.startsAt;
  const endDate = coupon.validTill || coupon.endsAt;

  if (endDate) {
    const end = parseCouponEndDate(endDate);
    if (end && now > end) {
      return 'Expired';
    }
  }

  if (startDate) {
    const start = parseCouponStartDate(startDate);
    if (start && now < start) {
      return 'Scheduled';
    }
  }

  return 'Active';
}

// Helper: Compute status ('Active' | 'Scheduled' | 'Expired' | 'Disabled') for automatic discount
export function getDiscountStatus(discount) {
  if (!discount) return 'Disabled';
  if (discount.isActive === false) {
    return 'Disabled';
  }

  const now = new Date();
  const startDate = discount.validFrom || discount.startsAt;
  const endDate = discount.validTill || discount.endsAt;

  if (endDate) {
    const end = parseCouponEndDate(endDate);
    if (end && now > end) {
      return 'Expired';
    }
  }

  if (startDate) {
    const start = parseCouponStartDate(startDate);
    if (start && now < start) {
      return 'Scheduled';
    }
  }

  return 'Active';
}

// Helper: Check if coupon is expiring soon (within 3 days and active)
export function isExpiringSoon(coupon, status) {
  if (status !== 'Active') return false;
  const endDate = coupon?.validTill || coupon?.endsAt;
  if (!endDate) return false;
  const end = parseCouponEndDate(endDate);
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
      discounts: [],

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

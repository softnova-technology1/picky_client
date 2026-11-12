import api from './api';

export const couponService = {
  /**
   * Validate a coupon code in real-time from the backend MongoDB database
   * @param {string} code - The entered promo/coupon code (e.g. 'AJITH')
   * @param {number} subtotal - The current cart subtotal
   * @param {Array} items - The current cart items for selective target evaluation
   */
  validateCoupon: (code, subtotal, items = []) => {
    return api.post('/coupons/validate', { code, subtotal, items });
  },

  /**
   * Fetch all active public coupons from the backend MongoDB database
   */
  getPublicCoupons: () => {
    return api.get('/coupons/public');
  },
};

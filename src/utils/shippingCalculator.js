/**
 * shippingCalculator.js
 * Centralized dynamic shipping calculator based on live database settings.
 *
 * Rules:
 * - If pincode belongs to Tamil Nadu (starts with 60, 61, 62, 63, or 64):
 *   Apply the admin-configured Tamil Nadu rate.
 * - For any other pincode (all other states across India):
 *   Apply the admin-configured All India rate.
 * - If deliveryMode === 'pickup':
 *   Apply ₹0.
 */

export const isTamilNaduPincode = (pincodeStr) => {
  const pin = (pincodeStr || '').toString().trim().replace(/\D/g, '');
  if (!pin || pin.length < 2) return false;
  const firstTwo = parseInt(pin.slice(0, 2), 10);
  // All Tamil Nadu & Pondicherry postal codes start with 60, 61, 62, 63, or 64
  return firstTwo >= 60 && firstTwo <= 64;
};

export const calculateShippingFee = (pincodeStr, shippingSettings = {}, deliveryMode = 'standard') => {
  if (deliveryMode === 'pickup') {
    return {
      fee: 0,
      zone: 'Self Pickup',
      daysText: 'Ready for pickup in 24 hours',
      state: 'Store Pickup',
      isTamilNadu: false,
    };
  }

  const pin = (pincodeStr || '').toString().trim().replace(/\D/g, '');

  // Instant cache hydration if shippingSettings is still loading/null
  let effectiveSettings = shippingSettings;
  if (!effectiveSettings || (!effectiveSettings.tamilNadu && !effectiveSettings.allIndia)) {
    try {
      const cached = localStorage.getItem('picky_shipping_settings');
      if (cached) {
        effectiveSettings = JSON.parse(cached);
      }
    } catch (_) {}
  }

  // Live admin settings from MongoDB database (matching live DB configured rates)
  const tnConfig = effectiveSettings?.tamilNadu || {};
  const tnFee = Number(tnConfig.shippingFee !== undefined ? tnConfig.shippingFee : 50);
  const tnDays = tnConfig.estimatedDays || '5-7 Business Days';

  const allIndiaConfig = effectiveSettings?.allIndia || {};
  const allIndiaFee = Number(
    allIndiaConfig.shippingFee !== undefined
      ? allIndiaConfig.shippingFee
      : (effectiveSettings?.standardShippingFee !== undefined ? effectiveSettings.standardShippingFee : 70)
  );
  const allIndiaDays = allIndiaConfig.estimatedDays || effectiveSettings?.estimatedDeliveryDays || '15 - 20 Business Days';

  // If pincode is entered and belongs to Tamil Nadu
  if (pin && isTamilNaduPincode(pin)) {
    return {
      fee: tnFee,
      zone: 'Tamil Nadu Delivery',
      daysText: tnDays,
      state: 'Tamil Nadu',
      isTamilNadu: true,
    };
  }

  // Any other pincode falls under All India
  return {
    fee: allIndiaFee,
    zone: 'All India Delivery',
    daysText: allIndiaDays,
    state: 'All India',
    isTamilNadu: false,
  };
};

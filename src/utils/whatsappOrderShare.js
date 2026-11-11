/**
 * Normalize an Indian or international phone number to digits-only format for wa.me links.
 * Converts 10-digit numbers and 11-digit 0-prefixed Indian numbers to 91XXXXXXXXXX.
 */
export function normalizeWhatsappPhone(phone) {
  let cleaned = String(phone || '').replace(/\D/g, '');
  if (cleaned.length === 11 && cleaned.startsWith('0')) {
    cleaned = cleaned.slice(1);
  }
  if (cleaned.length === 10) {
    cleaned = `91${cleaned}`;
  }
  return cleaned.length >= 10 ? cleaned : '';
}

/**
 * Extract customer display name, raw phone, normalized WhatsApp digits, and availability flag from an order.
 */
export function getOrderCustomerInfo(order) {
  const name =
    order?.customer?.name ||
    order?.user?.name ||
    order?.shippingAddress?.fullName ||
    'Customer';
  const rawPhone =
    order?.customer?.phone ||
    order?.user?.phone ||
    order?.shippingAddress?.phone ||
    '';
  const whatsappPhone = normalizeWhatsappPhone(rawPhone);

  return {
    name,
    rawPhone,
    whatsappPhone,
    hasPhone: whatsappPhone.length >= 10,
  };
}

/**
 * Resolve AWB number, courier name, courier live-tracking link, and Picky storefront track-order URL.
 */
export function getOrderTrackingInfo(order, origin) {
  const resolvedOrigin =
    origin ||
    (typeof window !== 'undefined' && window.location?.origin
      ? window.location.origin
      : 'https://pickystore.in');
  const awb = String(order?.trackingId || order?.trackingNumber || '').trim();
  const courier = order?.courier || (awb ? 'Shiprocket Courier' : '');
  const courierTrackingUrl =
    order?.courierUrl ||
    (awb ? `https://shiprocket.co/tracking/${encodeURIComponent(awb)}` : '');
  const orderNumber = String(order?.orderNumber || order?._id || order?.id || '').trim();
  const storeTrackUrl = orderNumber
    ? `${resolvedOrigin}/track-order?order=${encodeURIComponent(orderNumber)}`
    : `${resolvedOrigin}/track-order`;

  return {
    awb,
    courier,
    courierTrackingUrl,
    storeTrackUrl,
    orderNumber,
  };
}

function summarizeOrderItems(items = []) {
  if (!Array.isArray(items) || items.length === 0) return 'Your Picky Store order';
  const preview = items
    .slice(0, 3)
    .map((item) => `${item?.name || 'Item'} × ${item?.quantity || 1}`)
    .join(', ');
  return items.length > 3 ? `${preview} (+${items.length - 3} more)` : preview;
}

/**
 * Build a WhatsApp message containing Shiprocket AWB + live tracking URL (when dispatched)
 * or an Order Confirmation summary + Picky Track Order link (when awaiting AWB).
 */
export function buildOrderWhatsappMessage(order, origin) {
  const { name } = getOrderCustomerInfo(order);
  const { awb, courier, courierTrackingUrl, storeTrackUrl, orderNumber } = getOrderTrackingInfo(order, origin);
  const totalAmount = Number(order?.total ?? order?.totalAmount ?? 0).toLocaleString('en-IN');
  const itemCount = Array.isArray(order?.items)
    ? order.items.reduce((sum, item) => sum + (Number(item?.quantity) || 1), 0)
    : 1;

  if (awb) {
    return [
      `Hi ${name}! 👋`,
      '',
      `Great news from *Picky Store*! 🎉 Your order *#${orderNumber}* has been dispatched.`,
      '',
      `📦 *Courier:* ${courier || 'Shiprocket'}`,
      `🔖 *AWB / Tracking ID:* ${awb}`,
      `💰 *Order Total:* ₹${totalAmount} (${itemCount} item${itemCount === 1 ? '' : 's'})`,
      '',
      '🚚 *Live Shipment Tracking:*',
      courierTrackingUrl,
      '',
      '🔍 *Track on Picky Store:*',
      storeTrackUrl,
      '',
      'Thank you for shopping with *Picky Store*! 💜',
    ].join('\n');
  }

  const statusText = String(order?.status || 'confirmed')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (ch) => ch.toUpperCase());

  return [
    `Hi ${name}! 👋`,
    '',
    'Thank you for shopping with *Picky Store*! 🛍️ Here are your order confirmation details:',
    '',
    `🧾 *Order Number:* #${orderNumber}`,
    `📌 *Status:* ${statusText}`,
    `📦 *Items:* ${summarizeOrderItems(order?.items)}`,
    `💰 *Order Total:* ₹${totalAmount}`,
    '',
    '🔍 *Track Your Order Status:*',
    storeTrackUrl,
    '',
    'We will send your Shiprocket AWB tracking link here as soon as your parcel is dispatched! 💜',
  ].join('\n');
}

/**
 * Build the complete https://wa.me URL and metadata for an order share action.
 */
export function buildOrderWhatsappUrl(order, origin) {
  const customer = getOrderCustomerInfo(order);
  const tracking = getOrderTrackingInfo(order, origin);
  const message = buildOrderWhatsappMessage(order, origin);
  const url = customer.hasPhone
    ? `https://wa.me/${customer.whatsappPhone}?text=${encodeURIComponent(message)}`
    : '';

  return {
    ...customer,
    tracking,
    message,
    url,
  };
}

/**
 * Open WhatsApp Web/App with the pre-filled Shiprocket tracking or order confirmation message.
 */
export function launchOrderWhatsappShare({ order, origin, showToast, e }) {
  if (e?.stopPropagation) e.stopPropagation();

  const { hasPhone, url, name, tracking } = buildOrderWhatsappUrl(order, origin);
  if (!hasPhone || !url) {
    showToast?.('Customer phone number is missing or invalid for WhatsApp sharing.', 'error');
    return false;
  }

  window.open(url, '_blank', 'noopener,noreferrer');

  if (tracking.awb) {
    showToast?.(`Opening WhatsApp to share AWB tracking (${tracking.awb}) with ${name}!`, 'success');
  } else {
    showToast?.(`Opening WhatsApp to send order #${tracking.orderNumber} confirmation to ${name}!`, 'success');
  }
  return true;
}

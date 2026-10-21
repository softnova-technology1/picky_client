import { create } from 'zustand';
import api from '../services/api';

const ABANDONED_VIEWED_CARTS_KEY = 'picky_admin_viewed_abandoned_carts';
const ABANDONED_VIEWED_CONVERSIONS_KEY = 'picky_admin_viewed_cart_conversions';

const getViewedCarts = () => {
  try {
    const raw = localStorage.getItem(ABANDONED_VIEWED_CARTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (_) {
    return [];
  }
};

const getViewedConversions = () => {
  try {
    const raw = localStorage.getItem(ABANDONED_VIEWED_CONVERSIONS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (_) {
    return [];
  }
};

const computeSidebarBadge = (cartList, viewedCarts, viewedConversions) => {
  // 1. Check for unviewed converted carts/products (GREEN priority!)
  const newConvertedCarts = cartList.filter(
    (c) =>
      (c.status === 'recovered' || c.status === 'partial_recovery' || (c.recoveredProducts && c.recoveredProducts.length > 0)) &&
      !viewedConversions.includes(String(c.id || c._id))
  );

  if (newConvertedCarts.length > 0) {
    const convertedUnits = newConvertedCarts.reduce((sum, c) => {
      const pCount = Array.isArray(c.recoveredProducts) && c.recoveredProducts.length > 0
        ? c.recoveredProducts.length
        : (c.purchasedItems?.length || c.itemCount || 1);
      return sum + pCount;
    }, 0);
    return { count: convertedUnits, color: 'green', type: 'converted' };
  }

  // 2. Check for unviewed new pending abandoned carts (RED)
  const newPendingCarts = cartList.filter(
    (c) => c.status === 'pending' && !viewedCarts.includes(String(c.id || c._id))
  );

  if (newPendingCarts.length > 0) {
    return { count: newPendingCarts.length, color: 'red', type: 'new_cart' };
  }

  return null;
};

export const useAbandonedCartStore = create((set, get) => ({
  carts: [],
  loading: false,
  error: null,
  sidebarBadge: null,
  viewedConversions: getViewedConversions(),
  viewedCarts: getViewedCarts(),

  // Fetch real carts from MongoDB backend
  fetchCarts: async (isPolling = false) => {
    if (!isPolling && get().carts.length === 0) {
      set({ loading: true, error: null });
    }
    try {
      const res = await api.get('/cart/admin/abandoned');
      const cartList = Array.isArray(res?.data)
        ? res.data
        : Array.isArray(res)
        ? res
        : (res?.data?.carts || res?.carts || []);
      
      const vCarts = getViewedCarts();
      const vConversions = getViewedConversions();
      const badge = computeSidebarBadge(cartList, vCarts, vConversions);

      set({
        carts: cartList,
        loading: false,
        error: null,
        viewedCarts: vCarts,
        viewedConversions: vConversions,
        sidebarBadge: badge,
      });
    } catch (err) {
      console.error('Failed to fetch abandoned carts from API:', err);
      // Retain existing carts on background polling errors to avoid blank screens
      set((state) => ({
        loading: false,
        error: err?.message || 'Error fetching carts',
        carts: state.carts.length > 0 ? state.carts : [],
      }));
    }
  },

  // Mark all carts & conversions as viewed (clears the sidebar badge on click/view)
  markCartsAsViewed: () => {
    const carts = get().carts;
    const cartIds = carts.map((c) => String(c.id || c._id)).filter(Boolean);
    const conversionIds = carts
      .filter((c) => c.status === 'recovered' || c.status === 'partial_recovery' || (c.recoveredProducts && c.recoveredProducts.length > 0))
      .map((c) => String(c.id || c._id))
      .filter(Boolean);

    const mergedCarts = Array.from(new Set([...getViewedCarts(), ...cartIds]));
    const mergedConversions = Array.from(new Set([...getViewedConversions(), ...conversionIds]));

    try {
      localStorage.setItem(ABANDONED_VIEWED_CARTS_KEY, JSON.stringify(mergedCarts));
      localStorage.setItem(ABANDONED_VIEWED_CONVERSIONS_KEY, JSON.stringify(mergedConversions));
    } catch (_) {}

    set({
      viewedCarts: mergedCarts,
      viewedConversions: mergedConversions,
      sidebarBadge: null,
    });
  },

  // Mark single conversion as viewed (switches table row from glowing green to normal)
  markSingleCartConversionAsViewed: (cartId) => {
    const cleanId = String(cartId);
    const existing = getViewedConversions();
    if (!existing.includes(cleanId)) {
      const updated = [...existing, cleanId];
      try {
        localStorage.setItem(ABANDONED_VIEWED_CONVERSIONS_KEY, JSON.stringify(updated));
      } catch (_) {}
      set((state) => {
        const newBadge = computeSidebarBadge(state.carts, state.viewedCarts, updated);
        return {
          viewedConversions: updated,
          sidebarBadge: newBadge,
        };
      });
    }
  },

  // 1. Send Recovery Alert (WhatsApp / SMS / Email)
  sendRecoveryAlert: async (cartId, { templateName, discountCode, channel = 'WhatsApp', offerDetails } = {}) => {
    const now = new Date().toISOString();
    const offerSummary = offerDetails
      ? `(Offer: ${offerDetails.discountType === 'flat' ? `₹${offerDetails.discountValue} OFF` : `${offerDetails.discountValue}% OFF`}, Code: ${discountCode})`
      : `(Coupon: ${discountCode || 'None'})`;

    set((state) => ({
      carts: state.carts.map((cart) => {
        if (cart.id === cartId || cart._id === cartId) {
          return {
            ...cart,
            status: 'sent',
            alertsSentCount: (cart.alertsSentCount || 0) + 1,
            lastAlertSentAt: now,
            lastTemplateUsed: templateName || 'Special 5% Comeback Discount',
            appliedOffer: offerDetails || null,
            timeline: [
              ...(cart.timeline || []),
              {
                event: `${channel} Alert Dispatched`,
                note: `Dispatched recovery alert using "${templateName || 'Comeback Discount'}" ${offerSummary} via ${channel}.`,
                timestamp: now,
              },
            ],
          };
        }
        return cart;
      }),
    }));

    try {
      await api.post(`/cart/admin/abandoned/${cartId}/alert`, {
        templateName,
        discountCode,
        channel,
        offerDetails,
      });
    } catch (err) {
      console.error('Failed to persist recovery alert to MongoDB:', err);
    }
  },

  // 2. Mark as Recovered (Turned into Paid Order — Full or Single/Partial product)
  markAsRecovered: async (cartId, orderNumber, { convertedProducts = null, convertedItems = null, wonBackAmount = null } = {}) => {
    const nowDate = new Date();
    const now = nowDate.toISOString();
    const autoOrder = orderNumber || `PKY-${nowDate.toISOString().slice(0, 10).replace(/-/g, '')}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    // Format 12-Hour AM/PM Time
    let hours = nowDate.getHours();
    const minutes = nowDate.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const timeFormatted = `${hours}:${minutes} ${ampm} (${nowDate.getDate()} ${monthNames[nowDate.getMonth()]} ${nowDate.getFullYear()})`;

    let targetItemsPayload = [];

    set((state) => ({
      carts: state.carts.map((cart) => {
        if (cart.id === cartId || cart._id === cartId) {
          const itemsToConvert = Array.isArray(convertedItems) && convertedItems.length > 0
            ? convertedItems
            : Array.isArray(convertedProducts) && convertedProducts.length > 0
            ? cart.items.filter((i) => convertedProducts.includes(i.sku) || convertedProducts.includes(i.name))
            : cart.items;

          targetItemsPayload = itemsToConvert;
          const calculatedWonBack = wonBackAmount || itemsToConvert.reduce((s, i) => s + ((i.price || 0) * (i.quantity || 1)), 0);
          const isPartial = itemsToConvert.length < cart.items.length;

          // Product Name, Product Price, Total Price, Time AM/PM
          const itemsDetailList = itemsToConvert
            .map((i) => `"${i.name}" (₹${((i.price || 0) * (i.quantity || 1)).toLocaleString('en-IN')}, Qty: ${i.quantity || 1})`)
            .join(', ');

          const note = `Product: ${itemsDetailList} | Total Price: ₹${calculatedWonBack.toLocaleString('en-IN')} | Time: ${timeFormatted} | Order #${autoOrder}`;

          const newlyRecoveredSkus = Array.from(new Set([
            ...(cart.recoveredProducts || []),
            ...itemsToConvert.map((i) => i.sku || i.name),
          ]));

          const allRecovered = cart.items.every((i) =>
            newlyRecoveredSkus.includes(i.sku) || newlyRecoveredSkus.includes(i.name)
          );

          return {
            ...cart,
            status: allRecovered ? 'recovered' : 'partial_recovery',
            isPartialRecovery: !allRecovered,
            recoveredAt: now,
            recoveredOrderNumber: autoOrder,
            recoveredAmount: (cart.recoveredAmount || 0) + calculatedWonBack,
            recoveredProducts: newlyRecoveredSkus,
            timeline: [
              ...(cart.timeline || []),
              {
                event: isPartial ? `Converted (${itemsToConvert.length} item)` : 'Converted Order (All Items)',
                note,
                timestamp: now,
              },
            ],
          };
        }
        return cart;
      }),
    }));

    try {
      await api.post(`/cart/admin/abandoned/${cartId}/recover`, {
        orderNumber: autoOrder,
        convertedProducts,
        convertedItems: targetItemsPayload,
        wonBackAmount,
      });
    } catch (err) {
      console.error('Failed to persist recovery to MongoDB:', err);
    }
  },

  // 3. Revert/Remove Converted Status (Single Item or Entire Cart)
  revertConversion: async (cartId, { sku = null } = {}) => {
    const nowDate = new Date();
    const now = nowDate.toISOString();
    let hours = nowDate.getHours();
    const minutes = nowDate.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const timeFormatted = `${hours}:${minutes} ${ampm} (${nowDate.getDate()} ${monthNames[nowDate.getMonth()]} ${nowDate.getFullYear()})`;

    set((state) => ({
      carts: state.carts.map((cart) => {
        if (cart.id === cartId || cart._id === cartId) {
          if (sku) {
            const revertedItem = cart.items.find((i) => i.sku === sku || i.name === sku);
            const itemName = revertedItem?.name || sku;
            const updatedSkus = (cart.recoveredProducts || []).filter((s) => s !== sku && s !== itemName);
            const remainingRecovered = cart.items.filter((i) => updatedSkus.includes(i.sku) || updatedSkus.includes(i.name));
            const remainingAmount = remainingRecovered.reduce((s, i) => s + ((i.price || 0) * (i.quantity || 1)), 0);

            const isNoneLeft = remainingRecovered.length === 0;
            return {
              ...cart,
              status: isNoneLeft ? 'pending' : 'partial_recovery',
              isPartialRecovery: !isNoneLeft,
              recoveredOrderNumber: isNoneLeft ? null : cart.recoveredOrderNumber,
              recoveredAmount: isNoneLeft ? 0 : remainingAmount,
              recoveredAt: isNoneLeft ? null : cart.recoveredAt,
              recoveredProducts: isNoneLeft ? [] : updatedSkus,
              timeline: [
                ...(cart.timeline || []),
                {
                  event: `Conversion Reverted (${itemName})`,
                  note: `Reverted Item: "${itemName}" | Remaining Converted: ${remainingRecovered.length} item(s) (₹${remainingAmount.toLocaleString('en-IN')}) | Time: ${timeFormatted}`,
                  timestamp: now,
                },
              ],
            };
          } else {
            return {
              ...cart,
              status: 'pending',
              isPartialRecovery: false,
              recoveredOrderNumber: null,
              recoveredAmount: 0,
              recoveredAt: null,
              recoveredProducts: [],
              timeline: [
                ...(cart.timeline || []),
                {
                  event: 'All Conversions Reverted',
                  note: `All product conversions were reverted to unconverted state by admin | Time: ${timeFormatted}`,
                  timestamp: now,
                },
              ],
            };
          }
        }
        return cart;
      }),
    }));

    try {
      await api.post(`/cart/admin/abandoned/${cartId}/revert`, { sku });
    } catch (err) {
      console.error('Failed to persist conversion revert to MongoDB:', err);
    }
  },

  // 4. Mark as Expired
  markAsExpired: async (cartId) => {
    const now = new Date().toISOString();
    set((state) => ({
      carts: state.carts.map((cart) =>
        cart.id === cartId || cart._id === cartId
          ? {
              ...cart,
              status: 'expired',
              timeline: [
                ...(cart.timeline || []),
                {
                  event: 'Cart Expired',
                  note: 'Cart marked expired by admin.',
                  timestamp: now,
                },
              ],
            }
          : cart
      ),
    }));

    try {
      await api.post(`/cart/admin/abandoned/${cartId}/expire`);
    } catch (err) {
      console.error('Failed to persist expired status to MongoDB:', err);
    }
  },

  // 4. Delete Cart
  deleteCart: (cartId) => {
    set((state) => ({
      carts: state.carts.filter((c) => c.id !== cartId),
    }));
  },

  // 5. Bulk Dispatch Recovery Alerts
  bulkSendAlerts: async (cartIds, { templateName = 'Special 5% Comeback Discount', channel = 'WhatsApp' } = {}) => {
    const now = new Date().toISOString();
    set((state) => ({
      carts: state.carts.map((cart) => {
        if (cartIds.includes(cart.id) || cartIds.includes(cart._id)) {
          return {
            ...cart,
            status: 'sent',
            alertsSentCount: (cart.alertsSentCount || 0) + 1,
            lastAlertSentAt: now,
            lastTemplateUsed: templateName,
            timeline: [
              ...(cart.timeline || []),
              {
                event: `Bulk ${channel} Dispatched`,
                note: `Bulk campaign alert sent via ${channel}.`,
                timestamp: now,
              },
            ],
          };
        }
        return cart;
      }),
    }));

    try {
      await Promise.all(
        cartIds.map((id) =>
          api.post(`/cart/admin/abandoned/${id}/alert`, {
            templateName,
            channel,
          })
        )
      );
    } catch (err) {
      console.error('Failed to persist bulk alerts:', err);
    }
  },

  // Delete single Timeline entry from Audit & Conversion History
  deleteTimelineEntry: async (cartId, { index, entryId, timestamp, event } = {}) => {
    set((state) => ({
      carts: state.carts.map((cart) => {
        if (cart.id === cartId || cart._id === cartId) {
          const updatedTimeline = [...(cart.timeline || [])];
          let removed = false;

          if (entryId) {
            const idx = updatedTimeline.findIndex((t) => (t._id && t._id.toString() === entryId.toString()) || t.id === entryId);
            if (idx !== -1) {
              updatedTimeline.splice(idx, 1);
              removed = true;
            }
          }

          if (!removed && typeof index === 'number' && index >= 0 && index < updatedTimeline.length) {
            updatedTimeline.splice(index, 1);
            removed = true;
          }

          if (!removed && (timestamp || event)) {
            const idx = updatedTimeline.findIndex((t) => {
              const timeMatch = timestamp ? new Date(t.timestamp).getTime() === new Date(timestamp).getTime() : true;
              const eventMatch = event ? t.event === event : true;
              return timeMatch && eventMatch;
            });
            if (idx !== -1) {
              updatedTimeline.splice(idx, 1);
              removed = true;
            }
          }

          return {
            ...cart,
            timeline: updatedTimeline,
          };
        }
        return cart;
      }),
    }));

    try {
      await api.post(`/cart/admin/abandoned/${cartId}/timeline/delete`, { index, entryId, timestamp, event });
    } catch (err) {
      console.error('Failed to delete timeline entry from backend:', err);
    }
  },

  // 6. Refresh real data from API
  refreshCarts: () => get().fetchCarts(),
}));

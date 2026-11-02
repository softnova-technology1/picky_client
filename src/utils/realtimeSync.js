// ─── Real-Time Cross-Tab / Window Live Sync for Catalog & DB ─────────
// Enables 0ms cross-tab real-time syncing between Admin actions and Storefront pages.

let catalogSyncChannel = null;

export function getCatalogSyncChannel() {
  if (typeof window === 'undefined') return null;
  if (!catalogSyncChannel) {
    try {
      catalogSyncChannel = new BroadcastChannel('picky_catalog_live_channel');
    } catch (_) {
      catalogSyncChannel = null;
    }
  }
  return catalogSyncChannel;
}

/**
 * Broadcast catalog or database mutation across all browser windows and tabs
 * @param {string} type - Mutation type (e.g. 'PRODUCT_UPDATED', 'CATEGORY_UPDATED')
 * @param {any} payload - Optional payload
 */
export function broadcastCatalogUpdate(type = 'CATALOG_UPDATED', payload = null) {
  const ch = getCatalogSyncChannel();
  if (ch) {
    try {
      ch.postMessage({ type, payload, timestamp: Date.now() });
    } catch (_) {}
  }
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('picky_catalog_updated', { detail: { type, payload } }));
  }
}


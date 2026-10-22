import { useMemo } from 'react';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { MOCK_STORE_CUSTOMIZATION, MOCK_PAGE_SECTIONS } from '../data/customizationMockData';

// ─── BroadcastChannel for Instant 0ms Cross-Tab / Window Live Sync ───────────
let syncChannel = null;
export function getSyncChannel() {
  if (typeof window === 'undefined') return null;
  if (!syncChannel) {
    try {
      syncChannel = new BroadcastChannel('picky_customization_live_channel');
    } catch (e) {
      syncChannel = null;
    }
  }
  return syncChannel;
}

export function broadcastLiveSync(pageId, sections) {
  const ch = getSyncChannel();
  if (ch) {
    try {
      ch.postMessage({
        type: 'CUSTOMIZATION_SECTIONS_UPDATED',
        pageId,
        sections,
        timestamp: Date.now(),
      });
    } catch (e) {}
  }
}

export function broadcastLivePreview(pageId, sections) {
  const ch = getSyncChannel();
  if (ch) {
    try {
      ch.postMessage({
        type: 'CUSTOMIZATION_LIVE_PREVIEW',
        pageId,
        sections,
        timestamp: Date.now(),
      });
    } catch (e) {}
  }
}

// ─── Picky Store Customization Store (Persistent + Live Sync) ─────────────────
export const useCustomizationStore = create(
  persist(
    (set, get) => ({
      pageSections: MOCK_PAGE_SECTIONS,
      sections: MOCK_STORE_CUSTOMIZATION.sections,
      storeInfo: MOCK_STORE_CUSTOMIZATION.storeInfo,
      lastSyncTimestamp: Date.now(),

      // ── Get a section by key across all pages ──────────────────────────────────
      getSection: (key) => {
        const allSections = get().sections || [];
        const foundInFlat = allSections.find((s) => s.key === key || s.id === key);
        if (foundInFlat) return foundInFlat;

        const pages = get().pageSections || {};
        for (const pageKey of Object.keys(pages)) {
          const found = pages[pageKey]?.find((s) => s.key === key || s.id === key);
          if (found) return found;
        }
        return null;
      },

      // ── Get sections for a specific page ───────────────────────────────────────
      getPageSections: (pageId) => {
        const pages = get().pageSections || {};
        return pages[pageId] || [];
      },

      // ── Set sections for a specific page with instant live broadcast ───────────
      setPageSections: (pageId, newSections, shouldBroadcast = true) => {
        set((state) => {
          const updatedPageSections = {
            ...state.pageSections,
            [pageId]: newSections,
          };
          const flat = Object.values(updatedPageSections).flat();
          return {
            pageSections: updatedPageSections,
            sections: flat,
            lastSyncTimestamp: Date.now(),
          };
        });

        if (shouldBroadcast) {
          broadcastLiveSync(pageId, newSections);
        }
      },

      // ── Update a single section's settings ─────────────────────────────────────
      updateSectionSetting: (pageId, sectionId, field, value) => {
        set((state) => {
          const pageList = state.pageSections[pageId] || [];
          const updatedPageList = pageList.map((s) =>
            s.id === sectionId
              ? { ...s, settings: { ...s.settings, [field]: value } }
              : s
          );
          const updatedPageSections = {
            ...state.pageSections,
            [pageId]: updatedPageList,
          };
          const flat = Object.values(updatedPageSections).flat();
          return {
            pageSections: updatedPageSections,
            sections: flat,
            lastSyncTimestamp: Date.now(),
          };
        });

        broadcastLiveSync(pageId, get().pageSections[pageId]);
      },

      // ── Full sections replace ───────────────────────────────────────────────────
      setSections: (sections) => set({ sections, lastSyncTimestamp: Date.now() }),

      // ── Update store info ───────────────────────────────────────────────────────
      setStoreInfo: (info) => set({ storeInfo: info }),
      updateStoreInfo: (field, value) =>
        set((state) => ({ storeInfo: { ...state.storeInfo, [field]: value } })),
    }),
    {
      name: 'picky_customization_store_v2',
      partialize: (state) => ({
        pageSections: state.pageSections,
        sections: state.sections,
        storeInfo: state.storeInfo,
      }),
    }
  )
);

// ─── Real-Time Live Sync Listeners (BroadcastChannel + SSE Stream + Storage) ──
if (typeof window !== 'undefined') {
  // 1. BroadcastChannel: 0ms real-time updates for same-browser tabs/windows
  const ch = getSyncChannel();
  if (ch) {
    ch.addEventListener('message', (event) => {
      const data = event.data;
      if (
        (data?.type === 'CUSTOMIZATION_SECTIONS_UPDATED' || data?.type === 'CUSTOMIZATION_LIVE_PREVIEW') &&
        data.pageId &&
        Array.isArray(data.sections)
      ) {
        useCustomizationStore.getState().setPageSections(data.pageId, data.sections, false);
      }
    });
  }

  // 2. Storage Event Listener: Catch localStorage persistence updates across tabs
  window.addEventListener('storage', (event) => {
    if (event.key === 'picky_customization_store_v2' && event.newValue) {
      try {
        const parsed = JSON.parse(event.newValue);
        if (parsed?.state?.pageSections) {
          useCustomizationStore.setState({
            pageSections: parsed.state.pageSections,
            sections: parsed.state.sections || Object.values(parsed.state.pageSections).flat(),
            lastSyncTimestamp: Date.now(),
          });
        }
      } catch (e) {
        useCustomizationStore.persist.rehydrate();
      }
    }
  });

  // 3. Server-Sent Events (SSE) Live Stream:
  // Works across ALL devices, different browsers, mobile phones, and incognito sessions
  let sseSource = null;
  let sseReconnectTimer = null;

  function connectSseStream() {
    if (sseSource) {
      try {
        sseSource.close();
      } catch (e) {}
    }

    const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';
    const sseUrl = `${apiBase}/customization/live-stream`;

    try {
      sseSource = new EventSource(sseUrl);

      sseSource.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          if (
            payload?.type === 'CUSTOMIZATION_UPDATED' &&
            payload.pageId &&
            Array.isArray(payload.sections)
          ) {
            useCustomizationStore.getState().setPageSections(payload.pageId, payload.sections, false);
          }
        } catch (err) {}
      };

      sseSource.onerror = () => {
        try {
          sseSource.close();
        } catch (e) {}
        sseSource = null;

        // Auto-reconnect with 3s backoff
        clearTimeout(sseReconnectTimer);
        sseReconnectTimer = setTimeout(() => {
          connectSseStream();
        }, 3000);
      };
    } catch (err) {
      // Fallback reconnection
      clearTimeout(sseReconnectTimer);
      sseReconnectTimer = setTimeout(connectSseStream, 5000);
    }
  }

  // Fetch initial customizations on client startup
  async function fetchInitialCustomizations() {
    try {
      const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';
      const res = await fetch(`${apiBase}/customization`);
      if (res.ok) {
        const json = await res.json();
        if (json?.data) {
          useCustomizationStore.setState((state) => ({
            pageSections: {
              ...state.pageSections,
              ...json.data,
            },
            lastSyncTimestamp: Date.now(),
          }));
        }
      }
    } catch (e) {}
  }

  // Initiate real-time SSE stream & initial fetch on startup
  fetchInitialCustomizations();
  connectSseStream();
}

// ─── Custom Hook: usePageCustomization(pageId) ────────────────────────────────
// Provides reactive, real-time section order, visibility, and settings per page
export function usePageCustomization(pageId) {
  const pageSections = useCustomizationStore((state) => state.pageSections?.[pageId]);

  const sections = useMemo(() => {
    const raw = Array.isArray(pageSections) && pageSections.length > 0
      ? pageSections
      : (MOCK_PAGE_SECTIONS[pageId] || []);
    // Return sorted according to section.order (1, 2, 3...)
    return [...raw].sort((a, b) => (Number(a.order) || 0) - (Number(b.order) || 0));
  }, [pageSections, pageId]);

  const sectionMap = useMemo(() => {
    const map = {};
    for (const sec of sections) {
      if (sec.id) map[sec.id] = sec;
      if (sec.key) map[sec.key] = sec;
    }
    return map;
  }, [sections]);

  const getSection = (keyOrId) => sectionMap[keyOrId] || null;

  const isEnabled = (keyOrId, defaultVal = true) => {
    const sec = sectionMap[keyOrId];
    if (!sec) return defaultVal;
    return sec.enabled !== false;
  };

  const getSetting = (keyOrId, settingKey, fallback) => {
    const sec = sectionMap[keyOrId];
    const val = sec?.settings?.[settingKey];
    if (val !== undefined && val !== null && val !== '') return val;
    return fallback;
  };

  return {
    sections,
    sectionMap,
    getSection,
    isEnabled,
    getSetting,
  };
}

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { MOCK_STORE_CUSTOMIZATION, MOCK_PAGE_SECTIONS } from '../data/customizationMockData';

// ─── Picky Store Customization Store (Mock Mode) ──────────────────────────────
// Admin changes in AdminCustomization propagate here.
// Customer-facing components (AnnouncementBar, Home sections) read from here.

export const useCustomizationStore = create(
  persist(
    (set, get) => ({
      pageSections: MOCK_PAGE_SECTIONS,
      sections: MOCK_STORE_CUSTOMIZATION.sections,
      storeInfo: MOCK_STORE_CUSTOMIZATION.storeInfo,

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

      // ── Set sections for a specific page ───────────────────────────────────────
      setPageSections: (pageId, newSections) => {
        set((state) => {
          const updatedPageSections = {
            ...state.pageSections,
            [pageId]: newSections,
          };
          // Also update flattened sections for backward compatibility
          const flat = Object.values(updatedPageSections).flat();
          return {
            pageSections: updatedPageSections,
            sections: flat,
          };
        });
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
          };
        });
      },

      // ── Full sections replace ───────────────────────────────────────────────────
      setSections: (sections) => set({ sections }),

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

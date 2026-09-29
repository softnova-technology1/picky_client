import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { MOCK_STORE_CUSTOMIZATION } from '../data/customizationMockData';

// ─── Picky Store Customization Store (Mock Mode) ──────────────────────────────
// Admin changes in AdminCustomization propagate here.
// Customer-facing components (AnnouncementBar, Home sections) read from here.

export const useCustomizationStore = create(
  persist(
    (set, get) => ({
      sections: MOCK_STORE_CUSTOMIZATION.sections,
      storeInfo: MOCK_STORE_CUSTOMIZATION.storeInfo,

      // ── Get a section by key ────────────────────────────────────────────────────
      getSection: (key) => get().sections.find((s) => s.key === key || s.id === key),

      // ── Update a single section's settings ─────────────────────────────────────
      updateSectionSetting: (sectionId, field, value) => {
        set((state) => ({
          sections: state.sections.map((s) =>
            s.id === sectionId
              ? { ...s, settings: { ...s.settings, [field]: value } }
              : s
          ),
        }));
      },

      // ── Toggle section enabled/disabled ─────────────────────────────────────────
      toggleSection: (sectionId) => {
        set((state) => ({
          sections: state.sections.map((s) =>
            s.id === sectionId ? { ...s, enabled: !s.enabled } : s
          ),
        }));
      },

      // ── Full sections replace (used by AdminCustomization save) ─────────────────
      setSections: (sections) => set({ sections }),

      // ── Update store info ───────────────────────────────────────────────────────
      setStoreInfo: (info) => set({ storeInfo: info }),
      updateStoreInfo: (field, value) =>
        set((state) => ({ storeInfo: { ...state.storeInfo, [field]: value } })),
    }),
    {
      name: 'picky_customization_store',
      partialize: (state) => ({
        sections: state.sections,
        storeInfo: state.storeInfo,
      }),
    }
  )
);

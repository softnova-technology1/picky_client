import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// One-time automatic migration from legacy shared storage if admin user exists there
try {
  const legacyRaw = typeof window !== 'undefined' ? localStorage.getItem('picky-auth') : null;
  const adminRaw = typeof window !== 'undefined' ? localStorage.getItem('picky-admin-auth') : null;
  if (legacyRaw && !adminRaw) {
    const legacyParsed = JSON.parse(legacyRaw);
    const legacyState = legacyParsed?.state;
    if (legacyState?.user?.role === 'admin' && legacyState?.accessToken) {
      localStorage.setItem(
        'picky-admin-auth',
        JSON.stringify({
          state: {
            adminUser: legacyState.user,
            accessToken: legacyState.accessToken,
            refreshToken: legacyState.refreshToken,
            isLoggedIn: true,
          },
          version: 0,
        })
      );
    }
  }
} catch (_) {}

export const useAdminAuthStore = create(
  persist(
    (set, get) => ({
      adminUser: null,
      accessToken: null,
      refreshToken: null,
      isLoggedIn: false,

      setTokens: (accessToken, refreshToken) =>
        set((state) => ({
          accessToken,
          refreshToken: refreshToken || state.refreshToken,
        })),

      login: (adminUser, accessToken, refreshToken) =>
        set({
          adminUser,
          accessToken,
          refreshToken,
          isLoggedIn: true,
        }),

      logout: () =>
        set({
          adminUser: null,
          accessToken: null,
          refreshToken: null,
          isLoggedIn: false,
        }),

      updateAdminUser: (data) =>
        set({
          adminUser: { ...get().adminUser, ...data },
        }),
    }),
    {
      name: 'picky-admin-auth',
      partialize: (state) => ({
        adminUser: state.adminUser,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isLoggedIn: state.isLoggedIn,
      }),
    }
  )
);

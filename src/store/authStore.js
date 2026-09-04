import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isLoggedIn: false,

      setTokens: (accessToken, refreshToken) => set({ accessToken, refreshToken }),

      login: (user, accessToken, refreshToken) =>
        set({ user, accessToken, refreshToken, isLoggedIn: true }),

      logout: () =>
        set({ user: null, accessToken: null, refreshToken: null, isLoggedIn: false }),

      updateUser: (data) => set({ user: { ...get().user, ...data } }),
    }),
    {
      name: 'picky-auth',
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isLoggedIn: state.isLoggedIn,
      }),
    }
  )
);

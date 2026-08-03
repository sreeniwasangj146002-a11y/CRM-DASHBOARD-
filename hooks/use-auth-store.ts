import { create } from "zustand";
import { persist } from "zustand/middleware";

// Demo credentials for this take-home build: username "1", password "123".
export const DEMO_USERNAME = "1";
export const DEMO_PASSWORD = "123";

interface AuthState {
  isAuthenticated: boolean;
  username: string | null;
  hasHydrated: boolean;
  login: (username: string) => void;
  logout: () => void;
  setHasHydrated: (v: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      username: null,
      hasHydrated: false,
      login: (username) => set({ isAuthenticated: true, username }),
      logout: () => set({ isAuthenticated: false, username: null }),
      setHasHydrated: (v) => set({ hasHydrated: v }),
    }),
    {
      name: "crm-auth",
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);

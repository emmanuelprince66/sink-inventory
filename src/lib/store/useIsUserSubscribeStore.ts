// stores/useBusinessStore.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface SubscribeState {
  is_subscribed: any | null;
  setIsSubscribed: (id: any) => void;
  clearIsSubscribed: () => void;
}

export const useIsUserSubscribeStore = create<SubscribeState>()(
  persist(
    (set) => ({
      is_subscribed: null,
      setIsSubscribed: (state) => set({ is_subscribed: state }),
      clearIsSubscribed: () => set({ is_subscribed: null }),
    }),
    {
      name: "is-subscribed-storage", // LocalStorage key
    }
  )
);

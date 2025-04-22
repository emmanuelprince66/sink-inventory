// stores/useBusinessStore.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface BusinessState {
  business_id: string | null;
  setBusinessId: (id: string) => void;
  clearBusinessId: () => void;
}

export const useBusinessStore = create<BusinessState>()(
  persist(
    (set) => ({
      business_id: null,
      setBusinessId: (id) => set({ business_id: id }),
      clearBusinessId: () => set({ business_id: null }),
    }),
    {
      name: "business-storage", // LocalStorage key
    }
  )
);

// stores/useBusinessStore.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface BusinessDataState {
  businessData: any;
  setBusinessData: (data: any) => void;
  clearBusinessData: () => void;
}

export const useBusinessDataStore = create<BusinessDataState>()(
  persist(
    (set) => ({
      businessData: null,
      setBusinessData: (data) => set({ businessData: data }),
      clearBusinessData: () => set({ businessData: null }),
    }),
    {
      name: "business-data-storage", // LocalStorage key
    }
  )
);

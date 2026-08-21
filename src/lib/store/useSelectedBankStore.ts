import { create } from "zustand";
import { persist } from "zustand/middleware";

/**
 * Which of the business's bank accounts the wallet screens are pointed at.
 *
 * A business can have several, and every wallet call is keyed on the bank's id
 * rather than the business's — so this is not a display preference, it decides
 * which wallet is read and which one a transfer leaves from. Persisted because
 * Transfer is its own route: picking a bank and then hitting Transfer has to
 * arrive at the same wallet, not silently fall back to the primary.
 */
interface SelectedBankStore {
  selectedBankId: string | null;
  setSelectedBankId: (id: string | null) => void;
  clearSelectedBank: () => void;
}

export const useSelectedBankStore = create<SelectedBankStore>()(
  persist(
    (set) => ({
      selectedBankId: null,
      setSelectedBankId: (id) => set({ selectedBankId: id }),
      clearSelectedBank: () => set({ selectedBankId: null }),
    }),
    { name: "selected-bank-storage" },
  ),
);

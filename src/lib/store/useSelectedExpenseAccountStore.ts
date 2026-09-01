import { create } from "zustand";
import { persist } from "zustand/middleware";

/**
 * Which expense account the expenses screens are pointed at.
 *
 * Separate from the wallet screens' selected bank on purpose: a business spends
 * from an expense account and takes money from its main account, and the two
 * choices should not overwrite each other.
 *
 * Persisted for the same reason the bank one is — Transfer is its own route, so
 * picking an account on the Expenses page and then hitting Transfer has to
 * arrive at that account rather than falling back to the first one.
 */
interface SelectedExpenseAccountStore {
  selectedExpenseAccountId: string | null;
  setSelectedExpenseAccountId: (id: string | null) => void;
  clearSelectedExpenseAccount: () => void;
}

export const useSelectedExpenseAccountStore =
  create<SelectedExpenseAccountStore>()(
    persist(
      (set) => ({
        selectedExpenseAccountId: null,
        setSelectedExpenseAccountId: (id) =>
          set({ selectedExpenseAccountId: id }),
        clearSelectedExpenseAccount: () =>
          set({ selectedExpenseAccountId: null }),
      }),
      { name: "selected-expense-account-storage" },
    ),
  );

// stores/useSelectedOrderStore.ts
//
// Carries the clicked Sales > Order History row to the dedicated order-detail
// page (src/app/(dashboard)/sales/order-history/[id]/). There's no
// fetch-single-order-by-id endpoint on the Sales side (unlike Orders, which
// has GET /api/orders/{id}/view), so the row data + business snapshot the
// table already has in memory is persisted here instead of being refetched.
// Persisted to localStorage so a same-session refresh on the detail page
// still works; a cold direct link (no prior click) won't have data — the
// page handles that by pointing the merchant back to Sales.
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface SelectedOrderState {
  selectedOrder: any;
  selectedOrderBusiness: any;
  setSelectedOrder: (order: any, business: any) => void;
  clearSelectedOrder: () => void;
}

export const useSelectedOrderStore = create<SelectedOrderState>()(
  persist(
    (set) => ({
      selectedOrder: null,
      selectedOrderBusiness: null,
      setSelectedOrder: (order, business) =>
        set({ selectedOrder: order, selectedOrderBusiness: business }),
      clearSelectedOrder: () =>
        set({ selectedOrder: null, selectedOrderBusiness: null }),
    }),
    {
      name: "selected-order-storage",
    },
  ),
);

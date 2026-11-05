import { useFetchAttendants } from "@/api/attendants/get-all-attendants";
import { useFetchBankQuery } from "@/api/bank/fetch-bank";
import { useFetchBusinessById } from "@/api/business/get-business-by-id";
import { useGetCustomerQuery } from "@/api/customer/useGetCustomerQuery";
import { useCreateSalesMutation } from "@/api/sales/create-sales";
import { queryKey } from "@/constants/query-key";
import {
  queueOfflineSale,
  QueuedOfflineSale,
} from "@/lib/offline/offlineSales";
import { markServerUnreachable } from "@/lib/offline/offlineMode";
import { useCartStore } from "@/lib/store/cart-store";
import { useBusinessStore } from "@/lib/store/useBusinessStore";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "./toast/useToast";
import { useCanSeeStock } from "./useCanSeeStock";
import { useDebounce } from "./useDebounce";

export const useCheckoutHook = ({
  searchInput,
  setShowPrintReceiptView,
  closeSureModal,
  setCreateSaleResponse,
  page,
  onUnreachable,
}: {
  searchInput?: string;
  setShowPrintReceiptView?: any;
  closeSureModal?: any;
  setCreateSaleResponse?: any;
  /** A sale's request couldn't reach the server. */
  onUnreachable?: () => void;
  page?: any;
}) => {
  const business_id = useBusinessStore((state) => state.business_id);

  const {
    data: BusinessData,
    isLoading: BusinessDataLoading,
    error: bankError,
  } = useFetchBusinessById(business_id);

  const { showToast } = useToast();
  const canSeeStock = useCanSeeStock();
  const queryClient = useQueryClient();
  const setSaleCompleted = useCartStore((state) => state.setSaleCompleted);

  const {
    data: BankData,
    isLoading: BankDataLoading,
    error: BankError,
  } = useFetchBankQuery(business_id);

  // console.log("businessData", BusinessData);
  console.log("BankError---5", BankError?.data?.error);

  const debouncedSearchTerm = useDebounce(searchInput || "", 500); // 500ms debounce

  const searchTerm =
    debouncedSearchTerm?.length >= 3 || debouncedSearchTerm?.length === 0
      ? debouncedSearchTerm
      : null;

  const { data: CustomerData, isLoading: CustomerLoading } =
    useGetCustomerQuery({
      params: {
        id: business_id,
        search: searchTerm,
        limit: 20,
        page,
      },
      enabled: !!business_id,
      staleTime: 1000 * 60 * 5, // 5 minutes
    });

  const { data: AttendantsData, isLoading: AttendantsLoading } =
    useFetchAttendants(business_id);

  const {
    mutate: createSale,
    isPending: createSalePending,
    reset: resetCreateSale,
  } = useCreateSalesMutation({
    businessId: business_id, // Convert null to undefined
    onSuccess: (data: any) => {
      console.log("data----4", data);
      showToast("Sale created successfully", "success");
      setCreateSaleResponse(data);
      setSaleCompleted(true);

      /**
       * Everything a sale moves.
       *
       * The loyalty ones are the reason this is a list rather than one key. A
       * sale spends the reward it redeemed and advances the streak behind it,
       * and the customer is usually still standing there — a second purchase
       * right after redeeming is the normal case, not an edge one. Left cached,
       * the next scan would show the reward they just handed over as still
       * available, and the cashier would give it away twice.
       *
       * Stock, wallet credit, tier and reward counts all move on the same
       * sale, so the customer list and the POS product grid go with them.
       */
      [
        queryKey.transactions.getAllTransactions,
        queryKey.loyalty.getLoyaltyProgress,
        queryKey.loyalty.getLoyaltyRewards,
        queryKey.loyalty.getLoyaltyCustomers,
        queryKey.customers.getAllCustomers,
        queryKey.inventory.getAllInventory,
        queryKey.sales.getAllSalesHistory,
      ].forEach((key) =>
        queryClient.invalidateQueries({ queryKey: [key] }),
      );

      closeSureModal();
      setShowPrintReceiptView(true);
    },
    // Replaces the wrapper's onError (config is spread after it), so this
    // toasts too. When "sell without stock" is off and the cart asks for more
    // than is left, the backend names the item and what remains: drop that
    // line to the available amount so the cashier can just retry.
    onError: (error: any) => {
      // Wi-Fi with no internet, or too slow to answer: the browser says online,
      // so the only sign is the request failing. TypeError is the browser's own
      // failure, AbortError our time limit, "fetch failed" our API route's.
      const unreachable =
        error?.unreachable ||
        error instanceof TypeError ||
        error?.name === "AbortError" ||
        /fetch failed|failed to fetch/i.test(String(error?.message));
      if (unreachable) {
        // The sale may have reached the server. Saving it uses the same sale
        // ID, so the server won't record it twice.
        onUnreachable?.();
        markServerUnreachable();
        return;
      }

      const message: string =
        error?.message || error?.error || "Error creating sale";
      const match = message.match(
        /not enough stock for '(.+?)'.*?only\s+([\d.]+)\s+unit/i,
      );

      // Roles that can't see stock get the gist without the count, and the line
      // isn't set to what's left, which would show it just the same.
      if (match && !canSeeStock) {
        showToast(
          `Not enough stock for ${match[1]}. Reduce the quantity and try again.`,
          "error",
        );
        return;
      }
      showToast(message, "error");
      if (!match) return;
      const [, name, remainingText] = match;
      const remaining = Number(remainingText);
      const { cartItems, updateCartItemQuantity, removeFromCart } =
        useCartStore.getState();
      const line = cartItems.find(
        (item) => item.name?.trim().toLowerCase() === name.trim().toLowerCase(),
      );
      if (!line || !Number.isFinite(remaining)) return;
      if (remaining > 0) {
        updateCartItemQuantity(line.id, remaining);
      } else {
        removeFromCart(line.id);
      }
    },
  });

  /**
   * Offline checkout: keep the sale on this device for the sync queue, then
   * finish exactly like an online sale. The receipt reads `data.id`, so it
   * carries the client_sale_id the server will also use as the sale id.
   */
  const saveOfflineSale = async (sale: QueuedOfflineSale) => {
    try {
      await queueOfflineSale(sale);
    } catch {
      showToast(
        "Couldn't save this sale on this device. Check your connection and try again.",
        "error",
      );
      return;
    }
    showToast("Sale saved on this device", "success");
    setCreateSaleResponse({
      success: true,
      offline: true,
      data: {
        id: sale.client_sale_id,
        created_at: sale.payload.occurred_at,
        method: sale.payload.method,
        offline: true,
      },
    });
    setSaleCompleted(true);
    closeSureModal();
    setShowPrintReceiptView(true);
  };

  return {
    saveOfflineSale,
    CustomerData,
    CustomerLoading,
    BusinessData,
    BankDataLoading,
    BankError,
    BankData,
    createSalePending,
    BusinessDataLoading,
    createSale,
    resetCreateSale,
    AttendantsData,
    AttendantsLoading,
  };
};

import { useFetchAttendants } from "@/api/attendants/get-all-attendants";
import { useFetchBankQuery } from "@/api/bank/fetch-bank";
import { useFetchBusinessById } from "@/api/business/get-business-by-id";
import { useGetCustomerQuery } from "@/api/customer/useGetCustomerQuery";
import { useCreateSalesMutation } from "@/api/sales/create-sales";
import { queryKey } from "@/constants/query-key";
import { useCartStore } from "@/lib/store/cart-store";
import { useBusinessStore } from "@/lib/store/useBusinessStore";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "./toast/useToast";
import { useDebounce } from "./useDebounce";

export const useCheckoutHook = ({
  searchInput,
  setShowPrintReceiptView,
  closeSureModal,
  setCreateSaleResponse,
  page,
}: {
  searchInput?: string;
  setShowPrintReceiptView?: any;
  closeSureModal?: any;
  setCreateSaleResponse?: any;
  page?: any;
}) => {
  const business_id = useBusinessStore((state) => state.business_id);

  const {
    data: BusinessData,
    isLoading: BusinessDataLoading,
    error: bankError,
  } = useFetchBusinessById(business_id);

  const { showToast } = useToast();
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
  });

  return {
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

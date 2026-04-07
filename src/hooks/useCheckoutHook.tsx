import { useFetchAttendants } from "@/api/attendants/get-all-attendants";
import { useFetchBankQuery } from "@/api/bank/fetch-bank";
import { useFetchBusinessById } from "@/api/business/get-business-by-id";
import { useGetCustomerQuery } from "@/api/customer/useGetCustomerQuery";
import { useCreateSalesMutation } from "@/api/sales/create-sales";
import { queryKey } from "@/constants/query-key";
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

  const { mutate: createSale, isPending: createSalePending } =
    useCreateSalesMutation({
      businessId: business_id, // Convert null to undefined
      onSuccess: (data: any) => {
        console.log("data----4", data);
        showToast("Sale created successfully", "success");
        setCreateSaleResponse(data);
        queryClient.invalidateQueries({
          queryKey: [queryKey.transactions.getAllTransactions],
        });
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
    AttendantsData,
    AttendantsLoading,
  };
};

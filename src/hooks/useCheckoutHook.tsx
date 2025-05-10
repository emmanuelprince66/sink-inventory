import { useFetchAttendants } from "@/api/attendants/get-all-attendants";
import { useFetchBankQuery } from "@/api/bank/fetch-bank";
import { useFetchBusinessById } from "@/api/business/get-business-by-id";
import { useGetCustomerQuery } from "@/api/customer/useGetCustomerQuery";
import { useCreateSalesMutation } from "@/api/sales/create-sales";
import { useBusinessStore } from "@/lib/store/useBusinessStore";
import { useDebounce } from "./useDebounce";

export const useCheckoutHook = ({ searchInput }: { searchInput?: string }) => {
  const business_id = useBusinessStore((state) => state.business_id);

  const { data: BusinessData, isLoading: BusinessDataLoading } =
    useFetchBusinessById(business_id);
  const { data: BankData, isLoading: BankDataLoading } =
    useFetchBankQuery(business_id);

  console.log("businessData", BusinessData);
  console.log("BankData", BankData);

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
      },
      enabled: !!business_id,
      staleTime: 1000 * 60 * 5, // 5 minutes
    });

  const { data: AttendantsData, isLoading: AttendantsLoading } =
    useFetchAttendants(business_id);

  const { mutate: createSale, isPending: createSalePending } =
    useCreateSalesMutation({
      businessId: business_id, // Convert null to undefined
    });

  return {
    CustomerData,
    CustomerLoading,
    BusinessData,
    BankDataLoading,
    BankData,
    createSalePending,
    BusinessDataLoading,
    createSale,
    AttendantsData,
    AttendantsLoading,
  };
};

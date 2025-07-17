import { useFetchBankQuery } from "@/api/bank/fetch-bank";
import { useGetCategoriesQuery } from "@/api/category/fetch-categories";
import { useFetchTransactionQuery } from "@/api/transactions/fetch-transactions";
import { useBusinessStore } from "@/lib/store/useBusinessStore";
import moment from "moment";
import { useDebounce } from "./useDebounce";

export const useTransactionsHook = ({
  page,
  searchInput,
  type,
  dateRange,
}: any) => {
  console.log("type", type);
  const debouncedSearchTerm = useDebounce(searchInput, 500);
  const searchTerm =
    debouncedSearchTerm?.length >= 3 || debouncedSearchTerm?.length === 0
      ? debouncedSearchTerm
      : null;

  const business_id = useBusinessStore((state) => state.business_id);
  const {
    data: BankData,
    isLoading: BankDataLoading,
    refetch: refetchBank,
  } = useFetchBankQuery(business_id);

  const {
    data: TrxData,
    isLoading: TrxDataLoading,
    refetch: TrxDataRefetch,
    // isRefetching: isRefetchingInventory,
  } = useFetchTransactionQuery({
    params: {
      page,
      start_date: dateRange?.from
        ? moment(dateRange.from).format("YYYY-MM-DD")
        : undefined,
      end_date: dateRange?.to
        ? moment(dateRange.to).format("YYYY-MM-DD")
        : undefined,
      limit: 20,
      id: business_id,
      search: searchTerm,
      type: type,
    },
    enabled: !!business_id,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const { data: CategoriesData, isLoading: CategoriesDataLoading } =
    useGetCategoriesQuery({
      params: {
        id: business_id,
        type: "EXPENSES",
      },
      enabled: !!business_id,
      staleTime: 1000 * 60 * 5, // 5 minutes
    });

  return {
    BankData,
    TrxData,
    TrxDataLoading,
    BankDataLoading,
    CategoriesData,
    CategoriesDataLoading,
  };
};

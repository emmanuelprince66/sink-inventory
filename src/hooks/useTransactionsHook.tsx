import { useFetchBankQuery } from "@/api/bank/fetch-bank";
import { useGetCategoriesQuery } from "@/api/category/fetch-categories";
import { useBusinessStore } from "@/lib/store/useBusinessStore";

export const useTransactionsHook = () => {
  const business_id = useBusinessStore((state) => state.business_id);
  const {
    data: BankData,
    isLoading: BankDataLoading,
    refetch: refetchBank,
  } = useFetchBankQuery(business_id);
  const { data: CategoriesData, isLoading: CategoriesDataLoading } =
    useGetCategoriesQuery({
      params: {
        id: business_id,
        type: "EXPENSES",
      },
      enabled: !!business_id,
      staleTime: 1000 * 60 * 5, // 5 minutes
    });

  return { BankData, BankDataLoading, CategoriesData, CategoriesDataLoading };
};

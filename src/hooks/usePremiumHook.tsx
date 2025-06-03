import { useGetAllSubscriptionsQuery } from "@/api/premium/get-all-subscriptions";
import { useGetPremiumQuery } from "@/api/premium/get-subscriptions-details";
import { useDebounce } from "./useDebounce";

export const usePremiumHook = ({
  searchInput,
  page,
}: {
  searchInput?: string;
  page?: number;
}) => {
  const { data: AllSubscriptionsData, isLoading: AllSubscriptionsLoading } =
    useGetAllSubscriptionsQuery();
  const debouncedSearchTerm = useDebounce(searchInput || "", 500); // 500ms debounce
  const searchTerm =
    debouncedSearchTerm?.length >= 3 || debouncedSearchTerm?.length === 0
      ? debouncedSearchTerm
      : null;
  const { data: UserPlanData, isLoading: UserPlanDataLoading } =
    useGetPremiumQuery({
      params: {
        page,
        limit: 15,
        search: searchTerm,
        //   searchTerm
      },
      staleTime: 1000 * 60 * 5, // 5 minutes
    });
  return {
    AllSubscriptionsData,
    AllSubscriptionsLoading,
    UserPlanData,
    UserPlanDataLoading,
  };
};

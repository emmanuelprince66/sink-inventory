import { useGetInventoryQuery } from "@/api/inventory/fetch-inventory";
import { useCheckIsUserSubscribedQuery } from "@/api/premium/check-is-user-subscribed";
import { useBusinessStore } from "@/lib/store/useBusinessStore";
import { useIsUserSubscribeStore } from "@/lib/store/useIsUserSubscribeStore";
import { useEffect, useState } from "react";
import { useDebounce } from "./useDebounce";
export const usePosHook = ({ searchInput }: { searchInput?: string }) => {
  const { data: userSubData, isLoading: userSubDataLoading } =
    useCheckIsUserSubscribedQuery();

  console.log("userSubData----4", userSubData);
  const setIsSubscribed = useIsUserSubscribeStore(
    (state) => state.setIsSubscribed
  );

  const business_id = useBusinessStore((state) => state.business_id);
  const debouncedSearchTerm = useDebounce(searchInput || "", 500);
  const [page, setPage] = useState(1);

  console.log("page", page);

  const searchTerm =
    debouncedSearchTerm?.length >= 3 || debouncedSearchTerm?.length === 0
      ? debouncedSearchTerm
      : null;

  const { data: ProductData, isLoading: ProductDataLoading } =
    useGetInventoryQuery({
      params: {
        id: business_id,
        search: searchTerm,
        page,
        limit: 15,
      },
      enabled: !!business_id,
      staleTime: 1000 * 60 * 5, // 5 minutes
    });

  useEffect(() => {
    if (userSubData) {
      setIsSubscribed(userSubData);
    }
    console.log("userSubData", userSubData);
  }, [userSubData]);
  return {
    ProductData,
    ProductDataLoading: ProductDataLoading || userSubDataLoading,
    page,
    setPage,
  };
};

import { useGetInventoryQuery } from "@/api/inventory/fetch-inventory";
import { useBusinessStore } from "@/lib/store/useBusinessStore";
import { useState } from "react";
import { useDebounce } from "./useDebounce";
export const usePosHook = ({ searchInput }: { searchInput?: string }) => {
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

  return {
    ProductData,
    ProductDataLoading: ProductDataLoading,
    page,
    setPage,
  };
};

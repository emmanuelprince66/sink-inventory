"use client";

import { useGetCustomerQuery } from "@/api/customer/useGetCustomerQuery";
import { useBusinessStore } from "@/lib/store/useBusinessStore";
import { useDebounce } from "@/hooks/useDebounce";

export const useCustomerOptions = (search: string, page: number) => {
  const businessId = useBusinessStore((state) => state.business_id);
  const debouncedSearch = useDebounce(search, 500);
  const searchTerm =
    debouncedSearch.length >= 3 || debouncedSearch.length === 0
      ? debouncedSearch
      : "";

  const {
    data,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useGetCustomerQuery({
    params: {
      id: businessId ?? "",
      search: searchTerm,
      page,
      limit: 20,
    },
    enabled: Boolean(businessId),
    staleTime: 1000 * 60 * 5,
  });

  return {
    customers: data?.data?.results?.data ?? [],
    totalPages: data?.data?.pages ?? 1,
    isLoading: isLoading || isFetching,
    error,
    refetch,
    hasBusiness: Boolean(businessId),
  };
};

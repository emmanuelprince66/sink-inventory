"use client";

import { useGetCustomerQuery } from "@/api/customer/useGetCustomerQuery";
import { useBusinessStore } from "@/lib/store/useBusinessStore";
import { useDebounce } from "@/hooks/useDebounce";
import {
  paginate,
  searchCustomers,
} from "@/lib/offline/offlineCache";
import { usePosOffline } from "@/lib/offline/offlineMode";
import { useCachedList } from "./useOfflineCache";
import { useMemo } from "react";

const PAGE_SIZE = 20;

/**
 * `savedWhenOffline`: while the POS is offline, search the customers saved on
 * this device instead of the server. Only the till asks for this, so screens
 * sharing the customer drawer keep their behaviour.
 */
export const useCustomerOptions = (
  search: string,
  page: number,
  { savedWhenOffline = false }: { savedWhenOffline?: boolean } = {},
) => {
  const posOffline = usePosOffline();
  const useSaved = savedWhenOffline && posOffline;
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
      limit: PAGE_SIZE,
    },
    enabled: Boolean(businessId) && !useSaved,
    staleTime: 1000 * 60 * 5,
  });

  const saved = useCachedList("customers", useSaved);
  const savedPage = useMemo(() => {
    const term = debouncedSearch.trim();
    return paginate(
      term ? searchCustomers(saved.items, term) : saved.items,
      page,
      PAGE_SIZE,
    );
  }, [saved.items, debouncedSearch, page]);

  if (useSaved) {
    return {
      customers: savedPage.rows,
      totalPages: savedPage.pages,
      isLoading: saved.loading,
      error: null,
      refetch,
      hasBusiness: Boolean(businessId),
      /** Reading the saved list, and nothing has been saved yet. */
      savedListEmpty: !saved.loading && saved.items.length === 0,
      usingSavedList: true,
    };
  }

  return {
    savedListEmpty: false,
    usingSavedList: false,
    customers: data?.data?.results?.data ?? [],
    totalPages: data?.data?.pages ?? 1,
    isLoading: isLoading || isFetching,
    error,
    refetch,
    hasBusiness: Boolean(businessId),
  };
};

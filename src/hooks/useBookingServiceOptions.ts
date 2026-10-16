"use client";

import {
  BookingServiceRecord,
  getServiceRecords,
  useServiceCatalogueQuery,
} from "@/api/bookings/service-bookings";
import { useBusinessStore } from "@/lib/store/useBusinessStore";
import { useDebounce } from "@/hooks/useDebounce";
import { useMemo } from "react";
import { useState } from "react";

export type BookingServiceOption = BookingServiceRecord;

export const useBookingServiceOptions = () => {
  const businessId = useBusinessStore((state) => state.business_id);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebounce(search, 400);
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
  } = useServiceCatalogueQuery(businessId ?? "", {
    staleTime: 1000 * 60,
  });
  const allServices = useMemo(() => getServiceRecords(data), [data]);
  const matchingServices = useMemo(
    () =>
      allServices
        .filter((service) => service.is_active)
        .filter((service) =>
          service.name.toLowerCase().includes(searchTerm.toLowerCase()),
        ),
    [allServices, searchTerm],
  );
  const totalPages = Math.max(1, Math.ceil(matchingServices.length / 20));

  return {
    services: matchingServices.slice((page - 1) * 20, page * 20),
    page,
    setPage,
    search,
    setSearch: (value: string) => {
      setSearch(value);
      setPage(1);
    },
    totalPages,
    total: matchingServices.length,
    isLoading: isLoading || isFetching,
    error,
    refetch,
    hasBusiness: Boolean(businessId),
  };
};

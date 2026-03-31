// hooks/useProductionHistory.ts
import { useAcceptProductMutation } from "@/api/inventory/accept-product";
import { useFetchProductionHistoryQuery } from "@/api/inventory/fetch-production-history";
import { useBusinessStore } from "@/lib/store/useBusinessStore";
import { useState } from "react";
import { DateRange } from "react-day-picker";
import { useToast } from "./toast/useToast";
import { useDebounce } from "./useDebounce";

export const useProductionHistory = () => {
  const business_id = useBusinessStore((state) => state.business_id);
  const { showToast } = useToast();

  // Filter states
  const [searchInput, setSearchInput] = useState("");
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [statusFilter, setStatusFilter] = useState("");
  const [appliedFilters, setAppliedFilters] = useState({
    search: "",
    dateRange: undefined as DateRange | undefined,
    status: "",
  });

  // Pagination state
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const debouncedSearchTerm = useDebounce(searchInput, 500);

  const searchTerm =
    !debouncedSearchTerm || debouncedSearchTerm.length === 0
      ? undefined
      : debouncedSearchTerm.length >= 3
        ? debouncedSearchTerm
        : undefined;

  const { data, isLoading, error, refetch, isFetching } =
    useFetchProductionHistoryQuery({
      params: {
        id: business_id || "",
        search: appliedFilters.search,
        status:
          appliedFilters.status === "all" ? undefined : appliedFilters.status,
        start_date: appliedFilters.dateRange?.from?.toISOString(),
        end_date: appliedFilters.dateRange?.to?.toISOString(),
      },
      enabled: !!business_id,
    });

  // Accept product mutation
  const { mutate: acceptProductMutation, isPending: isAccepting } =
    useAcceptProductMutation({
      onSuccess: (data) => {
        console.log("Product accepted:", data);
        showToast(data.message || "Product accepted successfully", "success");
        refetch();
      },
    });

  // Apply filters
  const handleApplyFilters = () => {
    setAppliedFilters({
      search: searchTerm || "",
      dateRange,
      status: statusFilter === "all" ? "" : statusFilter,
    });
    setPage(1);
  };

  // Reset filters
  const handleResetFilters = () => {
    setSearchInput("");
    setDateRange(undefined);
    setStatusFilter("");
    setAppliedFilters({
      search: "",
      dateRange: undefined,
      status: "",
    });
    setPage(1);
  };

  // Quick remove individual filter
  const removeFilter = (type: "search" | "date" | "status") => {
    if (type === "search") setSearchInput("");
    if (type === "date") setDateRange(undefined);
    if (type === "status") setStatusFilter("");

    setTimeout(handleApplyFilters, 0);
  };

  // Check if any filters are active
  const activeFiltersCount = [
    searchInput,
    dateRange?.from,
    statusFilter && statusFilter !== "all",
  ].filter(Boolean).length;

  const hasActiveFilters = activeFiltersCount > 0;

  // Handle receive product
  const handleReceiveProduct = (move_id: string) => {
    acceptProductMutation({ move_id }); // payload is optional
  };

  return {
    // Data
    data,
    isLoading,
    error,
    isFetching,
    refetch,

    // Filter states
    searchInput,
    setSearchInput,
    dateRange,
    setDateRange,
    statusFilter,
    setStatusFilter,
    appliedFilters,

    // Pagination
    page,
    setPage,
    pageSize,
    setPageSize,

    // Actions
    handleApplyFilters,
    handleResetFilters,
    removeFilter,
    activeFiltersCount,
    hasActiveFilters,
    handleReceiveProduct,
    isAccepting,
  };
};

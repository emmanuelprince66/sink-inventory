import { useState } from "react";

import moment from "moment"; // Import Moment.js
import { DateRange } from "react-day-picker";

import { useFetchOrderHistoryQuery } from "@/api/sales/fetch-order-history";
import { useFetchSalesHistoryQuery } from "@/api/sales/fetch-sales";
import { useBusinessStore } from "@/lib/store/useBusinessStore";


import { useDebounce } from "./useDebounce";

export const useSalesHook = () => {
  const business_id = useBusinessStore((state) => state.business_id);
  const [searchInput, setSearchInput] = useState("");

  // Set default dateRange to today
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(),
    to: new Date(),
  });

  console.log("dateRange", dateRange);
  const debouncedSearchTerm = useDebounce(searchInput, 500);

  const filterOptions = [
    "All",
    "Fast Moving",
    "Most Profitable",
    "Top Selling",
  ] as const;
  const filterOptionsTwo = [
    "All",
    "Completed",
    "Pending",
    "Cancelled",
  ] as const;

  const handleSearchChange = (value: string) => {
    setSearchInput(value);
  };

  const filterMapping = {
    All: "",
    "Fast Moving": "FAST_MOVING",
    "Most Profitable": "MOST_PROFITABLE",
    "Top Selling": "TOP_SELLING",
  } as const;
  const filterMappingTwo = {
    All: "",
    Completed: "COMPLETED",
    Pending: "PENDING",
    Cancelled: "CANCELLED",
  } as const;

  const [activeFilter, setActiveFilter] = useState<
    (typeof filterOptions)[number]
  >(filterOptions[0]);
  const [activeFilterTwo, setActiveFilterTwo] = useState<
    (typeof filterOptionsTwo)[number]
  >(filterOptionsTwo[0]);

  const searchTerm =
    debouncedSearchTerm.length >= 3 || debouncedSearchTerm.length === 0
      ? debouncedSearchTerm
      : null;

  const {
    data: SalesData,
    isLoading: SalesLoading,
    error: SalesError,
  } = useFetchSalesHistoryQuery({
    params: {
      id: business_id,
      search: searchTerm,
      status: filterMapping[activeFilter],
      start_date: dateRange?.from
        ? moment(dateRange.from).format("YYYY-MM-DD")
        : undefined,
      end_date: dateRange?.to
        ? moment(dateRange.to).format("YYYY-MM-DD")
        : undefined,
    },
    enabled: !!business_id,
  });
  const { data: SalesOrderData, isLoading: SalesOrderLoading } =
    useFetchOrderHistoryQuery({
      params: {
        id: business_id,
        search: searchTerm,
        status: filterMappingTwo[activeFilterTwo],
        start_date: dateRange?.from
          ? moment(dateRange.from).format("YYYY-MM-DD")
          : undefined,
        end_date: dateRange?.to
          ? moment(dateRange.to).format("YYYY-MM-DD")
          : undefined,
      },
      enabled: !!business_id,
    });

  console.log("SalesOrderData in hook", SalesOrderData);

  return {
    SalesData,
    SalesLoading,
    SalesError, // Expose error for handling in components
    searchInput,
    setSearchInput,
    activeFilter,
    activeFilterTwo,
    SalesOrderLoading,
    setActiveFilter,
    setActiveFilterTwo,
    SalesOrderData,
    filterOptions,
    filterOptionsTwo,
    handleSearchChange,
    dateRange,
    setDateRange,
  };
};

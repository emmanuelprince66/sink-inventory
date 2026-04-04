import {
  ProductHistoryType,
  useFetchProductHistoryQuery,
} from "@/api/products/fetch-product-history";
import { useFetchDepartmentsQuery } from "@/api/products/fetch-departments";
import { useBusinessStore } from "@/lib/store/useBusinessStore";
import { useState } from "react";
import { DateRange } from "react-day-picker";
import moment from "moment";

export type ProductHistoryTab = "WASTE" | "RETURN" | "DAMAGE";

export const PRODUCT_HISTORY_TABS: {
  label: string;
  value: ProductHistoryTab;
}[] = [
  { label: "Waste History", value: "WASTE" },
  { label: "Return History", value: "RETURN" },
  { label: "Damaged History", value: "DAMAGE" },
];

export const useProductHistoryHook = () => {
  const business_id = useBusinessStore((state) => state.business_id);
  const [activeTab, setActiveTab] = useState<ProductHistoryTab>("WASTE");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [appliedDateRange, setAppliedDateRange] = useState<
    DateRange | undefined
  >();
  const [departmentFilter, setDepartmentFilter] = useState("");
  const [appliedDepartment, setAppliedDepartment] = useState("");

  const {
    data: DepartmentData,
    isLoading: DepartmentDataLoading,
  } = useFetchDepartmentsQuery(business_id, {
    enabled: !!business_id,
    staleTime: 1000 * 60 * 5,
  });

  const { data, isLoading, isFetching, error, refetch } =
    useFetchProductHistoryQuery({
      params: {
        id: business_id || "",
        type: activeTab as ProductHistoryType,
        page,
        limit: pageSize,
        start_date: appliedDateRange?.from
          ? moment(appliedDateRange.from).format("YYYY-MM-DD")
          : undefined,
        end_date: appliedDateRange?.to
          ? moment(appliedDateRange.to).format("YYYY-MM-DD")
          : undefined,
        department: appliedDepartment || undefined,
      },
      enabled: !!business_id,
    });

  const results = data?.data?.results?.data || [];
  const total = data?.data?.results?.count || 0;
  const totalValue = data?.data?.results?.value || 0;
  const totalPages = data?.data?.pages || 1;

  const handleTabChange = (tab: ProductHistoryTab) => {
    setActiveTab(tab);
    setPage(1);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize);
    setPage(1);
  };

  const handleApplyFilters = () => {
    setAppliedDateRange(dateRange);
    setAppliedDepartment(departmentFilter);
    setPage(1);
  };

  const handleResetFilters = () => {
    setDateRange(undefined);
    setAppliedDateRange(undefined);
    setDepartmentFilter("");
    setAppliedDepartment("");
    setPage(1);
  };

  return {
    activeTab,
    setActiveTab: handleTabChange,
    results,
    total,
    totalPages,
    totalValue,
    isLoading,
    isFetching,
    error,
    refetch,
    page,
    pageSize,
    handlePageChange,
    handlePageSizeChange,
    dateRange,
    setDateRange,
    appliedDateRange,
    departmentFilter,
    setDepartmentFilter,
    DepartmentData,
    DepartmentDataLoading,
    handleApplyFilters,
    handleResetFilters,
  };
};

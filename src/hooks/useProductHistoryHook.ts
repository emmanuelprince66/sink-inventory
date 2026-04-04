import {
  ProductHistoryType,
  useFetchProductHistoryQuery,
} from "@/api/products/fetch-product-history";
import { useBusinessStore } from "@/lib/store/useBusinessStore";
import { useState } from "react";

export type ProductHistoryTab = "WASTE" | "RETURN" | "DAMAGED";

export const PRODUCT_HISTORY_TABS: {
  label: string;
  value: ProductHistoryTab;
}[] = [
  { label: "Waste History", value: "WASTE" },
  { label: "Return History", value: "RETURN" },
  { label: "Damaged History", value: "DAMAGED" },
];

export const useProductHistoryHook = () => {
  const business_id = useBusinessStore((state) => state.business_id);
  const [activeTab, setActiveTab] = useState<ProductHistoryTab>("WASTE");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const { data, isLoading, isFetching, error, refetch } =
    useFetchProductHistoryQuery({
      params: {
        id: business_id || "",
        type: activeTab as ProductHistoryType,
        page,
        limit: pageSize,
      },
      enabled: !!business_id,
    });

  const results = data?.data?.results || [];
  const total = data?.data?.total || 0;
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

  return {
    activeTab,
    setActiveTab: handleTabChange,
    results,
    total,
    totalPages,
    isLoading,
    isFetching,
    error,
    refetch,
    page,
    pageSize,
    handlePageChange,
    handlePageSizeChange,
  };
};

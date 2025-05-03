import { useGetCategoriesQuery } from "@/api/category/fetch-categories";
import { useGetInventoryQuery } from "@/api/inventory/fetch-inventory";
import { useBusinessStore } from "@/lib/store/useBusinessStore";
import { useState } from "react";
import { useDebounce } from "./useDebounce";
export const useInventoryHook = () => {
  const business_id = useBusinessStore((state) => state.business_id);
  const [searchInput, setSearchInput] = useState("");

  const debouncedSearchTerm = useDebounce(searchInput, 500); // 500ms debounce

  const searchTerm =
    debouncedSearchTerm.length >= 3 || debouncedSearchTerm.length === 0
      ? debouncedSearchTerm
      : null;

  const { data: InventoryData, isLoading: InventoryDataLoading } =
    useGetInventoryQuery({
      params: {
        id: business_id,
        search: searchTerm,
      },
      enabled: !!business_id,
      staleTime: 1000 * 60 * 5, // 5 minutes
    });

  const { data: CategoriesData, isLoading: CategoriesDataLoading } =
    useGetCategoriesQuery({
      params: {
        id: business_id,
        type: "PRODUCT",
      },
      enabled: !!business_id,
      staleTime: 1000 * 60 * 5, // 5 minutes
    });

  console.log("InventoryData", InventoryData);
  console.log("CategoriesData", CategoriesData);

  return {
    InventoryData,
    CategoriesData,
    InventoryDataLoading,
    CategoriesDataLoading,
  };
};

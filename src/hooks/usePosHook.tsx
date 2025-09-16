import { useGetInventoryQuery } from "@/api/inventory/fetch-inventory";
import { useBusinessStore } from "@/lib/store/useBusinessStore";
import { useUserRole } from "@/lib/store/user-store";
import { useState } from "react";
import { useDebounce } from "./useDebounce";
import { useSSENotifications } from "./useWebSocketNotification";

export const usePosHook = ({ searchInput }: { searchInput?: string }) => {
  const business_id = useBusinessStore((state) => state.business_id);
  const debouncedSearchTerm = useDebounce(searchInput || "", 500);
  const [page, setPage] = useState(1);
  const { user } = useUserRole();
  console.log("user", user);

  const { notifications, isConnected, clearNotifications, connectionAttempts } =
    useSSENotifications(
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzU4MzU0ODcxLCJpYXQiOjE3NTc5MjI4NzEsImp0aSI6Ijg1YmNiNzAyZmFmNzQ1MmRhNmIwOTcwMWFkNGE4NGY1IiwidXNlcl9pZCI6IjY4OGU1OWEzLTFiNTAtNDM3My1hZTEyLWI1MzRkYzNjZWUwYyIsImxvZ2luX3RzIjoiMTc1NzkyMjg3MS4yNDI5NjQifQ.2fHk7xqbCH97SENymevnNBrcfNI_Eesyk3vL47lG8ZU"
    );

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
        limit: 20,
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

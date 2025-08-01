import { useGetInventoryQuery } from "@/api/inventory/fetch-inventory";
import { useBusinessStore } from "@/lib/store/useBusinessStore";

export const useOrdersHook = ({
  page,
  id,
  searchInput,
}: {
  page?: number;
  searchInput?: string;
  id?: string;
}) => {
  const business_id = useBusinessStore((state) => state.business_id);

  const {
    data: InventoryData,
    isLoading: InventoryDataLoading,
    refetch: refetchInventory,
    isRefetching: isRefetchingInventory,
  } = useGetInventoryQuery({
    params: {
      page,
      limit: 20,
      id: business_id,
      search: searchInput,
    },
    enabled: !!business_id,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  return {
    InventoryData,
    InventoryDataLoading: InventoryDataLoading || isRefetchingInventory,
    refetchInventory,
  };
};

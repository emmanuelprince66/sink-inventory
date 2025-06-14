import { useFetchSalesDashboardQuery } from "@/api/sales/fetch-sales-dashboard";
import { useBusinessStore } from "@/lib/store/useBusinessStore";

export const useOverviewHook = () => {
  const business_id = useBusinessStore((state) => state.business_id);

  const { data: SalesDashboardData, isLoading: SalesDashboardLoading } =
    useFetchSalesDashboardQuery(business_id, { enabled: !!business_id });

  console.log("SalesDashboardData", SalesDashboardData);
  return { SalesDashboardData, SalesDashboardLoading };
};

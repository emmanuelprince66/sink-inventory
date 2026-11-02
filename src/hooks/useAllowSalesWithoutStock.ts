"use client";

import { useFetchBusinessById } from "@/api/business/get-business-by-id";
import { useBusinessStore } from "@/lib/store/useBusinessStore";
import { allowsSalesWithoutStock } from "@/utils/stock";

/** The active business's "sell without stock" setting. Reads the shared
 * business query, so it's free wherever the POS has already fetched it. */
export const useAllowSalesWithoutStock = (): boolean => {
  const businessId = useBusinessStore((state) => state.business_id);
  const { data } = useFetchBusinessById(businessId, {
    enabled: Boolean(businessId),
  });
  return allowsSalesWithoutStock(data?.data);
};

"use client";

import { useFetchBusinessById } from "@/api/business/get-business-by-id";
import { useBusinessStore } from "@/lib/store/useBusinessStore";
import { allowsSalesWithoutStock } from "@/utils/stock";
import { useEffect } from "react";

const storageKey = (businessId: string) =>
  `pos:allow-sales-without-stock:${businessId}`;

const readLastKnown = (businessId: string | null): boolean => {
  if (!businessId) return false;
  try {
    return localStorage.getItem(storageKey(businessId)) === "true";
  } catch {
    return false;
  }
};

/**
 * The active business's "sell without stock" setting. Reads the shared
 * business query, so it's free wherever the POS has already fetched it.
 *
 * A till that opens with no connection can't load the business, which used to
 * read as "off" and grey out everything with no stock. So the last value seen
 * for this business is kept on the device and used only while the business
 * data is unavailable. The fresh value always wins.
 */
export const useAllowSalesWithoutStock = (): boolean => {
  const businessId = useBusinessStore((state) => state.business_id);
  const { data } = useFetchBusinessById(businessId, {
    enabled: Boolean(businessId),
  });

  const business = data?.data;
  const fresh =
    business?.allow_sales_without_stock != null
      ? allowsSalesWithoutStock(business)
      : null;

  useEffect(() => {
    if (!businessId || fresh == null) return;
    try {
      localStorage.setItem(storageKey(businessId), String(fresh));
    } catch {
      // Storage blocked: the setting just won't survive a failed load.
    }
  }, [businessId, fresh]);

  return fresh ?? readLastKnown(businessId);
};

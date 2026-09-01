"use client";

import { useFetchBusinessById } from "@/api/business/get-business-by-id";
import { useBusinessDataStore } from "@/lib/store/useBusinessDataStore";
import { useBusinessStore } from "@/lib/store/useBusinessStore";
import { useEffect } from "react";

/**
 * Keeps the persisted business snapshot in step with the server.
 *
 * `useBusinessDataStore` is written exactly once — from the row the user
 * clicked on the business list — and then persisted to localStorage. Every
 * money figure in the app formats itself from that snapshot's `currency`, via
 * `formatToNaira` / `getCurrencySymbol`, so the snapshot going stale is not a
 * cosmetic problem: a currency corrected after the business was selected never
 * reaches the screen, and the whole dashboard keeps printing the old symbol
 * until someone happens to pick that business again. That is how an NGN
 * business ends up showing dollars.
 *
 * Mounted in the dashboard shell so the refresh happens on every screen rather
 * than only on the ones that already fetch a business for their own reasons.
 */
const BusinessDataSync = () => {
  const business_id = useBusinessStore((state) => state.business_id);
  const setBusinessData = useBusinessDataStore((state) => state.setBusinessData);

  const { data } = useFetchBusinessById(business_id, {
    enabled: Boolean(business_id),
  } as any);

  const fresh = data?.data;

  useEffect(() => {
    // Only ever the business in scope. This query is shared, so a response for
    // some other business must not land in the snapshot — it would reformat
    // the entire dashboard in someone else's currency.
    if (!fresh?.id || !business_id || fresh.id !== business_id) return;

    // Merged rather than replaced: the list row this snapshot started as may
    // carry a field the detail payload does not, and a consumer reading it
    // should not lose it to a refresh. Read through getState so the merge does
    // not have to subscribe to the value it is writing.
    const previous = useBusinessDataStore.getState().businessData;
    setBusinessData(
      previous?.id === fresh.id ? { ...previous, ...fresh } : fresh,
    );
  }, [fresh, business_id, setBusinessData]);

  return null;
};

export default BusinessDataSync;

"use client";

import {
  useFetchReferralOverviewQuery,
  useFetchReferralProgrammesQuery,
} from "@/api/customer-referral";
import { queryKey } from "@/constants/query-key";
import { useToast } from "@/hooks/toast/useToast";
import { useQueryClient } from "@/lib/react-query";
import { useBusinessStore } from "@/lib/store/useBusinessStore";
import { toList } from "@/types/api";
import type { CustomerReferralProgramme } from "@/types/customerReferral";
import { useCallback, useMemo, useState } from "react";

/** Managing a programme is its own page, so the only overlay left is create. */
export type ReferralView = { kind: "none" } | { kind: "create" };

export const useCustomerReferrals = () => {
  const business_id = useBusinessStore((state) => state.business_id);
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  const [view, setView] = useState<ReferralView>({ kind: "none" });

  const { data: overviewRes, isLoading: overviewLoading } =
    useFetchReferralOverviewQuery({ params: { business_id: business_id ?? "" } });

  const { data: programmesRes, isLoading: programmesLoading } =
    useFetchReferralProgrammesQuery({
      params: { business_id: business_id ?? "" },
    });

  // The list endpoint is documented as a bare array but is paginated in
  // practice, so normalise either shape.
  const programmes = useMemo(
    () => toList<CustomerReferralProgramme>(programmesRes?.data as any),
    [programmesRes],
  );

  /** Both the list and the counters go stale after any write. */
  const refresh = useCallback(() => {
    queryClient.invalidateQueries({
      queryKey: [queryKey.customerReferral.getProgrammes],
    });
    queryClient.invalidateQueries({
      queryKey: [queryKey.customerReferral.getOverview],
    });
  }, [queryClient]);

  const copyLink = useCallback(
    (link?: string | null) => {
      if (!link) return showToast("This participant has no link yet", "error");
      navigator.clipboard
        .writeText(link)
        .then(() => showToast("Referral link copied", "success"))
        .catch(() => showToast("Could not copy the link", "error"));
    },
    [showToast],
  );

  return {
    business_id: business_id ?? "",
    overview: overviewRes?.data,
    overviewLoading,
    programmes,
    programmesLoading,
    view,
    setView,
    closeView: useCallback(() => setView({ kind: "none" }), []),
    refresh,
    copyLink,
  };
};

export type CustomerReferralsApi = ReturnType<typeof useCustomerReferrals>;

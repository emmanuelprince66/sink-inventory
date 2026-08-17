"use client";

import { useFetchCustomerById } from "@/api/customer/fetch-customer-by-id";
import { useFormatMoney } from "@/utils/formatMoney";
import { useState } from "react";
import type { CustomerDetail } from "../../customerDetail";
import type { ProfileTab } from "./primitives";

/**
 * The customer detail payload, unpacked into the sections the tabs render,
 * plus the currency symbol the compact header tiles need.
 */
export const useCustomerProfile = (id: string) => {
  const formatMoney = useFormatMoney();
  const [tab, setTab] = useState<ProfileTab>("Overview");

  const { data, isLoading } = useFetchCustomerById(id);
  const detail: CustomerDetail | undefined = data?.data ?? data;

  // formatMoney has no symbol-only mode, so read it off a formatted zero.
  const symbol = formatMoney(0).replace(/[\d.,\s]/g, "") || "₦";

  const engagement = detail?.engagement_metrics;
  const loyalty = detail?.loyalty_rewards;
  const row = detail?.data;

  const journey = [
    {
      label: "Customer Registered",
      iso: detail?.customer_journey?.customer_registered,
      tone: "bg-emerald-100 text-emerald-600",
    },
    {
      label: "First Purchase",
      iso: detail?.customer_journey?.first_purchase,
      tone: "bg-sky-100 text-sky-600",
    },
    {
      label: "Joined Loyalty",
      iso: detail?.customer_journey?.joined_loyalty,
      tone: "bg-amber-100 text-amber-600",
    },
    {
      label: "Reward Earned",
      iso: detail?.customer_journey?.reward_earned,
      tone: "bg-violet-100 text-violet-600",
    },
    {
      label: "Latest Purchase",
      iso: detail?.customer_journey?.latest_purchase,
      tone: "bg-emerald-100 text-emerald-600",
    },
  ];

  return {
    isLoading,
    detail,
    tab,
    setTab,
    formatMoney,
    symbol,
    journey,
    identity: detail?.identity,
    purchase: detail?.purchase_behaviour,
    loyalty,
    engagement,
    shopping: detail?.shopping_behaviour,
    financial: detail?.financial_details,
    row,
    // The list row and the detail sections disagree on these two, and the
    // richer section wins where it has a value.
    risk: engagement?.churn_risk ?? row?.risk_level ?? "Low",
    tier: loyalty?.loyalty_tier ?? row?.tier_name,
  };
};

export type CustomerProfileData = ReturnType<typeof useCustomerProfile>;

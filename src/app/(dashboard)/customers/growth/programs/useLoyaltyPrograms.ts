"use client";

import { useFetchLoyaltyDashboardQuery } from "@/api/loyalty/fetch-loyalty-dashboard";
import { fetchLoyaltyProgramDetail } from "@/api/loyalty/fetch-loyalty-program-detail";
import { useFetchLoyaltyProgramsQuery } from "@/api/loyalty/fetch-loyalty-programs";
import { useToast } from "@/hooks/toast/useToast";
import { useBusinessStore } from "@/lib/store/useBusinessStore";
import { toList, type Paginated } from "@/types/api";
import type { LoyaltyProgram, TopStreakPerformer } from "@/types/loyalty";
import { loyaltyJoinUrlForThisBrowser } from "@/utils/loyaltyJoinUrl";
import { useCallback, useMemo, useState } from "react";
import { LOYALTY_CAMPAIGNS } from "../dummyGrowthData";

export type ModalView =
  | "edit"
  | "qr"
  | "participants"
  | "tiers"
  | "members"
  | "pos"
  | null;

/** Sample cards, shown only when the business has no campaigns at all. */
const sampleCampaigns = (): LoyaltyProgram[] =>
  LOYALTY_CAMPAIGNS.map((c) => ({
    id: c.key,
    name: c.name,
    start_date: "",
    reward_type: "PERCENTAGE" as const,
    status: c.status === "Active" ? ("ACTIVE" as const) : ("PAUSED" as const),
    trigger_summary: c.triggerLabel,
    reward_summary: c.rewardLabel,
    enrolled_count: String(c.participants),
    active_count: String(Math.round(c.participants * 0.73)),
    completed_members_count: String(c.completions),
    completion_rate: c.completionRate.replace("%", ""),
    completions_count: String(c.completions),
    cancelled_rewards_count: "3",
    total_rewards_given_out_value: String(c.completions * 2000),
    retention_rate: "72",
  }));

/**
 * Data and interaction state for the Loyalty Programs tab: the dashboard
 * counters, the campaign list, which overlay is open, and resolving a
 * campaign's public landing page on demand.
 */
export const useLoyaltyPrograms = () => {
  const business_id = useBusinessStore((state) => state.business_id);
  const { showToast } = useToast();

  const [modalView, setModalView] = useState<ModalView>(null);
  const [selected, setSelected] = useState<LoyaltyProgram | null>(null);
  // Which card is currently resolving its join token, so only that button
  // shows a spinner.
  const [landingPageFor, setLandingPageFor] = useState<string | null>(null);

  const { data: dashboardRes, isLoading: dashboardLoading } =
    useFetchLoyaltyDashboardQuery({ params: { id: business_id ?? "" } });
  const { data: programsRes } = useFetchLoyaltyProgramsQuery({
    params: { id: business_id ?? "" },
  });

  const dashboard = dashboardRes?.data;

  // The live endpoint returns a paginated envelope ({ results, total, ... }),
  // not the single object the spec advertises — normalise whatever comes back.
  const programs = useMemo(
    () =>
      toList<LoyaltyProgram>(
        programsRes?.data as unknown as Paginated<LoyaltyProgram>,
      ),
    [programsRes],
  );

  const campaigns = useMemo(
    () => (programs.length ? programs : sampleCampaigns()),
    [programs],
  );

  // Live only — the endpoint populates top_streak_performers now, so there is
  // no sample fallback. Loading shows a skeleton, an empty result shows the
  // empty state inside the marquee.
  const streakPerformers: TopStreakPerformer[] =
    dashboard?.top_streak_performers ?? [];

  const openModal = useCallback(
    (view: ModalView, program: LoyaltyProgram | null = null) => {
      setSelected(program);
      setModalView(view);
    },
    [],
  );

  const closeModal = useCallback(() => {
    setModalView(null);
    setSelected(null);
  }, []);

  // The campaign list carries no join token, so fetch the detail on demand and
  // open the customer-facing page it points at.
  const openLandingPage = useCallback(
    async (program: LoyaltyProgram) => {
      if (!program.id) return;
      setLandingPageFor(program.id);
      try {
        const response = await fetchLoyaltyProgramDetail({
          programId: program.id,
        });
        const token = response?.data?.qr_details?.token;
        if (!token) {
          showToast("This campaign has no landing page yet", "error");
          return;
        }
        // Opened by the merchant in this browser, so keep the current origin —
        // a local dev server must still be previewable.
        window.open(
          loyaltyJoinUrlForThisBrowser(token),
          "_blank",
          "noopener,noreferrer",
        );
      } catch {
        showToast("Could not open the landing page", "error");
      } finally {
        setLandingPageFor(null);
      }
    },
    [showToast],
  );

  return {
    dashboard,
    dashboardLoading,
    campaigns,
    streakPerformers,
    modalView,
    selected,
    openModal,
    closeModal,
    landingPageFor,
    openLandingPage,
  };
};

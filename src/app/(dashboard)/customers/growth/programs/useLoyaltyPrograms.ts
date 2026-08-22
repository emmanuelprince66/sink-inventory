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

export type ModalView =
  | "edit"
  | "qr"
  | "participants"
  | "tiers"
  | "members"
  | "pos"
  | null;

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
  const { data: programsRes, isLoading: programsLoading } =
    useFetchLoyaltyProgramsQuery({ params: { id: business_id ?? "" } });

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

  // Live only. A business with no campaigns gets the empty state, not three
  // invented ones — sample cards here read as real programmes someone could
  // click into, and their Edit and QR actions pointed at ids that do not exist.
  const campaigns = programs;

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
    programsLoading,
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

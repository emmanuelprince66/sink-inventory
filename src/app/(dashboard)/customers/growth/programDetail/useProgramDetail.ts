"use client";

import { useFetchLoyaltyProgramDetailQuery } from "@/api/loyalty/fetch-loyalty-program-detail";
import { useToast } from "@/hooks/toast/useToast";
import type { LoyaltyProgram } from "@/types/loyalty";
import { loyaltyJoinUrl } from "@/utils/loyaltyJoinUrl";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { DetailTab, ParticipantFilter } from "./primitives";

/**
 * Detail payload, tab/filter state, and the two side effects the sheet needs:
 * resetting when a different programme is opened, and undoing Radix's body
 * lock if it survives the close.
 */
export const useProgramDetail = (
  program: LoyaltyProgram | null,
  open: boolean,
) => {
  const { showToast } = useToast();
  const [tab, setTab] = useState<DetailTab>("Overview");
  const [filter, setFilter] = useState<ParticipantFilter>("All");

  const programId = program?.id ?? "";
  const { data, isLoading } = useFetchLoyaltyProgramDetailQuery({
    params: { programId },
  });

  // Reset to the first tab whenever a different programme is opened, so the
  // panel never opens showing the previous programme's Report tab.
  useEffect(() => {
    if (open) {
      setTab("Overview");
      setFilter("All");
    }
  }, [open, programId]);

  // Radix locks the page by setting pointer-events:none on <body> while an
  // overlay is open, and restores it on close. With several dialogs mounted
  // alongside this sheet, that restore is unreliable — the style survives the
  // close and the whole page stops accepting clicks, which reads as a freeze.
  // Clearing it ourselves once the sheet is closed is the safety net.
  useEffect(() => {
    if (open) return;
    const id = window.setTimeout(() => {
      if (document.body.style.pointerEvents === "none") {
        document.body.style.pointerEvents = "";
      }
    }, 300);
    return () => window.clearTimeout(id);
  }, [open]);

  const detail = data?.data;
  const qr = detail?.qr_details;
  const participants = useMemo(() => detail?.participants ?? [], [detail]);

  // Fallback target for participants whose own progress_target is missing.
  // Deliberately NOT the programme's condition threshold: on a SPEND
  // programme that value is the naira target (e.g. 50000), and feeding it to
  // the stamp grid rendered 50,000 nodes per row and froze the page.
  const target = Number(participants[0]?.progress_target ?? 0) || 0;

  const filtered = useMemo(
    () =>
      participants.filter((p) => {
        if (filter === "All") return true;
        const status = (p.status ?? "").toUpperCase();
        if (filter === "Active") return status === "ACTIVE";
        if (filter === "Completed")
          return status === "COMPLETED" || status === "REWARDED";
        return status === "AT_RISK" || status === "AT RISK";
      }),
    [participants, filter],
  );

  // Public origin, not the current one: this URL goes into a QR and gets
  // copied to customers, so it must not carry a dev host.
  const joinUrl = qr?.token ? loyaltyJoinUrl(qr.token) : "";

  const copyJoinUrl = useCallback(() => {
    if (!joinUrl) return;
    navigator.clipboard
      .writeText(joinUrl)
      .then(() => showToast("Join link copied", "success"))
      .catch(() => showToast("Could not copy the link", "error"));
  }, [joinUrl, showToast]);

  return {
    isLoading,
    tab,
    setTab,
    filter,
    setFilter,
    overview: detail?.overview,
    report: detail?.reward_cost_report,
    // The reward totals below are denominated in whatever this programme hands
    // out, so every figure in the report needs its reward_type to render.
    programInfo: detail?.program_info,
    qr,
    participants,
    filtered,
    target,
    joinUrl,
    copyJoinUrl,
  };
};

export type ProgramDetailData = ReturnType<typeof useProgramDetail>;

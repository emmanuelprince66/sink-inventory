"use client";

import { useFetchLoyaltyDashboardQuery } from "@/api/loyalty/fetch-loyalty-dashboard";
import { fetchLoyaltyProgramDetail } from "@/api/loyalty/fetch-loyalty-program-detail";
import { useFetchLoyaltyProgramsQuery } from "@/api/loyalty/fetch-loyalty-programs";
import { CustomModal } from "@/components/app/CustomModal";
import { Spinner } from "@/components/app/Spinner";
import { useToast } from "@/hooks/toast/useToast";
import { useBusinessStore } from "@/lib/store/useBusinessStore";
import AddLoyaltyProgram from "./AddLoyaltyProgram";
import LoyaltyMembers from "./LoyaltyMembers";
import LoyaltyTiers from "./LoyaltyTiers";
import PointOfSale from "./PointOfSale";
import ProgramDetailPanel from "./ProgramDetailPanel";
import ProgramQrModal from "./ProgramQrModal";
import DataGapBadge from "@/components/app/DataGapBadge";
import { cn } from "@/lib/utils";
import { toList, type Paginated } from "@/types/api";
import type { LoyaltyProgram, TopStreakPerformer } from "@/types/loyalty";
import { useFormatMoney } from "@/utils/formatMoney";
import {
  Flame,
  Gift,
  Link2,
  Megaphone,
  Plus,
  QrCode,
  Store,
  Ticket,
  Trophy,
  Users,
} from "lucide-react";
// Trophy doubles as the Tiers action icon in the header.
import dynamic from "next/dynamic";
import { useState } from "react";
import { LOYALTY_CAMPAIGNS, STREAK_LEADERS } from "./dummyGrowthData";

// Same dynamic-import pattern Customers.tsx already used for the Campaigns
// tab — kept reachable from here since Loyalty Programs is its closest
// conceptual match in the new nav (see Customers.tsx for the old top-tab).
const Campaign = dynamic(() => import("../../campaign/Campaign"), {
  ssr: false,
  loading: () => (
    <div className="w-full flex justify-center py-16">
      <Spinner className="text-primary-green-300" />
    </div>
  ),
});

// Counts come back as either 2 or "2.00" depending on the field, and rates as
// 33.33 — trim the noise so cards read "2" and "33%" rather than "2.00".
const asNumber = (value: string | number | undefined | null) => {
  const n = Number(value ?? 0);
  return Number.isNaN(n) ? 0 : n;
};

// Rates arrive as 50 or 33.33 — show at most one decimal, no trailing zero.
const asRate = (value: string | number | undefined | null) => {
  const n = asNumber(value);
  return Number.isInteger(n) ? String(n) : n.toFixed(1);
};

// Streaks are shown against a 10-visit target; anything below 5 reads as
// "at risk" and gets the amber bar instead of the green one.
const STREAK_TARGET = 10;

const StreakCard = ({ performer }: { performer: TopStreakPerformer }) => {
  const pct = Math.min(100, (performer.streak_count / STREAK_TARGET) * 100);
  const isStrong = performer.streak_count >= 5;

  return (
    <div className="bg-white/[0.06] border border-white/10 rounded-xl p-3.5">
      <div className="flex items-center gap-2 mb-3">
        <span
          className={cn(
            "w-7 h-7 rounded-full text-white text-[10px] font-bold flex items-center justify-center shrink-0",
            isStrong ? "bg-primary-green-300" : "bg-warning-1",
          )}
        >
          {performer.initials}
        </span>
        <div className="min-w-0">
          <p className="text-sm font-bold text-white truncate">
            {performer.full_name}
          </p>
          {performer.tier && (
            <p className="text-[10px] text-white/50">{performer.tier}</p>
          )}
        </div>
      </div>

      <p className="text-lg font-extrabold text-white flex items-center gap-1">
        {performer.streak_count}
        <Flame className="w-4 h-4 text-warning-1" />
        <span className="text-[11px] font-medium text-white/60 ml-0.5">
          visit streak
        </span>
      </p>

      <div className="h-1.5 rounded-full bg-white/10 overflow-hidden mt-2.5">
        <div
          className={cn(
            "h-full rounded-full",
            isStrong ? "bg-primary-green-300" : "bg-warning-1",
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
};

const CampaignCard = ({
  program,
  onEdit,
  onShowQr,
  onViewParticipants,
  onOpenLandingPage,
  openingLandingPage,
}: {
  program: LoyaltyProgram;
  onEdit: (program: LoyaltyProgram) => void;
  onShowQr: (program: LoyaltyProgram) => void;
  onViewParticipants: (program: LoyaltyProgram) => void;
  onOpenLandingPage: (program: LoyaltyProgram) => void;
  openingLandingPage: boolean;
}) => {
  const formatMoney = useFormatMoney();
  const isActive = (program.status ?? "ACTIVE") === "ACTIVE";
  // Sample rows carry a non-UUID id; only real programmes can be opened.
  const isPersisted = Boolean(program.id && program.id.length > 20);

  // total_rewards_given_out_value is currency for credit-style rewards but a
  // raw percentage for PERCENTAGE campaigns — rendering ₦15 for "15% off"
  // would be wrong, so switch on the reward type.
  const givenOut =
    program.reward_type === "PERCENTAGE"
      ? `${asRate(program.total_rewards_given_out_value)}%`
      : formatMoney(asNumber(program.total_rewards_given_out_value));

  return (
    <div className="bg-white rounded-2xl border border-grey-5 overflow-hidden">
      {/* Title row */}
      <div className="flex items-start justify-between gap-3 p-4 sm:p-5">
        <div className="flex items-start gap-3 min-w-0">
          <div className="w-9 h-9 rounded-lg bg-secondary-6 text-primary-green-300 flex items-center justify-center shrink-0">
            <Ticket className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <h4 className="text-sm font-extrabold text-grey-1 truncate">
              {program.name}
            </h4>
            <p className="text-xs text-grey-3 mt-0.5">
              Trigger:{" "}
              <span className="font-bold text-grey-2">
                {program.trigger_summary ?? "—"}
              </span>{" "}
              · Reward:{" "}
              <span className="font-bold text-grey-2">
                {program.reward_summary ?? "—"}
              </span>
            </p>
          </div>
        </div>
        <span
          className={cn(
            "shrink-0 flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full",
            isActive
              ? "bg-success-2 text-success-1"
              : "bg-grey-6 text-grey-3",
          )}
        >
          <span
            className={cn(
              "w-1.5 h-1.5 rounded-full",
              isActive ? "bg-success-1" : "bg-grey-4",
            )}
          />
          {isActive ? "Active" : "Paused"}
        </span>
      </div>

      {/* Enrolled / Active / Completed / Rate */}
      <div className="grid grid-cols-4 border-y border-grey-5 divide-x divide-grey-5">
        {[
          { value: asNumber(program.enrolled_count), label: "Enrolled" },
          { value: asNumber(program.active_count), label: "Active" },
          {
            value: asNumber(program.completed_members_count),
            label: "Completed",
          },
          { value: `${asRate(program.completion_rate)}%`, label: "Rate" },
        ].map((cell) => (
          <div key={cell.label} className="py-3 text-center">
            <p className="text-base font-extrabold text-grey-1">{cell.value}</p>
            <p className="text-[10px] text-grey-3 mt-0.5">{cell.label}</p>
          </div>
        ))}
      </div>

      {/* Rewards given out */}
      <div className="flex items-center justify-between gap-3 px-4 sm:px-5 py-3 bg-warning-2/50">
        <div className="flex items-center gap-2 min-w-0">
          <Gift className="w-4 h-4 text-warning-1 shrink-0" />
          <div className="min-w-0">
            <p className="text-xs font-bold text-grey-1">
              Total Rewards Given Out
            </p>
            <p className="text-[10px] text-grey-3">
              {asNumber(program.completions_count)} completions ·{" "}
              {asNumber(program.cancelled_rewards_count)} cancelled
            </p>
          </div>
        </div>
        <div className="text-right shrink-0">
          <p className="text-sm font-extrabold text-error-1">{givenOut}</p>
          <p className="text-[10px] text-grey-3">
            Retention: {asRate(program.retention_rate)}%
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between gap-3 p-4 sm:p-5">
        <div className="flex items-center gap-4">
          <button
            onClick={() => onEdit(program)}
            disabled={!isPersisted}
            className="text-xs font-bold text-primary-green-300 hover:text-primary-green-300/80 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Edit
          </button>
          <button
            onClick={() => onShowQr(program)}
            disabled={!isPersisted}
            className="flex items-center gap-1 text-xs font-bold text-grey-2 hover:text-grey-1 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <QrCode className="w-3.5 h-3.5" />
            QR
          </button>
          {/* Deliberately not a link to program.qr_url — that field is the QR
              *image* on S3 (…/loyalty/qrcodes/<id>.png), so linking it opened
              a picture rather than the page. The join URL needs the campaign's
              token, which only the detail endpoint carries, so resolve it on
              click and open the real landing page. */}
          <button
            onClick={() => onOpenLandingPage(program)}
            disabled={!isPersisted || openingLandingPage}
            className="flex items-center gap-1 text-xs font-bold text-grey-2 hover:text-grey-1 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {openingLandingPage ? (
              <Spinner className="w-3.5 h-3.5" />
            ) : (
              <Link2 className="w-3.5 h-3.5" />
            )}
            Landing Page
          </button>
        </div>
        <button
          onClick={() => onViewParticipants(program)}
          disabled={!isPersisted}
          className="px-3.5 py-1.5 rounded-full bg-primary-green-100 text-white text-xs font-bold hover:bg-primary-green-100/90 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
        >
          View Participants
        </button>
      </div>
    </div>
  );
};

type ModalView =
  | "create"
  | "edit"
  | "qr"
  | "participants"
  | "tiers"
  | "members"
  | "pos"
  | null;

const LoyaltyPrograms = () => {
  const [showRealCampaigns, setShowRealCampaigns] = useState(false);
  const [modalView, setModalView] = useState<ModalView>(null);
  const [selected, setSelected] = useState<LoyaltyProgram | null>(null);
  const business_id = useBusinessStore((state) => state.business_id);
  const formatMoney = useFormatMoney();
  const { showToast } = useToast();
  // Which card is currently resolving its join token, so only that button
  // shows a spinner.
  const [landingPageFor, setLandingPageFor] = useState<string | null>(null);

  // The campaign list carries no join token, so fetch the detail on demand and
  // open the customer-facing page it points at.
  const openLandingPage = async (program: LoyaltyProgram) => {
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
      window.open(`/loyalty/join/${token}`, "_blank", "noopener,noreferrer");
    } catch {
      showToast("Could not open the landing page", "error");
    } finally {
      setLandingPageFor(null);
    }
  };

  const closeModal = () => {
    setModalView(null);
    setSelected(null);
  };
  const openEdit = (program: LoyaltyProgram) => {
    setSelected(program);
    setModalView("edit");
  };
  const openQr = (program: LoyaltyProgram) => {
    setSelected(program);
    setModalView("qr");
  };
  const openParticipants = (program: LoyaltyProgram) => {
    setSelected(program);
    setModalView("participants");
  };

  const { data: dashboardRes } = useFetchLoyaltyDashboardQuery({
    params: { id: business_id ?? "" },
  });
  const { data: programsRes } = useFetchLoyaltyProgramsQuery({
    params: { id: business_id ?? "" },
  });

  const dashboard = dashboardRes?.data;

  // The live endpoint returns a paginated envelope ({ results, total, ... }),
  // not the single object the spec advertises — normalise whatever comes back.
  const programs = toList<LoyaltyProgram>(
    programsRes?.data as unknown as Paginated<LoyaltyProgram>,
  );

  // Until the business has live loyalty data, fall back to the sample rows so
  // the tab still reads as designed instead of rendering an empty shell. The
  // flag below is what stops that sample being mistaken for real data.
  const usingSampleStreaks = !dashboard?.top_streak_performers?.length;
  const streakPerformers: TopStreakPerformer[] = !usingSampleStreaks
    ? dashboard!.top_streak_performers!
    : STREAK_LEADERS.map((l, i) => ({
        id: String(i),
        initials: l.initials,
        full_name: l.name,
        tier: l.tier,
        streak_count: l.streak,
      }));

  const campaigns: LoyaltyProgram[] = programs.length
    ? programs
    : LOYALTY_CAMPAIGNS.map((c) => ({
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

  const stats = [
    {
      icon: <Users className="w-4 h-4" />,
      label: "Total Participants",
      value: String(dashboard?.total_participants ?? 95),
      tone: "text-grey-1",
    },
    {
      icon: <Gift className="w-4 h-4" />,
      label: "Total Rewarded",
      value: formatMoney(asNumber(dashboard?.total_rewarded ?? 66000)),
      tone: "text-error-1",
    },
    {
      icon: <Trophy className="w-4 h-4" />,
      label: "Total Completions",
      value: String(dashboard?.total_completions ?? 26),
      tone: "text-primary-green-300",
    },
  ];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <p className="text-sm text-grey-3 max-w-md">
          Build unlimited loyalty campaigns. Reward customers for visits, spend,
          referrals, and more.
        </p>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => {
              setSelected(null);
              setModalView("create");
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-primary-green-100 text-white text-sm font-bold hover:bg-primary-green-100/90 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Create Campaign
          </button>
          <button
            onClick={() => setModalView("tiers")}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-full border border-grey-5 bg-white text-grey-1 text-sm font-bold hover:bg-grey-6 cursor-pointer"
          >
            <Trophy className="w-4 h-4" />
            Tiers
          </button>
          <button
            onClick={() => setModalView("members")}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-full border border-grey-5 bg-white text-grey-1 text-sm font-bold hover:bg-grey-6 cursor-pointer"
          >
            <Users className="w-4 h-4" />
            Members
          </button>
          <button
            onClick={() => setModalView("pos")}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-primary-green-300 text-white text-sm font-bold hover:bg-primary-green-300/90 cursor-pointer"
          >
            <Store className="w-4 h-4" />
            Point of Sale
          </button>
        </div>
      </div>

      {/* Headline stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-white rounded-2xl border border-grey-5 p-4"
          >
            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 rounded-full bg-secondary-6 text-primary-green-300 flex items-center justify-center shrink-0">
                {stat.icon}
              </div>
              <p className="text-xs font-bold text-grey-3">{stat.label}</p>
            </div>
            <p className={cn("text-2xl font-extrabold", stat.tone)}>
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      {/* Loyalty Streak System */}
      <div className="bg-primary-green-100 rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          <Flame className="w-4 h-4 text-warning-1" />
          <h3 className="text-sm font-extrabold text-white">
            Loyalty Streak System
          </h3>
          {/* The dashboard endpoint returns top_streak_performers: [] today, so
              these cards are the designed sample set until it is populated. */}
          {usingSampleStreaks && (
            <DataGapBadge needs="GET /loyalty/{business_id}/dashboard — top_streak_performers returns an empty array; populate it with the top streak holders (name, tier, streak count, progress)" />
          )}
        </div>
        <p className="text-xs text-white/60 mb-4">
          Top streak performers{" "}
          <span className="text-primary-green-300 font-bold">this month</span>
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {streakPerformers.map((performer) => (
            <StreakCard key={performer.id} performer={performer} />
          ))}
        </div>
      </div>

      {/* Campaign cards */}
      <div className="space-y-3">
        {campaigns.map((program) => (
          <CampaignCard
            key={program.id}
            program={program}
            onEdit={openEdit}
            onShowQr={openQr}
            onViewParticipants={openParticipants}
            onOpenLandingPage={openLandingPage}
            openingLandingPage={landingPageFor === program.id}
          />
        ))}
      </div>

      {/* Real marketing campaigns (SMS/email blasts) — kept reachable here */}
      <div className="bg-white rounded-2xl border border-grey-5 overflow-hidden">
        <button
          onClick={() => setShowRealCampaigns((v) => !v)}
          className="w-full flex items-center justify-between gap-3 p-4 sm:p-5 cursor-pointer hover:bg-grey-6/60 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Megaphone className="w-4 h-4 text-primary-green-300" />
            <span className="text-sm font-extrabold text-grey-1">
              Marketing Campaigns (SMS &amp; Email)
            </span>
          </div>
          <span className="text-xs font-bold text-primary-green-300">
            {showRealCampaigns ? "Hide" : "Show"}
          </span>
        </button>
        {showRealCampaigns && (
          <div className="border-t border-grey-5 p-4 sm:p-5">
            <Campaign />
          </div>
        )}
      </div>

      <CustomModal
        isOpen={modalView === "create" || modalView === "edit"}
        onClose={closeModal}
        trigger={false}
        title={modalView === "edit" ? "Edit Campaign" : "Create Campaign"}
      >
        <div className="w-full">
          <AddLoyaltyProgram closeModal={closeModal} editData={selected} />
        </div>
      </CustomModal>

      <CustomModal
        isOpen={modalView === "qr"}
        onClose={closeModal}
        trigger={false}
        title="Share Campaign"
      >
        <div className="w-full">
          {selected?.id && <ProgramQrModal programId={selected.id} />}
        </div>
      </CustomModal>

      {/* Programme detail is a right-side panel, not a centre modal: its four
          tabs are a working surface a merchant reads alongside the campaign
          list, and the design keeps that list visible behind it. */}
      <ProgramDetailPanel
        program={selected}
        open={modalView === "participants"}
        onClose={closeModal}
      />

      <CustomModal
        isOpen={modalView === "tiers"}
        onClose={closeModal}
        trigger={false}
        title="Loyalty Tiers"
      >
        <div className="w-full">
          <LoyaltyTiers />
        </div>
      </CustomModal>

      <CustomModal
        isOpen={modalView === "members"}
        onClose={closeModal}
        trigger={false}
        title="Loyalty Members"
      >
        <div className="w-full">
          <LoyaltyMembers />
        </div>
      </CustomModal>

      <CustomModal
        isOpen={modalView === "pos"}
        onClose={closeModal}
        trigger={false}
        title="Point of Sale"
      >
        <div className="w-full">
          <PointOfSale />
        </div>
      </CustomModal>
    </div>
  );
};

export default LoyaltyPrograms;

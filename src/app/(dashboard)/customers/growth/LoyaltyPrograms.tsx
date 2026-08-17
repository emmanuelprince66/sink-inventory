"use client";

import { Spinner } from "@/components/app/Spinner";
import { Flame, Megaphone } from "lucide-react";
import dynamic from "next/dynamic";
import { useState } from "react";
import CampaignCard from "./programs/CampaignCard";
import LoyaltyProgramOverlays from "./programs/LoyaltyProgramOverlays";
import LoyaltyProgramsHeader from "./programs/LoyaltyProgramsHeader";
import LoyaltyStatCards from "./programs/LoyaltyStatCards";
import StreakMarquee, { StreakSkeleton } from "./programs/StreakMarquee";
import { useLoyaltyPrograms } from "./programs/useLoyaltyPrograms";

// Same dynamic-import pattern Customers.tsx already used for the Campaigns
// tab — kept reachable from here since Loyalty Programs is its closest
// conceptual match in the new nav.
const Campaign = dynamic(() => import("../../campaign/Campaign"), {
  ssr: false,
  loading: () => (
    <div className="w-full flex justify-center py-16">
      <Spinner className="text-primary-green-300" />
    </div>
  ),
});

const LoyaltyPrograms = () => {
  const [showRealCampaigns, setShowRealCampaigns] = useState(false);
  const {
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
  } = useLoyaltyPrograms();

  return (
    <div className="space-y-4 w-full min-w-0 max-w-full">
      <LoyaltyProgramsHeader
        onOpenTiers={() => openModal("tiers")}
        onOpenMembers={() => openModal("members")}
      />

      <LoyaltyStatCards dashboard={dashboard} />

      {/* Loyalty Streak System */}
      <div className="bg-primary-green-100 rounded-2xl w-full min-w-0 p-5 overflow-hidden">
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          <Flame className="w-4 h-4 text-warning-1" />
          <h3 className="text-sm font-extrabold text-white">
            Loyalty Streak System
          </h3>
        </div>
        <p className="text-xs text-white/60 mb-4">
          Top streak performers{" "}
          <span className="text-primary-green-300 font-bold">this month</span>
        </p>
        <div className="w-full">
          {dashboardLoading ? (
            <StreakSkeleton />
          ) : (
            <StreakMarquee performers={streakPerformers} />
          )}
        </div>
      </div>

      <div className="space-y-3">
        {campaigns.map((program) => (
          <CampaignCard
            key={program.id}
            program={program}
            onEdit={(p) => openModal("edit", p)}
            onShowQr={(p) => openModal("qr", p)}
            onViewParticipants={(p) => openModal("participants", p)}
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

      <LoyaltyProgramOverlays
        view={modalView}
        selected={selected}
        onClose={closeModal}
      />
    </div>
  );
};

export default LoyaltyPrograms;

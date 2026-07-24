"use client";

import { Spinner } from "@/components/app/Spinner";
import { cn } from "@/lib/utils";
import { Award, Flame, Gift, Megaphone, Plus, Star } from "lucide-react";
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

const CAMPAIGN_ICONS: Record<string, React.ReactNode> = {
  visit_streak: <Star className="w-4 h-4" />,
  big_spender: <Award className="w-4 h-4" />,
  birthday: <Gift className="w-4 h-4" />,
  referral_champion: <Megaphone className="w-4 h-4" />,
};

const LoyaltyPrograms = () => {
  const [showRealCampaigns, setShowRealCampaigns] = useState(false);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-grey-3">
          Build unlimited loyalty campaigns. Reward customers for visits,
          spend, referrals, and more.
        </p>
        <button className="shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-primary-green-300 text-white text-sm font-bold hover:bg-primary-green-300/90 cursor-pointer">
          <Plus className="w-4 h-4" />
          Create Campaign
        </button>
      </div>

      {/* Loyalty Streak System */}
      <div className="bg-grey-1 rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-1">
          <Flame className="w-4 h-4 text-warning-1" />
          <h3 className="text-sm font-extrabold text-white">
            Loyalty Streak System
          </h3>
        </div>
        <p className="text-xs text-white/60 mb-4">Top streak performers this month</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {STREAK_LEADERS.map((leader) => (
            <div
              key={leader.name}
              className="bg-white/5 border border-white/10 rounded-xl p-3.5"
            >
              <div className="flex items-center gap-2 mb-3">
                <span className="w-7 h-7 rounded-full bg-primary-green-300 text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                  {leader.initials}
                </span>
                <div>
                  <p className="text-sm font-bold text-white">{leader.name}</p>
                  <p className="text-[10px] text-white/50">{leader.tier}</p>
                </div>
              </div>
              <p className="text-lg font-extrabold text-white flex items-center gap-1">
                {leader.streak}
                <Flame className="w-4 h-4 text-warning-1" />
              </p>
              <p className="text-[10px] text-white/50 mb-2">Visit streak</p>
              <div className="h-1.5 rounded-full bg-white/10 overflow-hidden mb-1.5">
                <div
                  className="h-full rounded-full bg-primary-green-300"
                  style={{ width: `${leader.progressPct}%` }}
                />
              </div>
              <p className="text-[10px] text-white/50">{leader.nextRewardIn}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Campaign cards */}
      <div className="space-y-3">
        {LOYALTY_CAMPAIGNS.map((campaign) => (
          <div
            key={campaign.key}
            className="bg-white rounded-2xl border border-grey-5 p-4 sm:p-5"
          >
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-full bg-secondary-6 text-primary-green-300 flex items-center justify-center shrink-0">
                  {CAMPAIGN_ICONS[campaign.key]}
                </div>
                <div>
                  <h4 className="text-sm font-extrabold text-grey-1">
                    {campaign.name}
                  </h4>
                  <p className="text-xs text-grey-3 mt-0.5">
                    Trigger: {campaign.triggerLabel} · Reward:{" "}
                    {campaign.rewardLabel}
                  </p>
                </div>
              </div>
              <span
                className={cn(
                  "shrink-0 text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full",
                  campaign.status === "Active"
                    ? "bg-success-2 text-success-1"
                    : "bg-grey-6 text-grey-3",
                )}
              >
                {campaign.status}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 mb-3">
              <div className="bg-grey-6 rounded-lg py-2 text-center">
                <p className="text-sm font-extrabold text-grey-1">
                  {campaign.participants}
                </p>
                <p className="text-[10px] text-grey-3">Participants</p>
              </div>
              <div className="bg-grey-6 rounded-lg py-2 text-center">
                <p className="text-sm font-extrabold text-grey-1">
                  {campaign.completions}
                </p>
                <p className="text-[10px] text-grey-3">Completions</p>
              </div>
              <div className="bg-grey-6 rounded-lg py-2 text-center">
                <p className="text-sm font-extrabold text-grey-1">
                  {campaign.completionRate}
                </p>
                <p className="text-[10px] text-grey-3">Completion Rate</p>
              </div>
            </div>

            <div className="flex items-center justify-between gap-3">
              <button className="text-xs font-bold text-primary-green-300 hover:text-primary-green-300/80 cursor-pointer">
                Edit Campaign
              </button>
              <button className="px-3.5 py-1.5 rounded-full bg-primary-green-300 text-white text-xs font-bold hover:bg-primary-green-300/90 cursor-pointer">
                View Participants
              </button>
            </div>
          </div>
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
    </div>
  );
};

export default LoyaltyPrograms;

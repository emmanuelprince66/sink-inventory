"use client";

import DataGapBadge from "@/components/app/DataGapBadge";
import { useToast } from "@/hooks/toast/useToast";
import { cn } from "@/lib/utils";
import { useFormatMoney } from "@/utils/formatMoney";
import {
  Copy,
  Gift,
  Link2,
  Mail,
  MessageSquare,
  Plus,
  TrendingUp,
  Users,
} from "lucide-react";
import { REFERRAL_PROGRAMMES, REFERRAL_SUMMARY } from "./dummyGrowthData";

const STEPS = [
  "Add a loyal customer to your programme",
  "They share their unique sync360 link",
  "New customer signs up via the link",
  "Both get rewarded automatically",
];

const SummaryTile = ({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode;
  value: string;
  label: string;
}) => (
  <div className="rounded-xl bg-primary-green-500 p-3">
    <div className="text-primary-green-300">{icon}</div>
    <p className="mt-1.5 text-lg font-extrabold text-grey-1">{value}</p>
    <p className="text-[10px] text-grey-3">{label}</p>
  </div>
);

const CustomerReferrals = () => {
  const formatMoney = useFormatMoney();
  const { showToast } = useToast();

  const copy = (value: string) =>
    navigator.clipboard
      .writeText(value)
      .then(() => showToast("Referral link copied", "success"))
      .catch(() => showToast("Could not copy the link", "error"));

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="rounded-2xl border border-grey-5 bg-white p-5 sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <h2 className="text-lg font-extrabold text-grey-1 sm:text-xl">
              Referral Programmes
            </h2>
            <p className="mt-0.5 text-xs text-warning-1">
              Turn your loyal customers into your best marketers
            </p>
          </div>
          <button className="flex h-10 shrink-0 items-center justify-center gap-1.5 rounded-xl bg-primary-green-100 px-4 text-sm font-bold text-white hover:bg-primary-green-100/90 cursor-pointer">
            <Plus className="h-4 w-4" />
            New Programme
          </button>
        </div>

        {/* Nothing on this tab is live — no referral endpoints exist. */}
        <div className="mt-3">
          <DataGapBadge
            label="Entire tab is sample data"
            needs="No referral endpoints exist. Needed: GET /customer/referrals/{business_id}/ returning summary (programmes, participants, total_referrals, paid_out, conversion) and a programme list (name, created_at, status, reward_rate, reward_cap, rewards_used, participants, referrals, paid_out, referral_link, sms/email notification flags); POST to create a programme; PATCH to update or pause one."
          />
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          <SummaryTile
            icon={<Gift className="h-4 w-4" />}
            value={String(REFERRAL_SUMMARY.programmes)}
            label="Programmes"
          />
          <SummaryTile
            icon={<Users className="h-4 w-4" />}
            value={String(REFERRAL_SUMMARY.participants)}
            label="Participants"
          />
          <SummaryTile
            icon={<Link2 className="h-4 w-4" />}
            value={String(REFERRAL_SUMMARY.totalReferrals)}
            label="Total Referrals"
          />
          <SummaryTile
            icon={<Gift className="h-4 w-4" />}
            value={formatMoney(REFERRAL_SUMMARY.paidOut)}
            label="Paid Out"
          />
          <SummaryTile
            icon={<TrendingUp className="h-4 w-4" />}
            value={`${REFERRAL_SUMMARY.conversion}×`}
            label="Conversion"
          />
        </div>
      </div>

      {/* How it works */}
      <div className="rounded-2xl bg-primary-green-100 p-5 sm:p-6">
        <p className="text-[10px] font-bold uppercase tracking-widest text-white/70">
          How <span className="text-primary-green-300">Referrals</span> Work
        </p>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((step, index) => (
            <div key={step} className="flex items-start gap-2">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary-green-300 text-[11px] font-extrabold text-white">
                {index + 1}
              </span>
              <p className="text-[11px] leading-relaxed text-white/80">{step}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Programme cards */}
      {REFERRAL_PROGRAMMES.map((programme) => {
        const pct =
          programme.cap > 0
            ? Math.min(100, Math.round((programme.used / programme.cap) * 100))
            : 0;

        return (
          <div
            key={programme.id}
            className="rounded-2xl bg-primary-green-100 p-5 sm:p-6"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h3 className="truncate text-sm font-extrabold text-white">
                  {programme.name}
                </h3>
                <p className="mt-1 text-[11px] text-primary-green-300">
                  Created {programme.createdAt}
                </p>
              </div>
              <span className="shrink-0 rounded-full bg-primary-green-300/20 px-2.5 py-1 text-[10px] font-bold text-primary-green-300">
                {programme.status}
              </span>
            </div>

            <div className="mt-5 flex items-end justify-between gap-3">
              <div className="flex gap-8">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-primary-green-300">
                    Reward Rate
                  </p>
                  <p className="text-2xl font-extrabold text-white">
                    {programme.rewardRate}%
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-primary-green-300">
                    Cap
                  </p>
                  <p className="text-2xl font-extrabold text-white">
                    {programme.cap}
                  </p>
                </div>
              </div>
              {/* Which notifications this programme sends. */}
              <div className="flex shrink-0 gap-1.5">
                {programme.sms && (
                  <span
                    className="flex h-6 w-6 items-center justify-center rounded-md bg-white/10 text-white/70"
                    title="SMS notification on"
                  >
                    <MessageSquare className="h-3 w-3" />
                  </span>
                )}
                {programme.email && (
                  <span
                    className="flex h-6 w-6 items-center justify-center rounded-md bg-white/10 text-white/70"
                    title="Email notification on"
                  >
                    <Mail className="h-3 w-3" />
                  </span>
                )}
              </div>
            </div>

            <div className="mt-5">
              <div className="flex items-center justify-between text-[10px]">
                <span className="text-white/60">
                  Cap usage — {programme.used}/{programme.cap} rewards
                </span>
                <span className="font-bold text-primary-green-300">{pct}%</span>
              </div>
              <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-primary-green-300"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>

            <div className="mt-5 mb-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
              {[
                { value: String(programme.participants), label: "Participants" },
                { value: String(programme.referrals), label: "Referrals" },
                { value: formatMoney(programme.paidOut), label: "Paid Out" },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-xl bg-primary-green-500 px-3 py-3.5 text-center"
                >
                  <p className="text-base font-extrabold text-grey-1">
                    {stat.value}
                  </p>
                  <p className="mt-0.5 text-[10px] text-grey-3">{stat.label}</p>
                </div>
              ))}
            </div>
            <div className="flex items-center flex-col w-full justify-between gap-3">
  <button
              onClick={() => copy(programme.link)}
              className="mt-3  flex w-full items-center gap-2 rounded-xl bg-primary-green-500 px-3.5 py-2.5 text-left cursor-pointer hover:bg-primary-green-500/80"
              title="Copy referral link"
            >
              <span className="min-w-0 flex-1 truncate font-mono text-[11px] text-grey-2">
                {programme.link}
              </span>
              <Copy className="h-3.5 w-3.5 shrink-0 text-grey-3" />
            </button>
              <button
              className={cn(
                "mt-3 w-full rounded-xl bg-primary-green-300 py-3 text-sm font-bold text-white",
                "hover:bg-primary-green-300/90 cursor-pointer",
              )}
            >
              Manage Programme →
            </button>
            </div>

          

          
          </div>
        );
      })}
    </div>
  );
};

export default CustomerReferrals;

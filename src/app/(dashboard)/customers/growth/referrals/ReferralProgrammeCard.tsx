"use client";

import type { CustomerReferralProgramme } from "@/types/customerReferral";
import { useFormatMoney } from "@/utils/formatMoney";
import { Mail, MessageSquare } from "lucide-react";

/**
 * cap_progress arrives pre-formatted as "used/cap", so the bar reads the used
 * half from it rather than recomputing — reward_cap alone does not say how many
 * have been paid.
 */
const capUsage = (programme: CustomerReferralProgramme) => {
  const [usedRaw] = (programme.cap_progress ?? "").split("/");
  const used = Number(usedRaw ?? 0) || 0;
  const cap = Number(programme.reward_cap ?? 0) || 0;
  return {
    used,
    cap,
    pct: cap > 0 ? Math.min(100, Math.round((used / cap) * 100)) : 0,
  };
};

const ReferralProgrammeCard = ({
  programme,
  onManage,
}: {
  programme: CustomerReferralProgramme;
  onManage: () => void;
}) => {
  const formatMoney = useFormatMoney();
  const { used, cap, pct } = capUsage(programme);
  const isActive = programme.is_active !== false;

  const created = programme.created_at
    ? new Date(programme.created_at).toLocaleDateString("en-NG", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "—";

  const stats = [
    { value: String(programme.participants_count ?? 0), label: "Participants" },
    { value: String(programme.referrals_count ?? 0), label: "Referrals" },
    { value: formatMoney(Number(programme.total_paid ?? 0)), label: "Paid Out" },
  ];

  return (
    <div className="rounded-2xl bg-primary-green-100 p-5 sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate text-sm font-extrabold text-white">
            {programme.name}
          </h3>
          <p className="mt-1 text-[11px] text-primary-green-300">
            Created {created}
          </p>
        </div>
        <span
          className={
            isActive
              ? "shrink-0 rounded-full bg-primary-green-300/20 px-2.5 py-1 text-[10px] font-bold text-primary-green-300"
              : "shrink-0 rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-bold text-white/60"
          }
        >
          {isActive ? "Active" : "Paused"}
        </span>
      </div>

      <div className="mt-5 flex flex-wrap items-end justify-between gap-3">
        <div className="flex gap-8">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-primary-green-300">
              Reward Rate
            </p>
            <p className="text-2xl font-extrabold text-white">
              {Number(programme.reward_percentage ?? 0)}%
            </p>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-primary-green-300">
              Cap
            </p>
            <p className="text-2xl font-extrabold text-white">{cap}</p>
          </div>
        </div>
        {/* Which notifications this programme sends. */}
        <div className="flex shrink-0 gap-1.5">
          {programme.notify_sms && (
            <span
              className="flex h-6 w-6 items-center justify-center rounded-md bg-white/10 text-white/70"
              title="SMS notification on"
            >
              <MessageSquare className="h-3 w-3" />
            </span>
          )}
          {programme.notify_email && (
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
        <div className="flex items-center justify-between gap-2 text-[10px]">
          <span className="text-white/60">
            Cap usage — {programme.cap_progress ?? `${used}/${cap}`} rewards
          </span>
          <span className="shrink-0 font-bold text-primary-green-300">
            {pct}%
          </span>
        </div>
        <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-primary-green-300"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl bg-primary-green-500 px-3 py-3.5 text-center"
          >
            <p className="truncate text-base font-extrabold text-grey-1">
              {stat.value}
            </p>
            <p className="mt-0.5 text-[10px] text-grey-3">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* The referral link belongs to a participant, not the programme — the
          list endpoint carries no link, so Manage is where the codes live. */}
        <div className="mt-5">
     <button
        onClick={onManage}
        className="mt-4 w-full rounded-xl bg-primary-green-300 py-3 text-sm font-bold text-white hover:bg-primary-green-300/90 cursor-pointer"
      >
        Manage Programme →
      </button>
        </div>
 
    </div>
  );
};

export default ReferralProgrammeCard;

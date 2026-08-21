"use client";

import type { CustomerReferralParticipant } from "@/types/customerReferral";
import { useFormatMoney } from "@/utils/formatMoney";
import { BadgeCheck, Copy, Link2 } from "lucide-react";
import { useState } from "react";

const addedOn = (iso?: string) =>
  iso
    ? new Date(iso).toLocaleDateString("en-NG", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : null;

const ParticipantCard = ({
  participant,
  onCopy,
}: {
  participant: CustomerReferralParticipant;
  onCopy: (link?: string | null) => void;
}) => {
  const formatMoney = useFormatMoney();
  const [open, setOpen] = useState(false);
  const added = addedOn(participant.created_at);

  return (
    <div className="rounded-xl border border-grey-5 bg-white p-3.5">
      <div className="flex min-w-0 items-start gap-2.5">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary-green-500 text-[11px] font-extrabold text-primary-green-300">
          {participant.initials || "?"}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <p className="truncate text-sm font-bold text-primary-green-300">
              {participant.customer_name}
            </p>
            <span className="rounded-full bg-info-2 px-2 py-0.5 text-[10px] font-bold text-info-1">
              {participant.code}
            </span>
          </div>
          <p className="mt-0.5 truncate text-[11px] text-grey-3">
            {participant.phone}
            {added ? ` · Added ${added}` : ""}
          </p>
        </div>
      </div>

      {participant.referral_link && (
        <div className="mt-2.5 flex min-w-0 items-center gap-2 rounded-lg bg-primary-green-500/60 py-2 pl-3 pr-2">
          <span className="min-w-0 flex-1 truncate font-mono text-[11px] text-grey-2">
            {participant.referral_link}
          </span>
          <button
            onClick={() => onCopy(participant.referral_link)}
            className="flex shrink-0 items-center gap-1 rounded-md px-2 py-1 text-[11px] font-bold text-grey-3 hover:bg-white hover:text-grey-1 cursor-pointer"
          >
            <Copy className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Copy Link</span>
          </button>
        </div>
      )}

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-grey-6 pt-2.5">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-grey-3">
          <span className="flex items-center gap-1">
            <Link2 className="h-3.5 w-3.5 text-grey-4" />
            <span className="font-bold text-grey-1">
              {participant.referrals_count ?? 0}
            </span>
            referrals
          </span>
          <span className="flex items-center gap-1">
            <BadgeCheck className="h-3.5 w-3.5 text-success-1" />
            <span className="font-bold text-grey-1">
              {participant.paid_count ?? 0}
            </span>
            paid
          </span>
          <span className="flex items-center gap-1">
            🏅
            <span className="font-bold text-warning-1">
              {formatMoney(Number(participant.total_earned ?? 0))}
            </span>
            earned
          </span>
        </div>

        <button
          onClick={() => setOpen((v) => !v)}
          className="shrink-0 rounded-lg border border-grey-5 px-2.5 py-1 text-[11px] font-bold text-grey-2 hover:bg-grey-6 cursor-pointer"
        >
          {open ? "View Less ←" : "View More →"}
        </button>
      </div>

      {/* Only what the participants endpoint actually carries — there is no
          per-referral breakdown to drill into yet. */}
      {open && (
        <dl className="mt-2.5 grid grid-cols-2 gap-2 border-t border-grey-6 pt-2.5 sm:grid-cols-4">
          {[
            { label: "Referral code", value: participant.code },
            { label: "Phone", value: participant.phone ?? "—" },
            { label: "Joined", value: added ?? "—" },
            {
              label: "Unpaid",
              value: String(
                Math.max(
                  0,
                  (participant.referrals_count ?? 0) -
                    (participant.paid_count ?? 0),
                ),
              ),
            },
          ].map((item) => (
            <div key={item.label} className="min-w-0">
              <dt className="text-[10px] text-grey-3">{item.label}</dt>
              <dd className="truncate text-xs font-bold text-grey-1">
                {item.value}
              </dd>
            </div>
          ))}
        </dl>
      )}
    </div>
  );
};

export default ParticipantCard;

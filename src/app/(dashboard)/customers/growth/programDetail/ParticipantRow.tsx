"use client";

import { cn } from "@/lib/utils";
import type { LoyaltyParticipantProgress } from "@/types/loyalty";
import { Check, Gift } from "lucide-react";
import { MAX_STAMPS, avatarTone, initials } from "./primitives";

const shortDate = (iso?: string | null) =>
  iso
    ? new Date(iso).toLocaleDateString("en-NG", {
        day: "numeric",
        month: "short",
      })
    : null;

const statusLabel = (status: string) =>
  status === "AT_RISK"
    ? "At Risk"
    : status.charAt(0) + status.slice(1).toLowerCase();

const statusTone = (status: string) =>
  status === "COMPLETED" || status === "REWARDED"
    ? "bg-primary-green-300 text-white"
    : status === "AT_RISK" || status === "AT RISK"
      ? "bg-error-2 text-error-1"
      : "bg-primary-green-500 text-primary-green-300";

/**
 * One member's card: who they are, where their streak stands, and — once the
 * streak is done — what the programme paid them.
 *
 * The stamps are the point. A filled tile per qualifying visit and a gift tile
 * for the reward reads the way the physical punch card does, which is the whole
 * mental model the programme is sold on.
 */
const ParticipantRow = ({
  participant,
  target,
  rewardSummary,
}: {
  participant: LoyaltyParticipantProgress;
  target: number;
  /** Shown on a rewarded member — the payload carries no per-member amount. */
  rewardSummary?: string | null;
}) => {
  const current = Number(participant.progress_current ?? 0);
  const total = Number(participant.progress_target ?? target) || 0;
  const status = (participant.status ?? "ACTIVE").toUpperCase();
  const isRewarded = status === "REWARDED" || status === "COMPLETED";

  const joined = shortDate(participant.joined_at);
  const lastVisit = shortDate(participant.last_qualifying_visit_at);

  return (
    <div className="border-b border-grey-6 py-3.5 last:border-0">
      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2.5">
          <span
            className={cn(
              "flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[11px] font-extrabold text-white",
              avatarTone(participant.id ?? participant.name ?? ""),
            )}
          >
            {initials(participant.name)}
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-grey-1">
              {participant.name}
            </p>
            <p className="truncate text-[11px] text-grey-4">
              {joined ? `Joined ${joined}` : "Joined —"}
              {lastVisit ? ` · Last visit ${lastVisit}` : ""}
            </p>
          </div>
        </div>
        <span
          className={cn(
            "shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold",
            statusTone(status),
          )}
        >
          {statusLabel(status)}
        </span>
      </div>

      {total > 0 && (
        <>
          {/* Beyond MAX_STAMPS — and on spend-based programmes, where the
              target is a money amount — fall back to a bar. Without this cap a
              target of 50,000 renders 50,000 nodes and locks the browser. */}
          {total <= MAX_STAMPS ? (
            <div className="mt-3 flex flex-wrap items-center gap-1.5">
              {Array.from({ length: total }, (_, i) => (
                <span
                  key={i}
                  className={cn(
                    "flex h-6 w-6 items-center justify-center rounded-md text-[10px] font-bold",
                    i < current
                      ? "bg-primary-green-300 text-white"
                      : "bg-primary-green-500 text-primary-green-300/40",
                  )}
                >
                  {i < current ? <Check className="h-3.5 w-3.5" /> : ""}
                </span>
              ))}
              {/* The reward itself, always last and always amber. */}
              <span
                className={cn(
                  "flex h-6 w-6 items-center justify-center rounded-md",
                  isRewarded
                    ? "bg-warning-1 text-white"
                    : "bg-warning-2 text-warning-1",
                )}
              >
                <Gift className="h-3.5 w-3.5" />
              </span>
            </div>
          ) : (
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-primary-green-500">
              <div
                className="h-full rounded-full bg-primary-green-300"
                style={{
                  width: `${Math.min(100, Math.max(0, (current / total) * 100))}%`,
                }}
              />
            </div>
          )}

          <div className="mt-2 flex items-center justify-between gap-2">
            <p className="text-[11px] text-grey-4">
              {total <= MAX_STAMPS
                ? `Visit ${current} of ${total}`
                : `${current.toLocaleString()} of ${total.toLocaleString()}`}
            </p>
            {isRewarded && rewardSummary && (
              <p className="shrink-0 text-[11px] font-extrabold text-primary-green-300">
                {rewardSummary} given
              </p>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default ParticipantRow;

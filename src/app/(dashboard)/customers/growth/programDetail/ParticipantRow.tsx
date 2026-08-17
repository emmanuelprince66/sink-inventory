"use client";

import { cn } from "@/lib/utils";
import type { LoyaltyParticipantProgress } from "@/types/loyalty";
import { MAX_STAMPS, initials } from "./primitives";

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
    ? "bg-emerald-100 text-emerald-700"
    : status === "AT_RISK" || status === "AT RISK"
      ? "bg-rose-100 text-rose-700"
      : "bg-sky-100 text-sky-700";

/**
 * Stamp-card row: a filled dot per qualifying visit, matching the physical
 * loyalty card the QR tab prints.
 */
const ParticipantRow = ({
  participant,
  target,
}: {
  participant: LoyaltyParticipantProgress;
  target: number;
}) => {
  const current = Number(participant.progress_current ?? 0);
  const total = Number(participant.progress_target ?? target) || 0;
  const status = (participant.status ?? "ACTIVE").toUpperCase();

  const joined = shortDate(participant.joined_at);
  const lastVisit = shortDate(participant.last_qualifying_visit_at);

  return (
    <div className="rounded-xl border border-grey-5 bg-white p-3">
      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-grey-6 text-[10px] font-extrabold text-grey-2">
            {initials(participant.name)}
          </span>
          <div className="min-w-0">
            <p className="truncate text-xs font-bold text-grey-1">
              {participant.name}
            </p>
            <p className="truncate text-[10px] text-grey-3">
              {joined ? `Joined ${joined}` : "Joined —"}
              {lastVisit ? ` · Last visit ${lastVisit}` : ""}
            </p>
          </div>
        </div>
        <span
          className={cn(
            "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold",
            statusTone(status),
          )}
        >
          {statusLabel(status)}
        </span>
      </div>

      {total > 0 && (
        <>
          {/* A stamp card only reads as one past a handful of steps. Beyond
              MAX_STAMPS — and on spend-based programmes, where the target is a
              money amount — fall back to a bar. Without this cap a target of
              50,000 renders 50,000 nodes and locks the browser. */}
          {total <= MAX_STAMPS ? (
            <div className="mt-2.5 flex flex-wrap gap-1">
              {Array.from({ length: total }, (_, i) => (
                <span
                  key={i}
                  className={cn(
                    "flex h-5 w-5 items-center justify-center rounded text-[9px] font-bold",
                    i < current
                      ? "bg-primary-green-300 text-white"
                      : "bg-grey-6 text-grey-4",
                  )}
                >
                  {i < current ? "✓" : i + 1}
                </span>
              ))}
            </div>
          ) : (
            <div className="mt-2.5 h-2 overflow-hidden rounded-full bg-grey-6">
              <div
                className="h-full rounded-full bg-primary-green-300"
                style={{
                  width: `${Math.min(100, Math.max(0, (current / total) * 100))}%`,
                }}
              />
            </div>
          )}
          <p className="mt-1.5 text-[10px] text-grey-3">
            {total <= MAX_STAMPS
              ? `Visit ${current} of ${total}`
              : `${current.toLocaleString()} of ${total.toLocaleString()}`}
          </p>
        </>
      )}
    </div>
  );
};

export default ParticipantRow;

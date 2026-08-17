"use client";

import { cn } from "@/lib/utils";
import type { ReactNode } from "react";
import { asRate } from "../loyaltyFormat";

export const TABS = ["Overview", "Participants", "QR Code", "Report"] as const;
export type DetailTab = (typeof TABS)[number];

export const PARTICIPANT_FILTERS = [
  "All",
  "Active",
  "Completed",
  "At Risk",
] as const;
export type ParticipantFilter = (typeof PARTICIPANT_FILTERS)[number];

/**
 * Above this many steps a stamp card stops being readable — and stops being
 * safe to render one node at a time. Progress falls back to a bar.
 */
export const MAX_STAMPS = 12;

export const initials = (name?: string) =>
  (name ?? "?")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase() || "?";

/** Green when healthy, amber mid, red when poor — matches the design's bars. */
export const rateTone = (rate: number) =>
  rate >= 70
    ? { bar: "bg-emerald-500", text: "text-emerald-700" }
    : rate >= 40
      ? { bar: "bg-amber-500", text: "text-amber-700" }
      : { bar: "bg-rose-500", text: "text-rose-700" };

export const rateCaption = (rate: number) =>
  rate >= 70
    ? "Excellent retention"
    : rate >= 40
      ? "Room to improve"
      : "Needs attention";

export const StatTile = ({
  icon,
  value,
  label,
  tone,
}: {
  icon: ReactNode;
  value: number | string;
  label: string;
  tone: string;
}) => (
  <div className="min-w-0 rounded-xl border border-grey-5 bg-white p-3">
    <div
      className={cn(
        "flex items-center gap-1.5 text-[11px] font-bold min-w-0",
        tone,
      )}
    >
      <span className="shrink-0">{icon}</span>
      <span className="truncate">{label}</span>
    </div>
    <p className="mt-1.5 truncate text-xl font-extrabold text-grey-1">{value}</p>
  </div>
);

export const RateBar = ({
  label,
  rate,
  caption,
}: {
  label: string;
  rate: number;
  caption?: string;
}) => {
  const tone = rateTone(rate);
  return (
    <div className="rounded-xl border border-grey-5 bg-white p-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-bold text-grey-1">{label}</p>
        <p className={cn("shrink-0 text-sm font-extrabold", tone.text)}>
          {asRate(rate)}%
        </p>
      </div>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-grey-6">
        <div
          className={cn("h-full rounded-full transition-all", tone.bar)}
          style={{ width: `${Math.min(100, Math.max(0, rate))}%` }}
        />
      </div>
      {caption && (
        <p className={cn("mt-1.5 text-[11px] font-medium", tone.text)}>
          {caption}
        </p>
      )}
    </div>
  );
};

/** Label on the left, figure on the right — used by the Report tab. */
export const StatRow = ({
  label,
  value,
  tone = "text-grey-1",
}: {
  label: string;
  value: string;
  tone?: string;
}) => (
  <div className="flex items-center justify-between gap-2 rounded-xl border border-grey-5 bg-white px-3 py-2.5">
    <p className="text-xs font-medium text-grey-2">{label}</p>
    <p className={cn("shrink-0 text-sm font-extrabold", tone)}>{value}</p>
  </div>
);

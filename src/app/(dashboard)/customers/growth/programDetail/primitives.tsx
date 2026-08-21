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

/** Stable per-member tint, so an avatar keeps its colour between renders. */
const AVATAR_TONES = [
  "bg-primary-green-300",
  "bg-amber-500",
  "bg-sky-600",
  "bg-violet-500",
  "bg-rose-500",
  "bg-teal-600",
];

export const avatarTone = (seed: string) => {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1)
    hash = (hash * 31 + seed.charCodeAt(i)) | 0;
  return AVATAR_TONES[Math.abs(hash) % AVATAR_TONES.length];
};

export const rateCaption = (rate: number) =>
  rate >= 70
    ? "Excellent retention"
    : rate >= 40
      ? "Room to improve"
      : "Needs attention";

/**
 * One figure in the Overview grid: tinted icon, big number, quiet label.
 * The number carries the tone, not the card — the design keeps every card on
 * white so the four read as one set.
 */
export const StatTile = ({
  icon,
  value,
  label,
  tone = "text-grey-1",
}: {
  icon: ReactNode;
  value: number | string;
  label: string;
  tone?: string;
}) => (
  <div className="min-w-0 rounded-2xl border border-grey-5 bg-primary-green-700 p-4">
    <div className="mb-2.5">{icon}</div>
    <p className={cn("truncate text-2xl font-extrabold", tone)}>{value}</p>
    <p className="mt-0.5 truncate text-[11px] font-medium text-grey-4">
      {label}
    </p>
  </div>
);

/**
 * Retention and completion. `highlight` gives the tinted treatment the design
 * reserves for retention — completion sits on plain white beneath it.
 */
export const RateBar = ({
  label,
  rate,
  caption,
  highlight = false,
}: {
  label: string;
  rate: number;
  caption?: string;
  highlight?: boolean;
}) => (
  <div
    className={cn(
      "rounded-2xl border p-4",
      highlight
        ? "border-primary-green-300/25 bg-primary-green-500"
        : "border-grey-5 bg-white",
    )}
  >
    <div className="flex items-center justify-between gap-2">
      <p className="text-sm font-bold text-grey-1">{label}</p>
      <p className="shrink-0 text-base font-extrabold text-primary-green-300">
        {asRate(rate)}%
      </p>
    </div>
    <div className="mt-2.5 h-2 overflow-hidden rounded-full bg-white/80">
      <div
        className="h-full rounded-full bg-primary-green-300 transition-all"
        style={{ width: `${Math.min(100, Math.max(0, rate))}%` }}
      />
    </div>
    {caption && (
      <p className="mt-2 flex items-center gap-1.5 text-[11px] font-medium text-primary-green-300">
        <span className="h-1.5 w-1.5 rounded-full bg-primary-green-300" />
        {caption}
      </p>
    )}
  </div>
);

/**
 * A money line on the Report tab — tinted square icon, label, figure.
 * Each row owns its tint so the four read as categories, not a table.
 */
export const StatRow = ({
  icon,
  label,
  value,
  tone,
  surface,
  border,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  tone: string;
  surface: string;
  /** A stronger draw of `surface` — the design outlines each row in its own
   *  colour rather than a neutral grey, so the four stay distinguishable. */
  border: string;
}) => (
  <div
    className={cn(
      "flex items-center justify-between gap-3 rounded-2xl border px-3.5 py-3",
      surface,
      border,
    )}
  >
    <div className="flex min-w-0 items-center gap-2.5">
      <span className={cn("shrink-0", tone)}>{icon}</span>
      <p className="truncate text-xs font-medium text-grey-2">{label}</p>
    </div>
    <p className={cn("shrink-0 text-sm font-extrabold", tone)}>{value}</p>
  </div>
);

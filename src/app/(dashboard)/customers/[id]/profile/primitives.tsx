"use client";

import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

// Transactions is no longer its own tab — the ledger now lives at the foot of
// the Financial tab, next to the balances it explains.
export const TABS = [
  "Overview",
  "Purchase",
  "Loyalty",
  "Engagement",
  "Shopping",
  "Financial",
] as const;

export type ProfileTab = (typeof TABS)[number];

export const TIER_TONES: Record<string, string> = {
  VIP: "bg-violet-500/20 text-violet-300",
  Gold: "bg-amber-500/20 text-amber-300",
  Silver: "bg-white/10 text-white/70",
  Bronze: "bg-orange-500/20 text-orange-300",
};

export const RISK_TONES: Record<string, string> = {
  Low: "text-primary-green-300",
  Medium: "text-warning-1",
  High: "text-orange-400",
  Critical: "text-error-1",
};

/** Compact money for the header tiles — ₦294K rather than ₦294,000. */
export const compact = (amount: number, symbol: string) => {
  const abs = Math.abs(amount);
  if (abs >= 1_000_000) return `${symbol}${(amount / 1_000_000).toFixed(1)}M`;
  if (abs >= 1_000)
    return `${symbol}${(amount / 1_000).toFixed(abs < 10_000 ? 1 : 0)}K`;
  return `${symbol}${Math.round(amount).toLocaleString()}`;
};

/** Journey milestones arrive as ISO timestamps. */
export const asDate = (iso?: string | null) =>
  iso
    ? new Date(iso).toLocaleDateString("en-NG", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : null;

/** One figure in the header's stat strip. */
export const StatTile = ({
  value,
  label,
  tone,
}: {
  value: string;
  label: string;
  tone: string;
}) => (
  <div className="min-w-0 rounded-xl bg-white/5 px-3 py-2.5 text-center">
    <p className={cn("truncate text-sm font-extrabold", tone)}>{value}</p>
    <p className="mt-0.5 truncate text-[10px] text-white/50">{label}</p>
  </div>
);

/** Label/value pair. An absent value reads as an em dash, never as 0 or blank. */
export const Cell = ({
  label,
  value,
  tone = "text-grey-1",
}: {
  label: string;
  value?: string | number | null;
  tone?: string;
}) => (
  <div className="rounded-xl bg-grey-6/70 px-3 py-2.5">
    <p className="text-[10px] text-grey-3">{label}</p>
    <p className={cn("mt-0.5 text-sm font-bold", tone)}>
      {value === null || value === undefined || value === "" ? "—" : value}
    </p>
  </div>
);

/** Shared shell for the five non-overview tabs. */
export const Panel = ({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) => (
  <div className="rounded-2xl border border-grey-5 bg-white p-4">
    <p className="mb-3 text-[10px] font-bold uppercase tracking-wider text-grey-3">
      {title}
    </p>
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
      {children}
    </div>
  </div>
);

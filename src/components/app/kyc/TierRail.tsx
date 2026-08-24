"use client";

import { cn } from "@/lib/utils";
import { Check, Lock } from "lucide-react";
import { KycTier } from "./tiers";

interface TierRailProps {
  tiers: KycTier[];
  currentTier: number;
  completedTiers: number[];
  canAccessTier: (tier: number) => boolean;
  onSelect: (tier: number) => void;
}

/**
 * The verification ladder, shared by the individual and corporate flows.
 *
 * Sits beside the form on desktop and above it on mobile, so the merchant can
 * always see which tier they are filling in, what it unlocks, and what is
 * still locked behind it.
 */
const TierRail = ({
  tiers,
  currentTier,
  completedTiers,
  canAccessTier,
  onSelect,
}: TierRailProps) => (
  <ol className="space-y-2">
    {tiers.map((tier, index) => {
      const done = completedTiers.includes(tier.tier);
      const active = currentTier === tier.tier;
      const unlocked = canAccessTier(tier.tier);
      const isLast = index === tiers.length - 1;

      return (
        <li key={tier.tier} className="relative">
          {!isLast && (
            <span
              aria-hidden
              className={cn(
                "absolute left-[26px] top-[46px] h-[calc(100%-30px)] w-px",
                done ? "bg-primary-green-300" : "bg-grey-5",
              )}
            />
          )}
          <button
            type="button"
            disabled={!unlocked}
            aria-current={active ? "step" : undefined}
            onClick={() => unlocked && onSelect(tier.tier)}
            className={cn(
              "flex w-full items-start gap-3 rounded-xl border p-3 text-left transition-all",
              active
                ? "border-primary-green-300 bg-white shadow-sm"
                : done
                  ? "border-secondary-3 bg-secondary-6/50 hover:bg-secondary-6"
                  : unlocked
                    ? "border-border-tint bg-white/60 hover:border-secondary-3"
                    : "cursor-not-allowed border-grey-6 bg-grey-6/40",
              unlocked && "cursor-pointer",
            )}
          >
            <span
              className={cn(
                "mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-bold",
                done
                  ? "bg-primary-green-300 text-white"
                  : active
                    ? "bg-secondary-6 text-primary-green-300 ring-2 ring-primary-green-300"
                    : "bg-grey-6 text-grey-3",
              )}
            >
              {done ? <Check size={14} strokeWidth={3} /> : tier.tier}
            </span>

            <span className="min-w-0 flex-1">
              <span className="flex items-center gap-2">
                <span
                  className={cn(
                    "text-sm font-bold",
                    unlocked ? "text-grey-1" : "text-grey-4",
                  )}
                >
                  Tier {tier.tier}
                </span>
                {done && (
                  <span className="rounded-full bg-success-2 px-2 py-0.5 text-[10px] font-extrabold uppercase text-success-1">
                    Verified
                  </span>
                )}
                {!unlocked && (
                  <Lock size={12} className="text-grey-4" aria-label="Locked" />
                )}
              </span>
              <span
                className={cn(
                  "mt-0.5 block text-xs font-semibold",
                  unlocked ? "text-grey-2" : "text-grey-4",
                )}
              >
                {tier.title}
              </span>
              <span className="mt-1 block text-xs text-grey-3">
                {tier.limit} daily · {tier.requirement}
              </span>
            </span>
          </button>
        </li>
      );
    })}
  </ol>
);

export default TierRail;

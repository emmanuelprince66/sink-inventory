"use client";

import { cn } from "@/lib/utils";
import type { TopStreakPerformer } from "@/types/loyalty";
import { Flame } from "lucide-react";

// Streaks are shown against a 10-visit target; anything below 5 reads as
// "at risk" and gets the amber bar instead of the green one.
const STREAK_TARGET = 10;
const STRONG_STREAK = 5;

const StreakCard = ({ performer }: { performer: TopStreakPerformer }) => {
  const pct = Math.min(100, (performer.streak_count / STREAK_TARGET) * 100);
  const isStrong = performer.streak_count >= STRONG_STREAK;

  return (
    <div className="bg-white/[0.06] w-full border border-white/10 rounded-xl p-3.5">
      <div className="flex items-center gap-2 mb-3">
        <span
          className={cn(
            "w-7 h-7 rounded-full text-white text-[10px] font-bold flex items-center justify-center shrink-0",
            isStrong ? "bg-primary-green-300" : "bg-warning-1",
          )}
        >
          {performer.initials}
        </span>
        <div className="min-w-0">
          <p className="text-sm font-bold text-white truncate">
            {performer.full_name}
          </p>
          {performer.tier && (
            <p className="text-[10px] text-white/50">{performer.tier}</p>
          )}
        </div>
      </div>

      <p className="text-lg font-extrabold text-white flex items-center gap-1">
        {performer.streak_count}
        <Flame className="w-4 h-4 text-warning-1" />
        <span className="text-[11px] font-medium text-white/60 ml-0.5">
          visit streak
        </span>
      </p>

      <div className="h-1.5 rounded-full bg-white/10 overflow-hidden mt-2.5">
        <div
          className={cn(
            "h-full rounded-full",
            isStrong ? "bg-primary-green-300" : "bg-warning-1",
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
};

export default StreakCard;

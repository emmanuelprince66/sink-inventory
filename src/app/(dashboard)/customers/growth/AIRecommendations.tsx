"use client";

import { cn } from "@/lib/utils";
import {
  Award,
  Crown,
  Heart,
  Sparkles,
  Star,
  TrendingUp,
  Users,
} from "lucide-react";
import { useState } from "react";
import { AI_RECOMMENDATIONS, AiRecommendation } from "./dummyGrowthData";

const REC_ICONS: Record<string, React.ReactNode> = {
  win_back: <Users className="w-4 h-4" />,
  reward_top20: <Star className="w-4 h-4" />,
  referral_campaign: <Heart className="w-4 h-4" />,
  reduce_streak: <TrendingUp className="w-4 h-4" />,
  birthday_campaign: <Award className="w-4 h-4" />,
  bundle_bread_butter: <Crown className="w-4 h-4" />,
};

const TONE_STYLES: Record<
  AiRecommendation["tone"],
  { iconBg: string; bar: string; button: string; badgeText: string }
> = {
  rose: {
    iconBg: "bg-rose-100 text-rose-600",
    bar: "bg-rose-500",
    button: "bg-rose-600 hover:bg-rose-700",
    badgeText: "text-rose-600 bg-rose-100",
  },
  violet: {
    iconBg: "bg-violet-100 text-violet-600",
    bar: "bg-violet-500",
    button: "bg-violet-600 hover:bg-violet-700",
    badgeText: "text-violet-600 bg-violet-100",
  },
  amber: {
    iconBg: "bg-amber-100 text-amber-600",
    bar: "bg-amber-500",
    button: "bg-amber-500 hover:bg-amber-600",
    badgeText: "text-amber-600 bg-amber-100",
  },
  emerald: {
    iconBg: "bg-emerald-100 text-emerald-600",
    bar: "bg-emerald-500",
    button: "bg-emerald-600 hover:bg-emerald-700",
    badgeText: "text-emerald-600 bg-emerald-100",
  },
  blue: {
    iconBg: "bg-blue-100 text-blue-600",
    bar: "bg-blue-500",
    button: "bg-blue-600 hover:bg-blue-700",
    badgeText: "text-blue-600 bg-blue-100",
  },
};

const IMPACT_STYLES: Record<AiRecommendation["impact"], string> = {
  "HIGH IMPACT": "bg-error-2 text-error-1",
  "MEDIUM IMPACT": "bg-warning-2 text-warning-1",
  "LOW IMPACT": "bg-info-2 text-info-1",
};

const AIRecommendations = () => {
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const visible = AI_RECOMMENDATIONS.filter((r) => !dismissed.has(r.key));

  return (
    <div className="space-y-4">
      <div className="bg-grey-1 rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-1">
          <Sparkles className="w-4 h-4 text-primary-green-300" />
          <h3 className="text-sm font-extrabold text-white">
            AI Customer Intelligence
          </h3>
        </div>
        <p className="text-xs text-white/60">
          Continuously analysing purchase patterns, visit frequency,
          retention, churn, and campaign performance.
        </p>
      </div>

      {visible.length === 0 ? (
        <div className="bg-white rounded-2xl border border-grey-5 p-8 text-center">
          <p className="text-sm text-grey-3">
            No more recommendations right now — check back later.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {visible.map((rec) => {
            const tone = TONE_STYLES[rec.tone];
            return (
              <div
                key={rec.key}
                className="bg-white rounded-2xl border border-grey-5 p-4 sm:p-5"
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-start gap-2.5">
                    <div
                      className={cn(
                        "w-9 h-9 rounded-full flex items-center justify-center shrink-0",
                        tone.iconBg,
                      )}
                    >
                      {REC_ICONS[rec.key]}
                    </div>
                    <h4 className="text-sm font-extrabold text-grey-1 mt-1.5">
                      {rec.title}
                    </h4>
                  </div>
                  <span
                    className={cn(
                      "shrink-0 text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full",
                      IMPACT_STYLES[rec.impact],
                    )}
                  >
                    {rec.impact}
                  </span>
                </div>

                <p className="text-xs text-grey-3 leading-relaxed mb-3">
                  {rec.description}
                </p>

                <div className="flex items-center justify-between text-[10px] text-grey-4 mb-1">
                  <span>Confidence</span>
                  <span className="font-bold text-grey-2">
                    {rec.confidence}%
                  </span>
                </div>
                <div className="h-1.5 rounded-full bg-grey-6 overflow-hidden mb-3">
                  <div
                    className={cn("h-full rounded-full", tone.bar)}
                    style={{ width: `${rec.confidence}%` }}
                  />
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() =>
                      setDismissed((prev) => new Set(prev).add(rec.key))
                    }
                    className="flex-1 py-2 rounded-full border border-grey-5 text-grey-3 text-xs font-bold hover:bg-grey-6 cursor-pointer"
                  >
                    Dismiss
                  </button>
                  <button
                    className={cn(
                      "flex-1 py-2 rounded-full text-white text-xs font-bold cursor-pointer transition-colors",
                      tone.button,
                    )}
                  >
                    {rec.actionLabel}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AIRecommendations;

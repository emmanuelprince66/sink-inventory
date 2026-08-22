"use client";

import type { PublicLoyaltyProgram } from "@/types/loyalty";
import type { LoyaltyTheme } from "@/utils/storeTheme";

const FEATURES = [
  {
    icon: "⚡",
    title: "Instant Tracking",
    text: "Every visit is recorded automatically",
  },
  {
    icon: "📱",
    title: "SMS Updates",
    text: "We'll notify you of your progress",
  },
  {
    icon: "🎂",
    title: "Birthday Treats",
    text: "Special surprise on your birthday",
  },
  {
    icon: "🔄",
    title: "Never Expires",
    text: "Keep earning rewards forever",
  },
];

const JoinHowItWorks = ({
  campaign,
  streakLength,
  theme,
}: {
  campaign: PublicLoyaltyProgram | undefined;
  streakLength: number;
  theme: LoyaltyTheme;
}) => (
  <>
    <section className="text-center">
      <span className="text-xs font-bold" style={{ color: theme.qrFg }}>
        💡 How It Works
      </span>
      <h2 className="mt-2 text-xl font-extrabold text-grey-1 sm:text-2xl">
        Earn Rewards Every Time You Visit
      </h2>
      <p className="mt-1 text-sm text-grey-3">
        Complete the streak, earn the reward — then do it all over again!
      </p>
    </section>

    {/* Visit streak — only meaningful when the programme counts visits. */}
    {streakLength > 0 && (
      <section
        className="mt-6 rounded-2xl p-5"
        style={{ backgroundColor: theme.deep }}
      >
        <p
          className="text-[10px] font-bold uppercase tracking-widest"
          style={{ color: theme.base }}
        >
          Visit Streak
        </p>
        <ol className="mt-4 space-y-3">
          {Array.from({ length: Math.max(streakLength - 1, 0) }, (_, i) => (
            <li key={i} className="flex items-center gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/10 text-sm font-extrabold text-white">
                {i + 1}
              </span>
              <span className="text-sm font-medium text-white/80">
                Visit {i + 1}
              </span>
            </li>
          ))}
          {/* Wraps on a phone — the reward pill after the label overflows a
              360px row otherwise. */}
          <li className="flex flex-wrap items-center gap-x-3 gap-y-2">
            <span
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-base"
              style={{ backgroundColor: theme.base }}
            >
              🎁
            </span>
            <span className="text-sm font-extrabold text-white">
              Get Rewarded!
            </span>
            <span
              className="inline-flex items-center justify-center rounded-full px-2.5 py-1 text-[11px] font-extrabold leading-none"
              style={{ backgroundColor: theme.base, color: theme.onBase }}
            >
              {campaign?.reward_summary ?? "A reward"}
            </span>
          </li>
        </ol>
      </section>
    )}

    <section className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
      {FEATURES.map((feature) => (
        <div
          key={feature.title}
          className="rounded-2xl border border-grey-5 bg-white p-4"
        >
          <div className="text-xl" aria-hidden>
            {feature.icon}
          </div>
          <p className="mt-2 text-sm font-extrabold text-grey-1">
            {feature.title}
          </p>
          <p className="mt-0.5 text-xs text-grey-3">{feature.text}</p>
        </div>
      ))}
    </section>
  </>
);

export default JoinHowItWorks;

"use client";

import type { PublicLoyaltyProgram } from "@/types/loyalty";
import type { LoyaltyTheme } from "@/utils/storeTheme";

const JoinHero = ({
  campaign,
  canGoBack,
  theme,
}: {
  campaign: PublicLoyaltyProgram | undefined;
  canGoBack: boolean;
  theme: LoyaltyTheme;
}) => (
  // deep, not base: this is a full-bleed panel behind white text, and a mid
  // brand colour behind white would fail contrast on the paler themes.
  <header
    className="relative px-4 pb-24 pt-6"
    style={{ backgroundColor: theme.deep }}
  >
    {/* Public page — a customer arrives here by scanning, so there may be no
        history to go back to. Only render Back when there is. */}
    {canGoBack && (
      <button
        onClick={() => window.history.back()}
        className="mb-4 flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-bold text-white/70 hover:bg-white/10 hover:text-white cursor-pointer"
      >
        <span aria-hidden>←</span>
        Back
      </button>
    )}

    <div className="mx-auto max-w-3xl text-center">
      <span className="inline-flex max-w-full items-center gap-2 rounded-full bg-white/10 py-1 pl-1 pr-3 text-xs font-bold text-white">
        {campaign?.business_logo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={campaign.business_logo}
            alt=""
            className="h-6 w-6 shrink-0 rounded-full bg-white object-contain"
          />
        ) : (
          <span className="pl-2" aria-hidden>
            🏪
          </span>
        )}
        <span className="truncate">{campaign?.business_name ?? "Our Store"}</span>
      </span>

      <div className="mt-6 text-4xl" aria-hidden>
        🎁
      </div>
      <h1 className="mt-2 text-2xl font-extrabold text-white sm:text-4xl">
        {campaign?.name ?? "Loyalty Rewards"}
      </h1>

      {/* max-w-full so a long reward line wraps instead of widening the page. */}
      <div className="mx-auto mt-5 w-fit max-w-full rounded-2xl bg-white/10 px-5 py-4 sm:px-8">
        <p
          className="text-[10px] font-bold uppercase tracking-widest"
          style={{ color: theme.base }}
        >
          Your Reward
        </p>
        <p className="mt-1 text-xl font-extrabold text-white sm:text-2xl">
          {campaign?.reward_summary ?? "A reward"}
        </p>
        <p className="mt-0.5 text-[11px] text-white/60">
          {campaign?.trigger_summary ?? "Complete the streak"}
        </p>
      </div>
    </div>
  </header>
);

export default JoinHero;

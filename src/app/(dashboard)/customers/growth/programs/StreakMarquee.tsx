"use client";

import { cn } from "@/lib/utils";
import type { TopStreakPerformer } from "@/types/loyalty";
import StreakCard from "./StreakCard";

/**
 * Speed is per-card rather than fixed, so a long leaderboard doesn't whip past
 * faster than a short one.
 */
const SECONDS_PER_CARD = 6;

/**
 * Shown while the dashboard request is in flight. Mirrors the real card's
 * shape so the strip does not jump when data lands, and — more importantly —
 * means an empty state never flashes up on a business that does have streaks.
 */
export const StreakSkeleton = () => (
  <div className="flex gap-3">
    {[0, 1, 2].map((i) => (
      <div
        key={i}
        className={cn(
          "w-[280px] shrink-0 rounded-xl border border-white/10 bg-white/[0.06] p-3.5",
          // Third card is desktop-only, matching how many fit on the strip.
          i === 2 && "hidden lg:block",
          i === 1 && "hidden sm:block",
        )}
      >
        <div className="mb-3 flex items-center gap-2">
          <div className="h-7 w-7 shrink-0 animate-pulse rounded-full bg-white/15" />
          <div className="min-w-0 flex-1 space-y-1.5">
            <div className="h-3 w-24 animate-pulse rounded bg-white/15" />
            <div className="h-2 w-12 animate-pulse rounded bg-white/10" />
          </div>
        </div>
        <div className="h-5 w-28 animate-pulse rounded bg-white/15" />
        <div className="mt-2.5 h-1.5 w-full animate-pulse rounded-full bg-white/10" />
      </div>
    ))}
  </div>
);

/**
 * Streak leaderboard as a slow marquee.
 *
 * No scroll container anywhere — the track is a CSS animation inside an
 * overflow-hidden viewport, so nothing can produce a scrollbar. The list is
 * rendered twice and the track slides exactly -50%, which puts the second copy
 * where the first started and makes the loop seamless. Hovering pauses it;
 * reduced-motion users get a static row.
 */
const StreakMarquee = ({
  performers,
}: {
  performers: TopStreakPerformer[];
}) => {
  if (performers.length === 0) {
    return (
      <p className="py-6 text-center text-xs text-white/50">
        No streaks yet — they appear once customers start returning.
      </p>
    );
  }

  const duration = `${performers.length * SECONDS_PER_CARD}s`;

  return (
    <div className="marquee-viewport relative w-full overflow-hidden">
      {/* One invisible card, in flow, purely to give the viewport its height —
          the animated track can't do that job now that it is absolute. */}
      <div className="invisible w-[280px] px-1.5" aria-hidden>
        <StreakCard performer={performers[0]} />
      </div>

      {/* The track is ABSOLUTE, and that is the entire fix. An out-of-flow
          element contributes nothing to any ancestor's width, so a
          width:max-content track cannot stretch the page no matter what the
          flex ancestors do. Leaving it in normal flow and trying to contain it
          with min-w-0 / max-w-full / overflow-hidden is what made the page
          scroll sideways. */}
      <div
        className="marquee-track absolute inset-y-0 left-0 flex"
        style={{ ["--marquee-duration" as string]: duration }}
      >
        {/* Rendered twice: the first copy scrolls out as the second scrolls in.
            The duplicate is decorative, so it is hidden from screen readers. */}
        {[0, 1].map((copy) => (
          <div key={copy} className="flex" aria-hidden={copy === 1}>
            {performers.map((performer) => (
              <div
                key={`${copy}-${performer.id}`}
                className="w-[280px] shrink-0 px-1.5"
              >
                <StreakCard performer={performer} />
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Soft edges so cards fade in and out rather than being cut off. */}
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-8 bg-gradient-to-r from-primary-green-100 to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-8 bg-gradient-to-l from-primary-green-100 to-transparent" />
    </div>
  );
};

export default StreakMarquee;

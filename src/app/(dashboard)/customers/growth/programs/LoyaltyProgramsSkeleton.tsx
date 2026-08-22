"use client";

import { Skeleton } from "@/components/ui/skeleton";

/**
 * Mirrors the loaded tab — three stat cards, the streak strip, two campaign
 * cards — so nothing jumps when the data lands. Campaign cards are tall, and
 * without a placeholder the tab collapsed to the header and then pushed the
 * page down as rows arrived.
 */
export const CampaignCardSkeleton = () => (
  <div className="overflow-hidden rounded-2xl border border-grey-5 bg-white">
    <div className="flex items-start justify-between gap-3 p-4 sm:p-5">
      <div className="flex min-w-0 flex-1 items-start gap-3">
        <Skeleton className="h-9 w-9 shrink-0 rounded-lg bg-grey-5" />
        <div className="min-w-0 flex-1 space-y-2">
          <Skeleton className="h-4 w-40 bg-grey-5" />
          <Skeleton className="h-3 w-56 max-w-full bg-grey-5" />
        </div>
      </div>
      <Skeleton className="h-6 w-16 shrink-0 rounded-full bg-grey-5" />
    </div>

    <div className="grid grid-cols-4 divide-x divide-grey-5 border-y border-grey-5">
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className="flex flex-col items-center gap-1.5 py-3">
          <Skeleton className="h-4 w-8 bg-grey-5" />
          <Skeleton className="h-2.5 w-12 bg-grey-5" />
        </div>
      ))}
    </div>

    <div className="px-4 py-3 sm:px-5">
      <Skeleton className="h-9 w-full bg-grey-5" />
    </div>

    <div className="flex items-center justify-between gap-3 p-4 sm:p-5">
      <div className="flex gap-4">
        <Skeleton className="h-3 w-10 bg-grey-5" />
        <Skeleton className="h-3 w-10 bg-grey-5" />
        <Skeleton className="h-3 w-20 bg-grey-5" />
      </div>
      <Skeleton className="h-8 w-32 rounded-full bg-grey-5" />
    </div>
  </div>
);

const LoyaltyProgramsSkeleton = () => (
  <div className="w-full min-w-0 space-y-4">
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      {[0, 1, 2].map((i) => (
        <Skeleton key={i} className="h-[104px] rounded-2xl bg-grey-5" />
      ))}
    </div>
    <Skeleton className="h-[190px] w-full rounded-2xl bg-grey-5" />
    <CampaignCardSkeleton />
    <CampaignCardSkeleton />
  </div>
);

export default LoyaltyProgramsSkeleton;

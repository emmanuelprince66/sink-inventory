"use client";

import { StatCardSkeleton } from "@/components/app/StatCardSkeleton";
import { Skeleton } from "@/components/ui/skeleton";

const SkeletonComp = () => {
  return (
    <div className="w-full pb-4 sm:pb-8">
      {/* First Row - 4 cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* First 3 are plain KPI tiles — same shape used everywhere else
            (Orders/Inventory/Sales). "Top Customer" keeps its own shape
            below since it's an avatar+name card, not a number tile. */}
        <StatCardSkeleton className="border border-border-tint" />
        <StatCardSkeleton className="border border-border-tint" />
        <StatCardSkeleton className="border border-border-tint" />

        {/* Top Customer Skeleton */}
        <div className="p-6 rounded-2xl border border-border-tint bg-white">
          <div className="flex flex-col gap-2 items-start">
            <Skeleton className="h-4 w-[100px] bg-grey-5" />
            <div className="flex items-center gap-3 w-full">
              <Skeleton className="w-10 h-10 rounded-full bg-grey-5" />
              <div className="flex flex-col gap-1">
                <Skeleton className="h-4 w-[120px] bg-grey-5" />
                <Skeleton className="h-3 w-[80px] bg-grey-5" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Second Row - Single card */}
      <div className="grid grid-cols-1 gap-4">
        <div className="p-6 rounded-2xl border border-border-tint bg-white">
          <div className="h-full flex flex-col">
            <Skeleton className="h-6 w-[180px] mb-4 bg-grey-5" />
            <div className="flex-grow h-[300px] flex items-center justify-center">
              <Skeleton className="h-[250px] w-[250px] rounded-full bg-grey-5" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SkeletonComp;

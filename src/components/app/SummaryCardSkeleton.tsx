import { Skeleton } from "@/components/ui/skeleton";

export const SummaryCardSkeleton = () => (
  <div className="bg-grey-6 rounded-2xl p-4 sm:p-5 flex items-center gap-4">
    <Skeleton className="h-11 w-11 rounded-full bg-grey-5 flex-shrink-0" />
    <div className="flex-1">
      <Skeleton className="h-3.5 w-24 bg-grey-5" />
      <Skeleton className="h-7 w-20 mt-2 bg-grey-5" />
    </div>
  </div>
);

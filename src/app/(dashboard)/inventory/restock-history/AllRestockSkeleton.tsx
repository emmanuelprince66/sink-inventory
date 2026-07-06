import { Skeleton } from "@/components/ui/skeleton";

export const RestockHistorySkeleton = () => {
  return (
    <div className="w-full flex flex-col gap-6">
      <div className="space-y-2">
        <Skeleton className="h-7 w-48 rounded-lg bg-grey-6" />
        <Skeleton className="h-4 w-64 rounded-lg bg-grey-6" />
      </div>

      {/* Summary Cards Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl">
        <Skeleton className="h-20 w-full rounded-2xl bg-grey-6" />
        <Skeleton className="h-20 w-full rounded-2xl bg-grey-6" />
      </div>

      {/* Main Content Card Skeleton */}
      <div className="bg-white rounded-2xl border border-grey-5 overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-grey-5">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            <Skeleton className="h-5 w-32 rounded bg-grey-6" />
            <div className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto">
              <Skeleton className="h-9 w-full sm:w-56 rounded-lg bg-grey-6" />
              <Skeleton className="h-9 w-full sm:w-40 rounded-lg bg-grey-6" />
              <Skeleton className="h-9 w-full sm:w-36 rounded-lg bg-grey-6" />
              <Skeleton className="h-9 w-full sm:w-36 rounded-lg bg-grey-6" />
            </div>
          </div>
        </div>

        <div className="p-4 space-y-4">
          {/* Table Header */}
          <div className="hidden md:grid grid-cols-7 gap-4 pb-3 border-b border-grey-6">
            {Array.from({ length: 7 }).map((_, index) => (
              <Skeleton key={index} className="h-4 w-20 rounded bg-grey-6" />
            ))}
          </div>

          {/* Table Rows */}
          {Array.from({ length: 5 }).map((_, index) => (
            <div
              key={index}
              className="grid grid-cols-1 md:grid-cols-7 gap-3 py-4 border-b border-grey-6 last:border-0 items-center"
            >
              <div className="space-y-1">
                <Skeleton className="h-4 w-full max-w-[140px] rounded bg-grey-6" />
                <Skeleton className="h-3 w-20 rounded md:hidden bg-grey-6" />
              </div>
              <Skeleton className="h-4 w-20 rounded hidden md:block bg-grey-6" />
              <div className="flex justify-between md:block">
                <Skeleton className="h-6 w-16 rounded-full md:hidden bg-grey-6" />
                <Skeleton className="h-6 w-16 rounded-full hidden md:block bg-grey-6" />
              </div>
              <Skeleton className="h-4 w-24 rounded hidden md:block bg-grey-6" />
              <div className="flex items-center gap-2">
                <Skeleton className="h-8 w-8 rounded-full bg-grey-6" />
                <Skeleton className="h-4 w-24 rounded hidden md:block bg-grey-6" />
              </div>
              <Skeleton className="h-4 w-32 rounded hidden md:block bg-grey-6" />
              <div className="flex justify-end md:justify-start">
                <Skeleton className="h-8 w-8 rounded-full bg-grey-6" />
              </div>
            </div>
          ))}
        </div>

        {/* Pagination Skeleton */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 p-4 border-t border-grey-6">
          <Skeleton className="h-4 w-48 rounded bg-grey-6" />
          <div className="flex gap-2">
            <Skeleton className="h-8 w-8 rounded-lg bg-grey-6" />
            <Skeleton className="h-8 w-8 rounded-lg bg-grey-6" />
            <Skeleton className="h-8 w-8 rounded-lg bg-grey-6" />
          </div>
        </div>
      </div>
    </div>
  );
};

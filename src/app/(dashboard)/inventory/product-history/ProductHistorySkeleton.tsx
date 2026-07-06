import { Skeleton } from "@/components/ui/skeleton";

export const ProductHistorySkeleton = () => {
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
        {/* Tabs */}
        <div className="border-b border-grey-5 px-4 sm:px-6 flex items-center gap-6 py-4">
          <Skeleton className="h-5 w-20 rounded bg-grey-6" />
          <Skeleton className="h-5 w-20 rounded bg-grey-6" />
          <Skeleton className="h-5 w-24 rounded bg-grey-6" />
        </div>

        {/* Toolbar */}
        <div className="p-4 sm:p-6 border-b border-grey-5">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            <Skeleton className="h-5 w-32 rounded bg-grey-6" />
            <div className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto">
              <Skeleton className="h-9 w-full sm:w-48 rounded-lg bg-grey-6" />
              <Skeleton className="h-9 w-full sm:w-40 rounded-lg bg-grey-6" />
              <Skeleton className="h-9 w-full sm:w-20 rounded-lg bg-grey-6" />
            </div>
          </div>
        </div>

        <div className="p-4 space-y-4">
          {/* Table Header */}
          <div className="hidden md:grid grid-cols-8 gap-4 pb-3 border-b border-grey-6">
            {Array.from({ length: 8 }).map((_, index) => (
              <Skeleton key={index} className="h-4 w-20 rounded bg-grey-6" />
            ))}
          </div>

          {/* Table Rows */}
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="grid grid-cols-1 md:grid-cols-8 gap-3 py-4 border-b border-grey-6 last:border-0 items-center"
            >
              <div>
                <Skeleton className="h-4 w-24 rounded mb-1 bg-grey-6" />
                <Skeleton className="h-3 w-12 rounded bg-grey-6" />
              </div>
              <Skeleton className="h-6 w-20 rounded-full bg-grey-6" />
              <Skeleton className="h-6 w-16 rounded-full bg-grey-6" />
              <Skeleton className="h-4 w-12 rounded bg-grey-6" />
              <Skeleton className="h-4 w-20 rounded bg-grey-6" />
              <div className="flex items-center gap-2">
                <Skeleton className="h-7 w-7 rounded-full bg-grey-6" />
                <Skeleton className="h-4 w-24 rounded bg-grey-6" />
              </div>
              <Skeleton className="h-4 w-16 rounded bg-grey-6" />
              <div>
                <Skeleton className="h-4 w-24 rounded mb-1 bg-grey-6" />
                <Skeleton className="h-3 w-12 rounded bg-grey-6" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

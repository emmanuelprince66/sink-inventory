import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export const ProductHistorySkeleton = () => {
  return (
    <div className="min-h-screen bg-slate-50/50 pb-12">
      {/* Header Skeleton */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="space-y-2">
              <Skeleton className="h-8 w-48 rounded-lg" />
              <Skeleton className="h-4 w-64 rounded-lg" />
            </div>
            <Skeleton className="h-10 w-32 rounded-full hidden sm:block" />
          </div>
        </div>
      </div>

      <div className="max-w-full mx-auto px-4 sm:px-6 py-8 space-y-6">
        {/* Tabs Skeleton */}
        <div className="flex gap-2">
          <Skeleton className="h-10 w-32 rounded-lg" />
          <Skeleton className="h-10 w-32 rounded-lg" />
          <Skeleton className="h-10 w-36 rounded-lg" />
        </div>

        {/* Table Card Skeleton */}
        <Card className="shadow-sm border-0 ring-1 ring-slate-200/60 overflow-hidden">
          <CardHeader className="bg-white border-b border-slate-100 py-4 px-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Skeleton className="h-5 w-32 rounded" />
                <Skeleton className="h-5 w-12 rounded-full" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="p-4 space-y-4">
              {/* Table Header */}
              <div className="hidden md:grid grid-cols-8 gap-4 pb-3 border-b border-slate-100">
                {Array.from({ length: 8 }).map((_, index) => (
                  <Skeleton key={index} className="h-4 w-20 rounded" />
                ))}
              </div>

              {/* Table Rows */}
              {Array.from({ length: 6 }).map((_, index) => (
                <div
                  key={index}
                  className="grid grid-cols-1 md:grid-cols-8 gap-3 py-4 border-b border-slate-50 last:border-0 items-center"
                >
                  <div>
                    <Skeleton className="h-4 w-24 rounded mb-1" />
                    <Skeleton className="h-3 w-12 rounded" />
                  </div>
                  <Skeleton className="h-6 w-20 rounded-full" />
                  <Skeleton className="h-6 w-16 rounded-full" />
                  <Skeleton className="h-4 w-12 rounded" />
                  <Skeleton className="h-4 w-20 rounded" />
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-7 w-7 rounded-full" />
                    <Skeleton className="h-4 w-24 rounded" />
                  </div>
                  <Skeleton className="h-4 w-16 rounded" />
                  <div>
                    <Skeleton className="h-4 w-24 rounded mb-1" />
                    <Skeleton className="h-3 w-12 rounded" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

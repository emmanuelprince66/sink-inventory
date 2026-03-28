import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export const RestockHistorySkeleton = () => {
  return (
    <div className="min-h-screen bg-slate-50/50 pb-12">
      {/* Header Skeleton */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="space-y-2">
              <Skeleton className="h-8 w-48 rounded-lg" />
              <Skeleton className="h-4 w-64 rounded-lg" />
            </div>
            <Skeleton className="h-10 w-32 rounded-full hidden sm:block" />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Mobile Stats Skeleton */}
        <div className="sm:hidden grid grid-cols-2 gap-3">
          <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100">
            <Skeleton className="h-3 w-20 mb-2 rounded" />
            <Skeleton className="h-8 w-16 rounded-lg" />
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100">
            <Skeleton className="h-3 w-20 mb-2 rounded" />
            <Skeleton className="h-8 w-16 rounded-lg" />
          </div>
        </div>

        {/* Filters Card Skeleton */}
        <Card className="shadow-sm border-0 ring-1 ring-slate-200/60 overflow-hidden">
          <CardHeader className="bg-slate-50/80 border-b border-slate-100 py-4 px-5">
            <div className="flex items-center gap-2">
              <Skeleton className="h-8 w-8 rounded-lg" />
              <Skeleton className="h-5 w-20 rounded" />
              <Skeleton className="h-5 w-5 rounded-full ml-2" />
            </div>
          </CardHeader>
          <CardContent className="p-5 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
              <Skeleton className="h-11 md:col-span-5 rounded-lg" />
              <Skeleton className="h-11 md:col-span-4 rounded-lg" />
              <Skeleton className="h-11 md:col-span-3 rounded-lg" />
            </div>
            <div className="flex gap-2 pt-2 border-t border-slate-100">
              <Skeleton className="h-10 w-28 rounded-lg" />
              <Skeleton className="h-10 w-24 rounded-lg" />
            </div>
          </CardContent>
        </Card>

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
              <div className="hidden md:grid grid-cols-7 gap-4 pb-3 border-b border-slate-100">
                <Skeleton className="h-4 w-24 rounded" />
                <Skeleton className="h-4 w-16 rounded" />
                <Skeleton className="h-4 w-20 rounded" />
                <Skeleton className="h-4 w-24 rounded" />
                <Skeleton className="h-4 w-28 rounded" />
                <Skeleton className="h-4 w-32 rounded" />
                <Skeleton className="h-4 w-16 rounded" />
              </div>

              {/* Table Rows */}
              {Array.from({ length: 5 }).map((_, index) => (
                <div
                  key={index}
                  className="grid grid-cols-1 md:grid-cols-7 gap-3 py-4 border-b border-slate-50 last:border-0 items-center"
                >
                  <div className="space-y-1">
                    <Skeleton className="h-4 w-full max-w-[140px] rounded" />
                    <Skeleton className="h-3 w-20 rounded md:hidden" />
                  </div>
                  <Skeleton className="h-4 w-20 rounded hidden md:block" />
                  <div className="flex justify-between md:block">
                    <Skeleton className="h-6 w-16 rounded-full md:hidden" />
                    <Skeleton className="h-6 w-16 rounded-full hidden md:block" />
                  </div>
                  <Skeleton className="h-4 w-24 rounded hidden md:block" />
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <Skeleton className="h-4 w-24 rounded hidden md:block" />
                  </div>
                  <Skeleton className="h-4 w-32 rounded hidden md:block" />
                  <div className="flex justify-end md:justify-start">
                    <Skeleton className="h-8 w-8 rounded-full" />
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination Skeleton */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 p-4 border-t border-slate-100 bg-slate-50/30">
              <Skeleton className="h-4 w-48 rounded" />
              <div className="flex gap-2">
                <Skeleton className="h-8 w-8 rounded-lg" />
                <Skeleton className="h-8 w-8 rounded-lg" />
                <Skeleton className="h-8 w-8 rounded-lg" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

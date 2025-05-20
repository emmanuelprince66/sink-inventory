"use client";

import { Skeleton } from "@/components/ui/skeleton";

const SkeletonComp = () => {
  return (
    <div className="w-full px-4 py-8">
      {/* First Row - 4 cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Total Customers Skeleton */}
        <div className="p-6 rounded-xl border border-gray-200 shadow-sm bg-[#FEFFFE]">
          <div className="flex flex-col gap-2 items-start">
            <Skeleton className="h-4 w-[100px] bg-[#eef4ef]" />
            <Skeleton className="h-6 w-[80px] bg-[#eef4ef]" />
          </div>
        </div>

        {/* New Customers Skeleton */}
        <div className="p-6 rounded-xl border border-gray-200 shadow-sm bg-[#FEFFFE]">
          <div className="flex flex-col gap-2 items-start">
            <Skeleton className="h-4 w-[100px] bg-[#eef4ef]" />
            <Skeleton className="h-6 w-[80px] bg-[#eef4ef]" />
            <Skeleton className="h-3 w-[120px] bg-[#eef4ef]" />
          </div>
        </div>

        {/* Returning Customers Skeleton */}
        <div className="p-6 rounded-xl border border-gray-200 shadow-sm bg-[#FEFFFE]">
          <div className="flex flex-col gap-2 items-start">
            <Skeleton className="h-4 w-[130px] bg-[#eef4ef]" />
            <Skeleton className="h-6 w-[80px] bg-[#eef4ef]" />
            <Skeleton className="h-3 w-[100px] bg-[#eef4ef]" />
          </div>
        </div>

        {/* Top Customer Skeleton */}
        <div className="p-6 rounded-xl border border-gray-200 shadow-sm bg-[#FEFFFE]">
          <div className="flex flex-col gap-2 items-start">
            <Skeleton className="h-4 w-[100px] bg-[#eef4ef]" />
            <div className="flex items-center gap-3 w-full">
              <Skeleton className="w-10 h-10 rounded-full bg-[#eef4ef]" />
              <div className="flex flex-col gap-1">
                <Skeleton className="h-4 w-[120px] bg-[#eef4ef]" />
                <Skeleton className="h-3 w-[80px] bg-[#eef4ef]" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Second Row - Single card */}
      <div className="grid grid-cols-1 gap-4">
        <div className="p-6 rounded-xl border border-gray-200 shadow-sm bg-[#FEFFFE]">
          <div className="h-full flex flex-col">
            <Skeleton className="h-6 w-[180px] mb-4 bg-[#eef4ef]" />
            <div className="flex-grow h-[300px] flex items-center justify-center">
              <Skeleton className="h-[250px] w-[250px] rounded-full bg-[#eef4ef]" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SkeletonComp;

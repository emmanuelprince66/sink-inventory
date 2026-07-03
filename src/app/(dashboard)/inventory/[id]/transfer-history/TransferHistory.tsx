"use client";
import { Skeleton } from "@/components/ui/skeleton";
import { useProductHook } from "@/hooks/useProductHook";
import { ArrowLeft } from "lucide-react";
import TransferData from "./TransferData";
const TransferHistory = ({ id }: { id: string }) => {
  const { TransferHistoryData, TransferHistoryLoading } = useProductHook({
    id,
  });
  return (
    <div className="px-4 py-6 w-full flex flex-col gap-6">
      <div className="flex items-center gap-2 sm:gap-4">
        <button
          onClick={() => window.history.back()}
          className="flex items-center gap-1.5 mr-4 px-3 py-2 rounded-lg border border-grey-5 text-sm font-bold text-grey-2 hover:bg-grey-6 hover:border-grey-4 cursor-pointer transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="hidden sm:inline">Back</span>
        </button>
        <h1 className="text-xl ml-3 sm:text-2xl font-extrabold text-grey-1">
          Transfer History
        </h1>
      </div>

      <div className="bg-white rounded-2xl border border-grey-5 overflow-hidden">
        {TransferHistoryLoading || !TransferHistoryData ? (
          <div className="w-full p-4 sm:p-6">
            <div className="space-y-4">
              <Skeleton className="h-10 w-full bg-grey-6" />
              {Array.from({ length: 5 }).map((_, index) => (
                <Skeleton key={index} className="h-16 w-full bg-grey-6 mt-2" />
              ))}
            </div>
          </div>
        ) : (
          <TransferData
            TransferHistoryData={TransferHistoryData}
            TransferHistoryLoading={TransferHistoryLoading}
          />
        )}
      </div>
    </div>
  );
};

export default TransferHistory;

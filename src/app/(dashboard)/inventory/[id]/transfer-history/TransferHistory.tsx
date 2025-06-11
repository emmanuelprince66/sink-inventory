"use client";
import { Skeleton } from "@/components/ui/skeleton";
import { useProductHook } from "@/hooks/useProductHook";
import TransferData from "./TransferData";
const TransferHistory = ({ id }: { id: string }) => {
  const { TransferHistoryData, TransferHistoryLoading } = useProductHook({
    id,
  });
  console.log("id", id);
  return (
    <div className="container px-4">
      <div className="flex w-full justify-between items-center">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">
          Transfer History
        </h1>
        {/* <Button onClick={handleOpenRestockModal}>Restock</Button> */}
      </div>

      {TransferHistoryLoading || !TransferHistoryData ? (
        <div className="w-full">
          <div className="space-y-4">
            <Skeleton className="h-10 w-full bg-[#eef4ef]" />
            {Array.from({ length: 5 }).map((_, index) => (
              <Skeleton key={index} className="h-16 w-full bg-[#eef4ef] mt-2" />
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
  );
};

export default TransferHistory;

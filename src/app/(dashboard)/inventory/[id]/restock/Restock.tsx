"use client";

import { CustomModal } from "@/components/app/CustomModal";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetRestockHistory } from "@/hooks/useGetRestockHistory";
import { useState } from "react";
import RestockHistoryData from "./RestockHistoryData";
import RestockItem from "./RestockItem";

const Restock = ({ id }: { id: any }) => {
  const { restockHistory, restockHistoryLoading } = useGetRestockHistory({
    id,
  });
  const [openRestockModal, setOpenRestockModal] = useState(false);
  const closeRestockModal = () => setOpenRestockModal(false);
  const handleOpenRestockModal = () => setOpenRestockModal(true);

  console.log("restockHistory", restockHistory);
  return (
    <div className="container mx-auto px-4 ">
      <div className="flex w-full justify-between items-center">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">
          Restock History
        </h1>
        {/* <Button onClick={handleOpenRestockModal}>Restock</Button> */}
      </div>

      {restockHistoryLoading || !restockHistory ? (
        <div className="w-full">
          <div className="space-y-4">
            <Skeleton className="h-10 w-full bg-[#eef4ef]" />
            {Array.from({ length: 5 }).map((_, index) => (
              <Skeleton key={index} className="h-16 w-full bg-[#eef4ef] mt-2" />
            ))}
          </div>
        </div>
      ) : (
        <RestockHistoryData
          RestockHistoryData={restockHistory}
          restockHistoryLoading={restockHistoryLoading}
        />
      )}

      {/* modal to add supply */}
      <CustomModal
        isOpen={openRestockModal}
        onClose={closeRestockModal}
        trigger={false}
        title="Restock Product"
      >
        <div className="w-full ">
          <RestockItem closeModal={closeRestockModal} />
        </div>
      </CustomModal>
    </div>
  );
};

export default Restock;

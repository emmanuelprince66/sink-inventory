"use client";

import { CustomModal } from "@/components/app/CustomModal";
import { Button } from "@/components/ui/button";
import { useGetRestockHistory } from "@/hooks/useGetRestockHistory";
import { useState } from "react";
import RestockItem from "./RestockItem";

const Restock = ({ id }: { id: any }) => {
  const { restockHistory } = useGetRestockHistory({ id });
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
        <Button onClick={handleOpenRestockModal}>Restock</Button>
      </div>

      {/* modal to add supply */}
      <CustomModal
        isOpen={openRestockModal}
        onClose={closeRestockModal}
        trigger={false}
        title="Restock Product"
      >
        <div className="w-full ">
          <RestockItem />
        </div>
      </CustomModal>
    </div>
  );
};

export default Restock;

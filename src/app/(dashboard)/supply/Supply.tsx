"use client";

import { Plus } from "lucide-react";

import { CustomCard } from "@/components/app/CustomCard";
import { CustomModal } from "@/components/app/CustomModal";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useSupplyHook } from "@/hooks/useSupplyHook";
import { cn } from "@/lib/utils";

import AddSupplier from "./AddSupplier";
import AllSupply from "./AllSupply";

interface SupplierCardData {
  title: string;
  amount: number | string;
}

const CustomSupplyCard = ({ title, amount }: SupplierCardData) => {
  const isDebtCard = title === "Total Debt";

  return (
    <CustomCard
      className={cn(
        "w-full",
        isDebtCard
          ? "bg-red-100 border-red-300"
          : "bg-primary-green-200 border-primary-green-300"
      )}
    >
      <div className="flex flex-col gap-6 items-start">
        <p className="font-[500] text-sm text-primary-black-100">{title}</p>
        <p
          className={`font-[600] text-xl ${
            isDebtCard ? "text-red-600" : "text-primary-black-100"
          }`}
        >
          {amount}
        </p>
      </div>
    </CustomCard>
  );
};

const Supply = () => {
  const {
    openAddSupplyModal,
    handleRowClick,
    closeOpenSupplyModal,
    openSupplyModalFunc,
    SupplierData,
    SupplierLoading,
  } = useSupplyHook();
  console.log("supplier data", SupplierData);

  return (
    <div className="w-full h-full flex flex-col justify-start gap-5 items-start">
      <div className="flex items-center justify-between w-full">
        <div className="flex justify-between items-center w-full">
          <p className="text-2xl md:text-3xl text-primary-black-100 font-[500]">
            Supplier
          </p>

          <div
            className="text-[14px] md:text-[20px]"
            onClick={openSupplyModalFunc}
          >
            <Button className="flex items-center py-0 md:py-[25px]">
              <Plus />
              Add Supplier
            </Button>
          </div>
        </div>
      </div>

      {SupplierLoading ? (
        <>
          {/* Skeleton for cards */}
          <div className="w-1/2 grid grid-cols-1 md:grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, index) => (
              <CustomCard key={index} className="w-full border-gray-200">
                <div className="flex flex-col gap-6 items-start">
                  <Skeleton className="h-4 w-[100px] bg-[#eef4ef]" />
                  <Skeleton className="h-6 w-[70px] bg-[#eef4ef]" />
                </div>
              </CustomCard>
            ))}
          </div>

          {/* Skeleton for AllSupply table */}
          <div className="w-full">
            <div className="space-y-4">
              <Skeleton className="h-10 w-full bg-[#eef4ef]" />
              {Array.from({ length: 5 }).map((_, index) => (
                <Skeleton
                  key={index}
                  className="h-16 w-full bg-[#eef4ef] mt-2"
                />
              ))}
            </div>
          </div>
        </>
      ) : (
        <>
          {/* Cards container */}
          <div className="w-1/2 grid grid-cols-1 md:grid-cols-3 gap-4">
            <CustomSupplyCard
              title={"Total Wallet Balance"}
              amount={SupplierData?.data?.results?.wallet_balance}
            />
            <CustomSupplyCard
              title={"Total Debt"}
              amount={SupplierData?.data?.results?.debt}
            />
            <CustomSupplyCard
              title={"Total suppliers"}
              amount={SupplierData?.data?.results?.supplier_count}
            />
          </div>

          {/* content */}
          <AllSupply
            SupplierData={SupplierData}
            SupplierLoading={SupplierLoading}
            handleRowClick={handleRowClick}
          />
        </>
      )}

      {/* modal to add supply */}
      <CustomModal
        isOpen={openAddSupplyModal}
        onClose={closeOpenSupplyModal}
        trigger={false}
        title="Add Supplier"
        description=""
      >
        <div className="w-full">
          <AddSupplier />
        </div>
      </CustomModal>
    </div>
  );
};

export default Supply;

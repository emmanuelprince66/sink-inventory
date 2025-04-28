"use client";
import { CustomCard } from "@/components/app/CustomCard";
import { CustomModal } from "@/components/app/CustomModal";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useFetchSingleSupplyHook } from "@/hooks/useFetchSingleSupplyHook";
import { cn } from "@/lib/utils";
import { Plus } from "lucide-react";
import { useEffect, useState } from "react";
import SupplyHistory from "./SupplyHistory";
import UpdateBalance from "./UpdateBalance";

interface SupplierCardData {
  title: string;
  amount: number;
}

const CustomSupplyCard = ({ title, amount }: SupplierCardData) => {
  const isDebtCard = amount < 0;
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
            isDebtCard ? "text-red-600" : "text-primary-black-10"
          } `}
        >
          {amount}
        </p>
      </div>
    </CustomCard>
  );
};

const SupplierById = ({ id }: { id: string }) => {
  const {
    SupplierByIdData,
    SupplierByIdLoading,
    openUpdateSupplyModalFunc,
    closeUpdateSupplyWalletModal,
    openUpdateSupplyWalletModal,

    handleSupplyHistoryRowClick,
  } = useFetchSingleSupplyHook(id);
  const [purchaseValue, setPurchaseValue] = useState<any>();

  console.log("supplierById---6", SupplierByIdData);

  console.log("iddd", id);

  useEffect(() => {
    if (SupplierByIdData) {
      const totalPurchaseValue = SupplierByIdData?.data?.supply_history?.reduce(
        (sum: any, item: any) => sum + (item.cost_price || 0),
        0
      );
      setPurchaseValue(totalPurchaseValue);
      console.log("Total Purchase Value:", totalPurchaseValue);
    }
  }, [SupplierByIdData]);
  return (
    <div className="w-full h-full flex flex-col justify-start gap-5 items-start">
      {SupplierByIdLoading || !SupplierByIdData ? (
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

          {/* Skeleton for search */}
          <div className="w-1/2">
            <Skeleton className="h-40 w-full bg-[#eef4ef]" />
          </div>

          {/* Skeleton for AllCustomers table */}
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
          {/* cards container */}
          <div className="flex justify-between items-start w-full">
            <div className="w-1/2 grid grid-cols-1 md:grid-cols-3 gap-4">
              <CustomSupplyCard
                title={"Purchase Value"}
                amount={purchaseValue}
              />
              <CustomSupplyCard
                title={"Wallet Balance"}
                amount={SupplierByIdData?.data?.wallet}
              />
              <CustomSupplyCard
                title={"Total Supplies"}
                amount={SupplierByIdData?.data?.supply_history?.length}
              />

              <SupplyHistory
                SupplierByIdData={SupplierByIdData}
                SupplierByIdLoading={SupplierByIdLoading}
              />
            </div>

            <Button
              className="flex items-center py-0 md:py-[25px]"
              onClick={openUpdateSupplyModalFunc}
            >
              <Plus />
              Update Balance
            </Button>
          </div>
          <div className="w-1/2 flex flex-col items-start gap-3 bg-primary-green-200 border rounded-md border-primary-green-300 h-25 p-3">
            <p className="font-[500] text-md text-primary-black-100">
              Name: {SupplierByIdData?.data?.name}
            </p>
            <div className="flex gap-2 items-center">
              <p className="font-[500] text-md text-primary-black-100">
                Wallet Balance :
              </p>
              <p
                className={`font-[500] text-md ${
                  SupplierByIdData?.data?.wallet < 0
                    ? "text-red-600"
                    : "text-primary-black-100"
                } `}
              >
                {SupplierByIdData?.data?.wallet}
              </p>
            </div>
            <p className="font-[300] text-xs  text-gray-500">
              ID: {SupplierByIdData?.data?.id}
            </p>
          </div>
          {/* supply histoy */}

          <div className="w-full">
            <SupplyHistory
              SupplierByIdData={SupplierByIdData?.data}
              SupplierByIdLoading={SupplierByIdLoading}
            />
          </div>

          {/* cards container content */}
        </>
      )}

      <CustomModal
        isOpen={openUpdateSupplyWalletModal}
        onClose={closeUpdateSupplyWalletModal}
        trigger={false}
        title="Update Wallet Balance"
      >
        <div className="w-full ">
          <UpdateBalance wallet={SupplierByIdData?.data?.wallet} />
        </div>
      </CustomModal>
    </div>
  );
};

export default SupplierById;

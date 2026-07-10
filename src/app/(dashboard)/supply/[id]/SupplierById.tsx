"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { ArrowLeft, Plus } from "lucide-react";

import { CustomModal } from "@/components/app/CustomModal";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useFetchSingleSupplyHook } from "@/hooks/useFetchSingleSupplyHook";
import { cn } from "@/lib/utils";

import { formatToNaira } from "@/utils/formatMoney";
import SupplyHistory from "./SupplyHistory";
import UpdateBalance from "./UpdateBalance";

const SupplierById = ({ id }: { id: string }) => {
  const router = useRouter();
  const {
    SupplierByIdData,
    SupplierByIdLoading,

    handleSupplyHistoryRowClick,
  } = useFetchSingleSupplyHook({});
  const [purchaseValue, setPurchaseValue] = useState<any>();

  const [openUpdateSupplyWalletModal, setOpenUpdateSupplyWalletModal] =
    useState(false);

  const closeUpdateSupplyWalletModal = () =>
    setOpenUpdateSupplyWalletModal(false);
  const openUpdateSupplyModalFunc = () => setOpenUpdateSupplyWalletModal(true);

  console.log("supplierById---6", SupplierByIdData);

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
  const supplier = SupplierByIdData?.data;
  const initial = supplier?.name?.charAt(0)?.toUpperCase() || "?";
  const isWalletNegative = Number(supplier?.wallet) < 0;

  return (
    <div className="w-full flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 sm:gap-4">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-1.5 mr-1 px-3 py-2 rounded-lg border border-grey-5 text-sm font-bold text-grey-2 hover:bg-grey-6 hover:border-grey-4 cursor-pointer transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Back</span>
          </button>
          <h1 className="text-xl sm:text-2xl font-extrabold text-grey-1">
            Supplier Profile
          </h1>
        </div>

        <Button
          onClick={openUpdateSupplyModalFunc}
          className="flex items-center gap-1.5 w-full sm:w-auto"
        >
          <Plus className="w-4 h-4" />
          Update Balance
        </Button>
      </div>

      {SupplierByIdLoading || !SupplierByIdData ? (
        <>
          {/* Skeleton for info card */}
          <Skeleton className="h-28 w-full rounded-2xl bg-grey-5" />

          {/* Skeleton for history table */}
          <div className="w-full">
            <div className="space-y-4">
              <Skeleton className="h-10 w-full bg-grey-5" />
              {Array.from({ length: 5 }).map((_, index) => (
                <Skeleton key={index} className="h-16 w-full bg-grey-5 mt-2" />
              ))}
            </div>
          </div>
        </>
      ) : (
        <>
          {/* Supplier info card */}
          <div className="w-full bg-white rounded-2xl border border-grey-5 p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 shrink-0 rounded-full bg-primary-green-300/10 flex items-center justify-center text-primary-green-300 font-extrabold text-xl">
                  {initial}
                </div>
                <div className="space-y-1">
                  <p className="text-lg font-extrabold text-grey-1">
                    {supplier?.name}
                  </p>
                  <p className="text-sm text-grey-3">{supplier?.phone}</p>
                  <p className="text-xs text-grey-4">ID: {supplier?.id}</p>
                </div>
              </div>

              <div className="flex-1" />

              <div className="grid grid-cols-3 gap-3 w-full sm:w-auto">
                <div className="bg-info-2 rounded-xl px-4 py-3 min-w-[140px]">
                  <p className="text-xs font-bold text-info-1">
                    Purchase Value
                  </p>
                  <p className="text-lg font-extrabold text-info-1 mt-1">
                    {formatToNaira(purchaseValue)}
                  </p>
                </div>
                <div
                  className={cn(
                    "rounded-xl px-4 py-3 min-w-[140px]",
                    isWalletNegative ? "bg-error-2" : "bg-success-2",
                  )}
                >
                  <p
                    className={cn(
                      "text-xs font-bold",
                      isWalletNegative ? "text-error-1" : "text-success-1",
                    )}
                  >
                    Wallet Balance
                  </p>
                  <p
                    className={cn(
                      "text-lg font-extrabold mt-1",
                      isWalletNegative ? "text-error-1" : "text-success-1",
                    )}
                  >
                    {formatToNaira(supplier?.wallet)}
                  </p>
                </div>
                <div className="bg-[#e0e7ff] rounded-xl px-4 py-3 min-w-[140px]">
                  <p className="text-xs font-bold text-info-1">
                    Total Supplies
                  </p>
                  <p className="text-lg font-extrabold text-info-1 mt-1">
                    {supplier?.supply_history?.length ?? 0}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Supply history */}
          <div className="w-full rounded-2xl border border-grey-5 bg-white overflow-hidden">
            <div className="border-b border-grey-5 px-4 sm:px-6 py-4">
              <p className="text-sm font-extrabold text-grey-1">
                Supply History
              </p>
            </div>
            <SupplyHistory
              SupplierByIdData={supplier}
              SupplierByIdLoading={SupplierByIdLoading}
            />
          </div>
        </>
      )}

      <CustomModal
        isOpen={openUpdateSupplyWalletModal}
        onClose={closeUpdateSupplyWalletModal}
        trigger={false}
        title="Update Wallet Balance"
      >
        <div className="w-full ">
          <UpdateBalance
            closeModal={closeUpdateSupplyWalletModal}
            wallet={supplier?.wallet}
          />
        </div>
      </CustomModal>
    </div>
  );
};

export default SupplierById;

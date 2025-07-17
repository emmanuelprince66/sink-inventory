"use client";
import { AlertCircle, Plus, Users, Wallet } from "lucide-react";

import { CustomCard } from "@/components/app/CustomCard";
import { CustomModal } from "@/components/app/CustomModal";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useSupplyHook } from "@/hooks/useSupplyHook";
import { cn } from "@/lib/utils";

import { formatToNaira } from "@/utils/formatMoney";
import { useState } from "react";
import AddSupplier from "./AddSupplier";
import AllSupply from "./AllSupply";

interface SupplierCardData {
  title: string;
  amount: number | string;
}

const CustomSupplyCard = ({ title, amount }: SupplierCardData) => {
  const isDebtCard = title === "Total Debt";
  const isWalletCard = title === "Total Wallet Balance";
  const isSupplierCard = title === "Total suppliers";

  const getIcon = () => {
    switch (title) {
      case "Total suppliers":
        return <Users className="w-5 h-5 text-indigo-600" />;
      case "Total Debt":
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      case "Total Wallet Balance":
        return <Wallet className="w-5 h-5 text-emerald-600" />;
      default:
        return <Wallet className="w-5 h-5 text-emerald-600" />;
    }
  };

  return (
    <CustomCard
      className={cn(
        "p-4 rounded-lg border transition-all hover:shadow-md",
        isDebtCard
          ? "bg-gradient-to-br from-red-50 to-red-100 border-red-200"
          : isWalletCard
          ? "bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200"
          : "bg-gradient-to-br from-indigo-50 to-indigo-100 border-indigo-200"
      )}
    >
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "p-2 rounded-full",
              isDebtCard
                ? "bg-red-100"
                : isWalletCard
                ? "bg-emerald-100"
                : "bg-indigo-100"
            )}
          >
            {getIcon()}
          </div>
          <span
            className={cn(
              "text-sm font-medium",
              isDebtCard
                ? "text-primary-black-100"
                : isWalletCard
                ? "text-primary-black-100"
                : "text-primary-black-100"
            )}
          >
            {title}
          </span>
        </div>
      </div>
      <div className="mt-4">
        <span
          className={cn(
            "text-2xl font-bold",
            isDebtCard
              ? "text-primary-black-100"
              : isWalletCard
              ? "text-primary-black-100"
              : "text-primary-black-100"
          )}
        >
          {amount}
        </span>
      </div>
    </CustomCard>
  );
};

const Supply = () => {
  const { handleRowClick, SupplierData, SupplierLoading } = useSupplyHook({});

  const [openAddSupplyModal, setOpenAddSupplyModal] = useState(false);
  const closeOpenSupplyModal = () => setOpenAddSupplyModal(false);
  const openSupplyModalFunc = () => setOpenAddSupplyModal(true);

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
          <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-4">
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
          <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-4">
            <CustomSupplyCard
              title={"Total Wallet Balance"}
              amount={formatToNaira(
                SupplierData?.data?.results?.wallet_balance
              )}
            />
            <CustomSupplyCard
              title={"Total Debt"}
              amount={formatToNaira(SupplierData?.data?.results?.debt)}
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
          <AddSupplier closeModal={closeOpenSupplyModal} />
        </div>
      </CustomModal>
    </div>
  );
};

export default Supply;

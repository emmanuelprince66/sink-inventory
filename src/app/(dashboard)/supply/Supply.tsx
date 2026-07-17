"use client";
import { AlertCircle, Plus, Users, Wallet } from "lucide-react";

import { CustomCard } from "@/components/app/CustomCard";
import { CustomModal } from "@/components/app/CustomModal";
import { StatCardSkeletonRow } from "@/components/app/StatCardSkeleton";
import { TableSkeleton } from "@/components/app/TableSkeleton";
import { Button } from "@/components/ui/button";
import { useSupplyHook } from "@/hooks/useSupplyHook";
import { useUserRole } from "@/lib/store/user-store";
import { cn } from "@/lib/utils";

import { formatToNaira } from "@/utils/formatMoney";
import { useState } from "react";
import AddSupplier from "./AddSupplier";
import AllSupply from "./AllSupply";

interface SupplierCardData {
  title: string;
  amount: number | string;
}

// Matches the tinted flat-card KPI pattern established on Orders/Sales/Inventory
// (rounded-2xl, border-none, bare icon, extrabold value) — Supplier has no Figma
// screen of its own, so it follows our own calibrated design system instead.
const SUPPLY_CARD_STYLES: Record<
  string,
  { bg: string; iconColor: string; icon: React.ReactNode }
> = {
  "Total Wallet Balance": {
    bg: "bg-success-2",
    iconColor: "text-success-1",
    icon: <Wallet className="w-[18px] h-[18px]" />,
  },
  "Total Debt": {
    bg: "bg-error-2",
    iconColor: "text-error-1",
    icon: <AlertCircle className="w-[18px] h-[18px]" />,
  },
  "Total suppliers": {
    bg: "bg-[#e0e7ff]",
    iconColor: "text-info-1",
    icon: <Users className="w-[18px] h-[18px]" />,
  },
};

const CustomSupplyCard = ({ title, amount }: SupplierCardData) => {
  const variant = SUPPLY_CARD_STYLES[title] ?? SUPPLY_CARD_STYLES["Total suppliers"];

  return (
    <CustomCard
      className={cn(
        variant.bg,
        "w-full rounded-2xl border-none transition-all p-0",
      )}
      contentClassName="p-4 sm:p-5 flex flex-col gap-3"
    >
      <div className="flex items-center justify-between">
        <p className={cn("text-xs font-bold", variant.iconColor)}>{title}</p>
        <span className={variant.iconColor}>{variant.icon}</span>
      </div>
      <p className="text-2xl font-extrabold text-grey-1">{amount}</p>
    </CustomCard>
  );
};

const Supply = () => {
  const { role } = useUserRole();
  const { handleRowClick, SupplierData, SupplierLoading } = useSupplyHook({});

  const [openAddSupplyModal, setOpenAddSupplyModal] = useState(false);
  const closeOpenSupplyModal = () => setOpenAddSupplyModal(false);
  const openSupplyModalFunc = () => setOpenAddSupplyModal(true);

  return (
    <div className="w-full h-full flex flex-col justify-start gap-6 items-start">
      {/* Header Section */}
      <div className="w-full">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between w-full mb-4 sm:mb-6 gap-3 sm:gap-0">
          <p className="text-2xl md:text-3xl text-grey-1 font-extrabold">
            Supplier
          </p>

          {(role === "OWNER" ||
            role === "ADMIN-ATTENDANT" ||
            role === "ACCOUNTANT") && (
            <Button
              onClick={openSupplyModalFunc}
              className="flex items-center gap-1.5 w-full sm:w-auto"
            >
              <Plus className="w-4 h-4" />
              Add Supplier
            </Button>
          )}
        </div>

        {/* Overview Cards */}
        <div>
          <p className="text-sm font-bold text-primary-green-300 border-b border-border-tint pb-2 mb-3 sm:mb-4">
            Overview
          </p>

          {SupplierLoading ? (
            <StatCardSkeletonRow
              count={3}
              gridClassName="w-full grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4"
            />
          ) : (
            <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
              <CustomSupplyCard
                title={"Total Wallet Balance"}
                amount={formatToNaira(
                  SupplierData?.data?.results?.wallet_balance,
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
          )}
        </div>
      </div>

      {/* Main Content Section */}
      {SupplierLoading ? (
        <TableSkeleton
          rows={5}
          columns={[
            { flex: true },
            { width: "w-32", hiddenOnMobile: true },
            { width: "w-24", alignRight: true },
            { width: "w-8" },
          ]}
        />
      ) : (
        <AllSupply
          SupplierData={SupplierData}
          SupplierLoading={SupplierLoading}
          handleRowClick={handleRowClick}
        />
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

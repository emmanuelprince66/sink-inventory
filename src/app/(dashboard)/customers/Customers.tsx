"use client";
import { AlertCircle, Megaphone, Plus, Users, Wallet } from "lucide-react";

import { CustomCard } from "@/components/app/CustomCard";
import { CustomModal } from "@/components/app/CustomModal";
import { SearchInput } from "@/components/app/SearchInput";
import { StatCardSkeletonRow } from "@/components/app/StatCardSkeleton";
import { TableSkeleton } from "@/components/app/TableSkeleton";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useCustomerHook } from "@/hooks/useCustomerHook";
import { cn } from "@/lib/utils";
import { DateRange } from "react-day-picker";

import { DatePickerWithRange } from "@/components/app/DateRangePicker";
import { Spinner } from "@/components/app/Spinner";
import UserNotSubscribe from "@/components/app/UserNotSubscribe";
import { formatToNaira } from "@/utils/formatMoney";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useCallback, useState } from "react";
import AddCustomer from "./AddCustomer";
import AllCustomers from "./AllCustomers";

const Campaign = dynamic(() => import("../campaign/Campaign"), {
  ssr: false,
  loading: () => (
    <div className="w-full flex justify-center py-16">
      <Spinner className="text-primary-green-300" />
    </div>
  ),
});

interface CustomerCardData {
  title: string;
  amount: number | string;
  type: "wallet" | "debt" | "customers";
}

// Colored KPI cards — same pattern as Orders/Sales/Overview/Referral:
// tinted card background per type, icon in a white circle.
const CUSTOMER_CARD_STYLES: Record<
  CustomerCardData["type"],
  { cardBg: string; iconColor: string; icon: React.ReactNode }
> = {
  wallet: {
    cardBg: "bg-success-2",
    iconColor: "text-success-1",
    icon: <Wallet className="w-4 h-4" />,
  },
  debt: {
    cardBg: "bg-error-2",
    iconColor: "text-error-1",
    icon: <AlertCircle className="w-4 h-4" />,
  },
  customers: {
    cardBg: "bg-info-2",
    iconColor: "text-info-1",
    icon: <Users className="w-4 h-4" />,
  },
};

const CustomCustomerCard = ({ title, amount, type }: CustomerCardData) => {
  const variant = CUSTOMER_CARD_STYLES[type];
  return (
    <CustomCard
      className={cn(
        "w-full rounded-2xl border border-border-tint p-0",
        variant.cardBg,
      )}
      contentClassName="p-5"
    >
      <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center mb-3">
        <span className={variant.iconColor}>{variant.icon}</span>
      </div>
      <p className="text-xs font-bold text-grey-2">{title}</p>
      <p className="text-2xl font-extrabold text-grey-1 mt-1">{amount}</p>
    </CustomCard>
  );
};

const Customers = () => {
  const [activeTopTab, setActiveTopTab] = useState<"customers" | "campaigns">(
    "customers",
  );
  const [dateRange, setDateRange] = useState<DateRange | undefined>(
    undefined,
  );
  const [page, setPage] = useState(1);

  const [openAddCustomerModal, setOpenAddCustomerModal] = useState(false);
  const [showNotSubscribeModal, setShowNotSubscribeModal] = useState(false);
  const handleOpenNotSubscribeModal = () => setShowNotSubscribeModal(true);
  const handleCloseNotSubscribeModal = () => setShowNotSubscribeModal(false);

  const closeOpenCustomerModal = useCallback(() => {
    setOpenAddCustomerModal(false);
  }, []);

  const openCustomerModalFunc = useCallback(() => {
    setOpenAddCustomerModal(true);
  }, []);

  const {
    filterOptions,
    searchInput,
    CustomerData,
    CustomerLoading,
    handleRowClick,
    handleFilterChange,
    activeFilter,
    handleSearchChange,
  } = useCustomerHook({ handleOpenNotSubscribeModal, dateRange, page });

  return (
    <div className="w-full flex flex-col gap-6">
      {/* Page-level tabs — Customers content vs. Campaigns, rendered inline */}
      <div className="border-b border-grey-5">
        <div className="flex items-center gap-6">
          <button
            onClick={() => setActiveTopTab("customers")}
            className={cn(
              "py-4 text-sm cursor-pointer font-bold border-b-2 transition-colors",
              activeTopTab === "customers"
                ? "border-primary-green-300 text-primary-green-300"
                : "border-transparent text-grey-3 hover:text-grey-2",
            )}
          >
            Customers
          </button>
          <button
            onClick={() => setActiveTopTab("campaigns")}
            className={cn(
              "py-4 text-sm cursor-pointer font-bold border-b-2 transition-colors",
              activeTopTab === "campaigns"
                ? "border-primary-green-300 text-primary-green-300"
                : "border-transparent text-grey-3 hover:text-grey-2",
            )}
          >
            Campaigns
          </button>
        </div>
      </div>

      {activeTopTab === "campaigns" ? (
        <Campaign />
      ) : (
        <>
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-grey-1">
          Customers
        </h1>

        <div className="flex gap-2 w-full sm:w-auto">
          <Button
            className="flex-1 sm:flex-none gap-1.5"
            onClick={openCustomerModalFunc}
          >
            <Plus className="w-4 h-4" />
            Add Customer
          </Button>

          <Link href={"/customers/upload"} className="flex-1 sm:flex-none">
            <Button variant="outline" className="w-full">
              Upload CSV
            </Button>
          </Link>
        </div>
      </div>

      {CustomerLoading || !CustomerData ? (
        <>
          {/* Skeleton for cards */}
          <StatCardSkeletonRow
            count={3}
            gridClassName="w-full grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4"
          />

          {/* Skeleton for banner */}
          <Skeleton className="h-32 w-full rounded-2xl bg-grey-5" />

          {/* Skeleton for main card */}
          <div className="bg-white rounded-2xl border border-grey-5 overflow-hidden">
            <div className="p-4 sm:p-6 space-y-4">
              <div className="flex gap-2">
                {Array.from({ length: filterOptions.length }).map(
                  (_, index) => (
                    <Skeleton
                      key={index}
                      className="h-9 w-20 rounded-full bg-grey-5"
                    />
                  ),
                )}
              </div>
              <Skeleton className="h-10 w-full bg-grey-5" />
              <TableSkeleton
                rows={5}
                columns={[
                  { flex: true },
                  { width: "w-28", hiddenOnMobile: true },
                  { width: "w-24" },
                  { width: "w-24", hiddenOnMobile: true },
                  { width: "w-24", alignRight: true },
                  { width: "w-8" },
                ]}
              />
            </div>
          </div>
        </>
      ) : (
        <>
          {/* KPI Cards */}
          <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
            <CustomCustomerCard
              title="Total Wallet Balance"
              amount={formatToNaira(CustomerData?.data?.results?.total_wallet)}
              type="wallet"
            />

            <CustomCustomerCard
              title="Total Debt"
              amount={formatToNaira(CustomerData?.data?.results?.total_debt)}
              type="debt"
            />

            <CustomCustomerCard
              title="Total Customers"
              amount={CustomerData?.data?.results?.customer_count}
              type="customers"
            />
          </div>

          {/* Engage Your Customers Banner */}
          <div className="bg-secondary-6 border border-primary-green-300/20 rounded-2xl p-4 sm:p-5 flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <Megaphone className="h-5 w-5 text-primary-green-300" />
              <h2 className="text-base font-extrabold text-grey-1">
                Engage Your Customers
              </h2>
            </div>
            <p className="text-sm text-grey-2">
              Send personalized promotions, offers, and reminders to keep your
              customers coming back
            </p>
            <Button
              className="self-start gap-1.5"
              onClick={() => setActiveTopTab("campaigns")}
            >
              <Plus className="w-4 h-4" />
              Create a Campaign
            </Button>
          </div>

          {/* Main Content Card */}
          <div className="w-full rounded-2xl border border-grey-5 bg-white overflow-hidden">
            {/* Toolbar */}
            <div className="p-4 sm:p-6 border-b border-grey-5">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                <div className="flex gap-2 overflow-x-auto scrollbar-hide">
                  {filterOptions.map((filter) => (
                    <button
                      key={filter}
                      onClick={() => handleFilterChange(filter)}
                      className={cn(
                        "px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-bold cursor-pointer rounded-full transition-all whitespace-nowrap flex-shrink-0",
                        activeFilter === filter
                          ? "bg-primary-green-300 text-white shadow-sm"
                          : "bg-white border border-grey-5 text-grey-2 hover:bg-grey-6",
                      )}
                    >
                      {filter}
                    </button>
                  ))}
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full lg:w-auto">
                  <div className="w-full sm:w-44">
                    <DatePickerWithRange
                      date={dateRange}
                      onDateChange={setDateRange}
                      className="w-full"
                    />
                  </div>
                  <div className="w-full sm:w-56">
                    <SearchInput
                      placeholder="Search customers..."
                      value={searchInput}
                      onValueChange={handleSearchChange}
                      className="h-9"
                    />
                  </div>
                </div>
              </div>

              {searchInput.length > 0 && searchInput.length < 3 && (
                <div className="mt-2 text-xs text-grey-4">
                  Type at least 3 characters to search
                </div>
              )}
            </div>

            {/* Customers Table */}
            <AllCustomers
              customersData={CustomerData}
              handleRowClick={handleRowClick}
              customerLoading={CustomerLoading}
              setPage={setPage}
              page={page}
            />
          </div>
        </>
      )}
        </>
      )}

      {/* modal to add customer */}
      <CustomModal
        isOpen={openAddCustomerModal}
        onClose={closeOpenCustomerModal}
        trigger={false}
        title="Add Customer"
      >
        <div className="w-full ">
          <AddCustomer
            handleOpenNotSubscribeModal={handleOpenNotSubscribeModal}
            closeOpenCustomerModal={closeOpenCustomerModal}
          />
        </div>
      </CustomModal>

      {/* modal for subscription notice */}
      <CustomModal
        isOpen={showNotSubscribeModal}
        onClose={handleCloseNotSubscribeModal}
        trigger={false}
        title="Subscription Details"
      >
        <div className="w-full ">
          <UserNotSubscribe />
        </div>
      </CustomModal>
    </div>
  );
};

export default Customers;

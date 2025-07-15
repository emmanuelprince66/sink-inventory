"use client";
import { AlertCircle, Plus, Users, Wallet } from "lucide-react";

import { CustomCard } from "@/components/app/CustomCard";
import { CustomModal } from "@/components/app/CustomModal";
import { SearchInput } from "@/components/app/SearchInput";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useCustomerHook } from "@/hooks/useCustomerHook";
import { cn } from "@/lib/utils";
import { DateRange } from "react-day-picker";

import { DatePickerWithRange } from "@/components/app/DateRangePicker";
import UserNotSubscribe from "@/components/app/UserNotSubscribe";
import { formatToNaira } from "@/utils/formatMoney";
import Link from "next/link";
import { useCallback, useState } from "react";
import AddCustomer from "./AddCustomer";
import AllCustomers from "./AllCustomers";

interface CustomerCardData {
  title: string;
  amount: number | string;
}

const CustomCustomerCard = ({ title, amount }: CustomerCardData) => {
  const isDebtCard = title === "Total Debt";
  const isWalletCard = title === "Total Wallet";

  const getIcon = () => {
    switch (title) {
      case "Total Customers":
        return <Users className="w-5 h-5 text-indigo-600" />;
      case "Total Debt":
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      case "Total Wallet":
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
                ? "text-red-800"
                : isWalletCard
                ? "text-emerald-800"
                : "text-indigo-800"
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
              ? "text-red-600"
              : isWalletCard
              ? "text-emerald-600"
              : "text-indigo-600"
          )}
        >
          {amount}
        </span>
      </div>
    </CustomCard>
  );
};

const Customers = () => {
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(),
    to: new Date(),
  });
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
    <div className="w-full h-full flex flex-col justify-start gap-5 items-start">
      <div className="flex items-center justify-between w-full">
        <div className="flex justify-between items-center w-full">
          <p className="text-2xl md:text-3xl text-primary-black-100 font-[500]">
            Customers
          </p>

          <div className="flex gap-2 items-center">
            <DatePickerWithRange date={dateRange} onDateChange={setDateRange} />

            <div
              className="text-[14px] md:text-[20px]"
              onClick={openCustomerModalFunc}
            >
              <Button className="flex items-center py-0  ">
                <Plus />
                <p className="text-sm">Add Customer</p>
              </Button>
            </div>

            <Link href={"/customers/upload"}>
              <Button
                variant="outline"
                className="border-primary-green-300 text-primary-green-300 hover:bg-primary-green-50"
              >
                <span className="hidden md:inline">Upload</span> CSV
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {CustomerLoading || !CustomerData ? (
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

          {/* Skeleton for filters */}
          <div className="flex gap-3 mt-4 mb-3">
            {Array.from({ length: filterOptions.length }).map((_, index) => (
              <Skeleton
                key={index}
                className="h-14 w-[70px] rounded-md bg-[#eef4ef]"
              />
            ))}
          </div>

          {/* Skeleton for search */}
          <div className="w-full md:w-1/2">
            <Skeleton className="h-10 w-full bg-[#eef4ef]" />
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
          <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-4">
            <CustomCustomerCard
              title={"Total Customers"}
              amount={CustomerData?.data?.results?.customer_count}
            />

            <CustomCustomerCard
              title={"Total Debt"}
              amount={formatToNaira(CustomerData?.data?.results?.total_debt)}
            />

            <CustomCustomerCard
              title={"Total Wallet"}
              amount={formatToNaira(CustomerData?.data?.results?.total_wallet)}
            />
          </div>
          {/* cards container content */}

          {/* Second filter */}
          <div className="flex gap-3 mt-4 mb-3">
            {filterOptions.map((filter) => (
              <Button
                key={filter}
                className={`px-4 py-2 rounded-md h-14 min-w-[70px] text-sm hover:text-white font-medium transition-colors ${
                  activeFilter === filter
                    ? "bg-primary-green-300 text-white"
                    : "bg-primary-green-200 text-primary-black-100"
                }`}
                onClick={() => handleFilterChange(filter)}
              >
                {filter}
              </Button>
            ))}
          </div>
          {/* Second filter end */}

          {/* search input */}
          <div className="w-full md:w-1/2">
            <SearchInput
              placeholder="Search customers..."
              value={searchInput}
              onValueChange={handleSearchChange}
            />
            {CustomerLoading && (
              <div className="mt-1 text-sm text-muted-foreground">
                Searching...
              </div>
            )}
            {searchInput.length > 0 && searchInput.length < 3 && (
              <div className="mt-1 text-sm text-muted-foreground">
                Type at least 3 characters to search
              </div>
            )}
          </div>

          {/* all customers */}
          <AllCustomers
            customersData={CustomerData}
            handleRowClick={handleRowClick}
            customerLoading={CustomerLoading}
            setPage={setPage}
            page={page}
          />
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

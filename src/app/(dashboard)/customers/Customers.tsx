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
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between w-full gap-4">
        <p className="text-xl sm:text-2xl lg:text-3xl text-primary-black-100 font-medium">
          Customers
        </p>

        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center w-full lg:w-auto">
          {/* Date Picker */}
          <div className="w-full sm:w-auto min-w-[280px]">
            <DatePickerWithRange date={dateRange} onDateChange={setDateRange} />
          </div>

          {/* Buttons Container */}
          <div className="flex gap-3 w-full sm:w-auto">
            <Button
              className="flex items-center justify-center px-4 py-2 text-sm font-medium flex-1 sm:flex-none min-h-[44px] min-w-[140px]"
              onClick={openCustomerModalFunc}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Customer
            </Button>

            <Link href={"/customers/upload"} className="flex-1 sm:flex-none">
              <Button
                variant="outline"
                className="border-primary-green-300 text-primary-green-300 hover:bg-primary-green-50 w-full px-4 py-2 text-sm font-medium min-h-[44px] min-w-[120px]"
              >
                Upload CSV
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
          <div className="mt-4 mb-3 w-full">
            <div className="flex gap-2 md:gap-3 overflow-x-auto scrollbar-hide pb-2 w-full">
              {filterOptions.map((filter) => (
                <Button
                  key={filter}
                  className={`px-4 py-2 rounded-md h-12 md:h-14 min-w-fit whitespace-nowrap text-sm font-medium transition-all duration-200 flex-shrink-0 shadow-sm hover:shadow-md ${
                    activeFilter === filter
                      ? "bg-primary-green-300 text-white hover:bg-primary-green-400"
                      : "bg-primary-green-200 text-primary-black-100 hover:bg-primary-green-300 hover:text-white"
                  }`}
                  onClick={() => handleFilterChange(filter)}
                >
                  {filter}
                </Button>
              ))}
            </div>
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

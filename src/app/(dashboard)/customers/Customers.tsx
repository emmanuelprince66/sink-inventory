"use client";
import { Plus } from "lucide-react";

import { CustomCard } from "@/components/app/CustomCard";
import { CustomModal } from "@/components/app/CustomModal";
import { SearchInput } from "@/components/app/SearchInput";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useCustomerHook } from "@/hooks/useCustomerHook";
import { cn } from "@/lib/utils";
import { DateRange } from "react-day-picker";

import { DatePickerWithRange } from "@/components/app/DateRangePicker";
import { formatToNaira } from "@/utils/formatMoney";
import { useCallback, useState } from "react";
import AddCustomer from "./AddCustomer";
import AllCustomers from "./AllCustomers";

interface CustomerCardData {
  title: string;
  amount: number | string;
}

const CustomCustomerCard = ({ title, amount }: CustomerCardData) => {
  // Determine if this is the debt card
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
            isDebtCard ? "text-red-600" : "text-primary-black-10"
          } `}
        >
          {amount}
        </p>
      </div>
    </CustomCard>
  );
};

const Customers = () => {
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(),
    to: new Date(),
  });

  const [openAddCustomerModal, setOpenAddCustomerModal] = useState(false);

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
  } = useCustomerHook({});

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
              <Button className="flex items-center py-0 md:py-[25px]">
                <Plus />
                Add Customer
              </Button>
            </div>
          </div>
        </div>
      </div>

      {CustomerLoading || !CustomerData ? (
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
          <div className="w-1/2">
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
          <div className="w-1/2 grid grid-cols-1 md:grid-cols-3 gap-4">
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
          <div className="w-1/2">
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
          />
        </>
      )}

      {/* modal to add supply */}
      <CustomModal
        isOpen={openAddCustomerModal}
        onClose={closeOpenCustomerModal}
        trigger={false}
        title="Add Customer"
      >
        <div className="w-full ">
          <AddCustomer closeOpenCustomerModal={closeOpenCustomerModal} />
        </div>
      </CustomModal>
    </div>
  );
};

export default Customers;

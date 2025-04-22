"use client";
import React, { useState } from "react";
import { CustomCard } from "@/components/app/CustomCard";
import { CustomModal } from "@/components/app/CustomModal";
import { cn } from "@/lib/utils";
import { Plus } from "lucide-react";
import { useCustomerHook } from "@/hooks/useCustomerHook";
import { Button } from "@/components/ui/button";
import AddCustomer from "./AddCustomer";
import AllCustomers from "./AllCustomers";
import { SearchInput } from "@/components/app/SearchInput";
import { Spinner } from "@/components/app/Spinner";

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
  const {
    openAddCustomerModal,
    closeOpenCustomerModal,
    openCustomerModalFunc,
    filterOptions,
    CustomerData,

    CustomerLoading,
    handleRowClick,
    handleFilterChange,
    activeFilter,
    handleSearchChange,
  } = useCustomerHook();

  console.log("CustomerData", CustomerData);

  return (
    <div className="w-full h-full flex flex-col justify-start gap-5 items-start">
      <div className="flex items-center justify-between w-full">
        <div className="flex justify-between items-center w-full">
          <p className="text-2xl md:text-3xl text-primary-black-100 font-[500]">
            Customers
          </p>

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

      {CustomerLoading || !CustomerData ? (
        <div className="w-full h-full flex flex-col justify-center items-center mt-8">
          <Spinner size={"xLarge"} className="text-primary-green-300" />
        </div>
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
              amount={CustomerData?.data?.results?.total_debt}
            />

            <CustomCustomerCard
              title={"Total Wallet"}
              amount={CustomerData?.data?.results?.total_wallet}
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
            <SearchInput placeholder="Search.... " className="" />
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
        description="Add more customer "
      >
        <div className="w-full ">
          <AddCustomer />
        </div>
      </CustomModal>
      {/* modal to add supply endss*/}
    </div>
  );
};

export default Customers;

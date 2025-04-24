"use client";
import React, { useState } from "react";
import { ArrowLeft, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CustomerHistory from "./CustomerHistory";
import { CustomerTransactions } from "./CustomerTransactions";
import { CustomModal } from "@/components/app/CustomModal";
import UpdateCustomerWallet from "./UpdateCustomerWallet";
import { useGetCustomerByIdHook } from "@/hooks/useGetCustomerByIdHook";
import { Skeleton } from "@/components/ui/skeleton";

const Contact = ({ id }: { id: string }) => {
  console.log("Contact", id);

  const {
    CustomerData,
    CustomerLoading,
    CustomerPurchaseHistory,
    CustomerPurchaseHistoryLoading,
    CustomerWalletTrxLoading,
    closeOpenUpdateCustomerWalletModal,
    openUpdateCustomerWalletModalFunc,
    openUpdateCustomerWalletModal,
    CustomerWalletTrx,
  } = useGetCustomerByIdHook(id);

  console.log("www-4", CustomerData);

  const [filter, setFilter] = useState<"history" | "transactions">("history");

  return (
    <div className="w-full flex flex-col items-start gap-5">
      {/* Back button */}

      <div className="w-full flex justify-between items-center">
        <div className="flex gap-2 items-center">
          <div className="flex cursor-pointer items-center justify-center  bg-primary-green-300 rounded w-10 h-10">
            <ArrowLeft className="text-white" />
          </div>

          <p className="text-primary-black-100 text-3xl">Customer Profile</p>
        </div>

        {/* Edit Button */}

        <div className="flex gap-3 items-center">
          <Button
            variant="outline"
            className="text-primary-green-300  min-w-[200px]  py-0 md:py-[25px] border-primary-green-300 hover:bg-primary-green-100 hover:text-primary-green-300 "
          >
            <Edit
              className="text-primary-green-300 cursor-pointer mr-2"
              size={16}
            />
            Edit Customer
          </Button>
          <Button
            onClick={openUpdateCustomerWalletModalFunc}
            className=" hover:bg-primary-green-100 min-w-[200px] py-0 md:py-[25px] hover:text-primary-green-300"
          >
            <Plus className="text-white cursor-pointer mr-2" size={16} />
            Add Wallet
          </Button>
        </div>
      </div>

      {/* Contact info section */}
      <div className="flex w-full justify-between items-start">
        <div className="flex flex-col items-start gap-2">
          {/* Full Name */}
          <div className="flex gap-2 items-center">
            <span className="text-gray-600 text-md font-semibold">
              Full Name:{" "}
            </span>
            <span className="text-primary-black-100 ">
              {!CustomerData || CustomerLoading ? (
                <Skeleton className="h-6 w-[100px] bg-[#eef4ef]" />
              ) : (
                ` ${CustomerData?.data?.name}`
              )}
            </span>
          </div>

          {/* Email */}
          <div className="flex gap-2 items-center">
            <span className="text-gray-600 text-md font-semibold">Email: </span>
            <span className="text-primary-black-100 ">
              {!CustomerData || CustomerLoading ? (
                <Skeleton className="h-6 w-[100px] bg-[#eef4ef]" />
              ) : (
                ` ${CustomerData?.data?.email}`
              )}
            </span>
          </div>

          {/* Phone */}
          <div className="flex gap-2 items-center">
            <span className="text-gray-600 text-md font-semibold">Phone: </span>
            <span className="text-primary-black-100 ">
              {!CustomerData || CustomerLoading ? (
                <Skeleton className="h-6 w-[100px] bg-[#eef4ef]" />
              ) : (
                ` ${CustomerData?.data?.phone}`
              )}
            </span>
          </div>

          {/* Purchase Value */}
          <div className="flex gap-1 items-center">
            <span className="text-gray-600 text-md font-semibold">
              Total Purchase Value:
            </span>
            <span className="text-primary-green-300 text-md font-[600]">
              {CustomerData?.data.totalPurchaseValue || ""}
            </span>
          </div>
          {/* Purchase Value */}
          <div className="flex gap-2 items-center">
            <span className="text-gray-600 text-md font-semibold">
              Wallet Balance:{" "}
            </span>
            <span className="text-primary-green-300 ">
              {!CustomerData || CustomerLoading ? (
                <Skeleton className="h-6 w-[100px] bg-[#eef4ef]" />
              ) : (
                ` ${CustomerData?.data?.wallet}`
              )}
            </span>
          </div>
        </div>
      </div>

      {/* tabs */}

      <Tabs
        value={filter}
        onValueChange={(value) =>
          setFilter(value as "history" | "transactions")
        }
        className="w-full mt-6"
      >
        <TabsList className="w-[400px]">
          <TabsTrigger value="history">Purchase History</TabsTrigger>
          <TabsTrigger value="transactions">Wallet Transactions </TabsTrigger>
        </TabsList>
        <div className="w-full h-[1px] bg-gray-200 mt-[-8px]" />

        {/* Content conditional rendering */}
        <TabsContent value="history">
          <CustomerHistory
            data={CustomerPurchaseHistory}
            loading={CustomerPurchaseHistoryLoading}
          />
        </TabsContent>
        <TabsContent value="transactions">
          <CustomerTransactions
            data={CustomerWalletTrx}
            loading={CustomerWalletTrxLoading}
          />
        </TabsContent>
      </Tabs>

      {/* update wallet modal */}

      <CustomModal
        isOpen={openUpdateCustomerWalletModal}
        onClose={closeOpenUpdateCustomerWalletModal}
        trigger={false}
        title="Update Wallet Balance"
      >
        <div className="w-full ">
          <UpdateCustomerWallet wallet={CustomerData?.data?.wallet} />
        </div>
      </CustomModal>
    </div>
  );
};

export default Contact;

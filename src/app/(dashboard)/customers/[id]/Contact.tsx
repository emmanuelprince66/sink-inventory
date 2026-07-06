"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

import { ArrowLeft, Edit, MoreHorizontal, Plus, Trash2 } from "lucide-react";

import { CustomModal } from "@/components/app/CustomModal";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useGetCustomerByIdHook } from "@/hooks/useGetCustomerByIdHook";

import DeleteCustomer from "../DeleteCustomer";
import CustomerHistory from "./CustomerHistory";
import { CustomerTransactions } from "./CustomerTransactions";
import UpdateCustomerWallet from "./UpdateCustomerWallet";

const TABS = [
  { value: "history", label: "Purchase History" },
  { value: "transactions", label: "Wallet Transactions" },
] as const;

const Contact = ({ id }: { id: string }) => {
  const router = useRouter();
  const [openUpdateCustomerWalletModal, setOpenUpdateCustomerWalletModal] =
    useState(false);
  const [openDeleteCustomerModal, setOpenDeleteCustomerModal] =
    useState(false);

  const closeOpenUpdateCustomerWalletModal = () =>
    setOpenUpdateCustomerWalletModal(false);
  const openUpdateCustomerWalletModalFunc = () => {
    setOpenUpdateCustomerWalletModal(true);
  };

  const closeDeleteCustomerModal = () => setOpenDeleteCustomerModal(false);

  const {
    CustomerData,
    CustomerLoading,
    CustomerPurchaseHistory,
    CustomerPurchaseHistoryLoading,
    CustomerWalletTrxLoading,
    CustomerWalletTrx,
  } = useGetCustomerByIdHook({});

  const [filter, setFilter] = useState<"history" | "transactions">("history");

  const customer = CustomerData?.data;
  const initial = customer?.name?.charAt(0)?.toUpperCase() || "?";
  const isWalletNegative = Number(customer?.wallet) < 0;

  return (
    <div className="w-full flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 sm:gap-4">
          <button
            onClick={() => window.history.back()}
            className="flex items-center gap-1.5 mr-1 px-3 py-2 rounded-lg border border-grey-5 text-sm font-bold text-grey-2 hover:bg-grey-6 hover:border-grey-4 cursor-pointer transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Back</span>
          </button>
          <h1 className="text-xl sm:text-2xl font-extrabold text-grey-1">
            Customer Profile
          </h1>
        </div>

        <div className="flex gap-2 w-full sm:w-auto">
          <Button
            onClick={openUpdateCustomerWalletModalFunc}
            className="flex-1 sm:flex-none gap-1.5"
          >
            <Plus className="h-4 w-4" />
            Add Wallet
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="shrink-0"
                title="More actions"
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="bg-white border border-grey-5 shadow-lg min-w-[180px]"
            >
              <DropdownMenuItem className="cursor-pointer px-4 py-2 hover:bg-primary-green-300/10 hover:text-primary-green-300 transition-colors">
                <Edit className="h-4 w-4 mr-2" />
                Edit Customer
              </DropdownMenuItem>
              <DropdownMenuItem
                disabled={Number(customer?.wallet) < 0}
                onClick={() => setOpenDeleteCustomerModal(true)}
                className="cursor-pointer px-4 py-2 text-error-1 hover:bg-error-2 hover:text-error-1 transition-colors"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Customer
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Contact Info Card */}
      <div className="bg-white rounded-2xl border border-grey-5 p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 shrink-0 rounded-full bg-primary-green-300/10 flex items-center justify-center text-primary-green-300 font-extrabold text-xl">
              {!customer || CustomerLoading ? (
                <Skeleton className="h-14 w-14 rounded-full bg-grey-6" />
              ) : (
                initial
              )}
            </div>
            <div className="space-y-1">
              <p className="text-lg font-extrabold text-grey-1">
                {!customer || CustomerLoading ? (
                  <Skeleton className="h-5 w-32 bg-grey-6" />
                ) : (
                  customer.name
                )}
              </p>
              <p className="text-sm text-grey-3">
                {!customer || CustomerLoading ? (
                  <Skeleton className="h-4 w-40 bg-grey-6 mt-1" />
                ) : (
                  customer.email || "No email provided"
                )}
              </p>
              <p className="text-sm text-grey-3">
                {!customer || CustomerLoading ? (
                  <Skeleton className="h-4 w-28 bg-grey-6 mt-1" />
                ) : (
                  customer.phone
                )}
              </p>
            </div>
          </div>

          <div className="flex-1" />

          <div className="grid grid-cols-2 gap-3 w-full sm:w-auto">
            <div className="bg-info-2 rounded-xl px-4 py-3 min-w-[160px]">
              <p className="text-xs font-bold text-info-1">
                Total Purchase Value
              </p>
              <p className="text-lg font-extrabold text-info-1 mt-1">
                {!customer || CustomerLoading ? (
                  <Skeleton className="h-5 w-20 bg-white/60" />
                ) : (
                  (customer as any).totalPurchaseValue || "₦0"
                )}
              </p>
            </div>
            <div
              className={cn(
                "rounded-xl px-4 py-3 min-w-[160px]",
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
                {!customer || CustomerLoading ? (
                  <Skeleton className="h-5 w-20 bg-white/60" />
                ) : (
                  customer.wallet
                )}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs + Content */}
      <div className="w-full rounded-2xl border border-grey-5 bg-white overflow-hidden">
        <div className="border-b border-grey-5 px-4 sm:px-6">
          <div className="flex items-center gap-6">
            {TABS.map((tab) => (
              <button
                key={tab.value}
                onClick={() => setFilter(tab.value)}
                className={cn(
                  "py-4 text-sm cursor-pointer font-bold border-b-2 transition-colors",
                  filter === tab.value
                    ? "border-primary-green-300 text-primary-green-300"
                    : "border-transparent text-grey-3 hover:text-grey-2",
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          {filter === "history" ? (
            <CustomerHistory
              data={CustomerPurchaseHistory}
              loading={CustomerPurchaseHistoryLoading}
            />
          ) : (
            <CustomerTransactions
              data={CustomerWalletTrx}
              loading={CustomerWalletTrxLoading}
            />
          )}
        </div>
      </div>

      {/* update wallet modal */}
      <CustomModal
        isOpen={openUpdateCustomerWalletModal}
        onClose={closeOpenUpdateCustomerWalletModal}
        trigger={false}
        title="Update Wallet Balance"
      >
        <div className="w-full ">
          <UpdateCustomerWallet
            closeModal={closeOpenUpdateCustomerWalletModal}
            wallet={CustomerData?.data?.wallet}
          />
        </div>
      </CustomModal>

      {/* delete customer modal */}
      <CustomModal
        isOpen={openDeleteCustomerModal}
        onClose={closeDeleteCustomerModal}
        trigger={false}
        title="Delete Customer"
      >
        <div className="w-full ">
          <DeleteCustomer
            closeModal={closeDeleteCustomerModal}
            onDeleted={() => router.push("/customers")}
            customer={customer}
          />
        </div>
      </CustomModal>
    </div>
  );
};

export default Contact;

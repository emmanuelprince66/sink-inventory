"use client";

import { useCreateSubAccountMutation } from "@/api/transactions/create-sub-account";
import { CustomModal } from "@/components/app/CustomModal";
import { DatePickerWithRange } from "@/components/app/DateRangePicker";
import KycConfirm from "@/components/app/kyc/KycConfirm";
import { SearchInput } from "@/components/app/SearchInput";
import { Spinner } from "@/components/app/Spinner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useTransactionsHook } from "@/hooks/useTransactionsHook";
import { cn } from "@/lib/utils";
import { formatToNaira } from "@/utils/formatMoney";
import {
  ArrowDownLeft,
  ArrowUpRight,
  CreditCard,
  Landmark,
  Plus,
  Wallet,
} from "lucide-react";
import Link from "next/link";
import { ReactNode, useEffect, useState } from "react";
import { DateRange } from "react-day-picker";
import NoTransactions from "./NoTransactions";
import TransactionTable from "./TransactionTable";

const KPI_STYLES: Record<
  "wallet" | "inflow" | "outflow",
  { bg: string; iconColor: string; icon: ReactNode }
> = {
  wallet: {
    bg: "bg-success-2",
    iconColor: "text-success-1",
    icon: <Wallet className="w-5 h-5" />,
  },
  inflow: {
    bg: "bg-info-2",
    iconColor: "text-info-1",
    icon: <ArrowDownLeft className="w-5 h-5" />,
  },
  outflow: {
    bg: "bg-error-2",
    iconColor: "text-error-1",
    icon: <ArrowUpRight className="w-5 h-5" />,
  },
};

const KpiCard = ({
  title,
  amount,
  type,
}: {
  title: string;
  amount: string;
  type: "wallet" | "inflow" | "outflow";
}) => {
  const variant = KPI_STYLES[type];
  return (
    <div className={cn("rounded-2xl p-4 sm:p-5", variant.bg)}>
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-xl bg-white/60">
          <span className={variant.iconColor}>{variant.icon}</span>
        </div>
        <span className={cn("text-sm font-bold", variant.iconColor)}>
          {title}
        </span>
      </div>
      <div className="mt-4">
        <span className="text-2xl font-extrabold text-grey-1">{amount}</span>
      </div>
    </div>
  );
};

const Transactions = () => {
  const [searchInput, setSearchInput] = useState("");
  const [dateRange, setDateRange] = useState<DateRange | undefined>(
    undefined,
  );
  const [page, setPage] = useState(1);

  const [showKycModal, setShowKycModal] = useState(false);
  const [showSubAccountModal, setShowSubAccountModal] = useState(false);
  const [previousAccount, setPreviousAccount] = useState("");
  const [branchName, setBranchName] = useState("");

  const filterOptions = ["All", "Credit", "Debit"] as const;
  const filterMapping = {
    All: "",
    Credit: "Credit",
    Debit: "Debit",
  } as const;
  const [activeFilter, setActiveFilter] = useState<
    (typeof filterOptions)[number]
  >(filterOptions[0]);
  const handleFilterChange = (filter: (typeof filterOptions)[number]) => {
    setActiveFilter(filter);
  };

  const { TrxData, TrxDataLoading, user, businessData } = useTransactionsHook({
    searchInput,
    dateRange,
    page,
    type: filterMapping[activeFilter],
    setShowPinModal: () => {},
  });

  const hasAccountNumber =
    !!TrxData?.data?.results?.wallet_details?.account_number;

  const { mutate: createSubAccount, isPending: isCreatingSubAccount } =
    useCreateSubAccountMutation({
      onSuccess: () => {
        setShowSubAccountModal(false);
        setPreviousAccount("");
        setBranchName("");
      },
    });

  const handleCreateSubAccount = () => {
    if (!previousAccount.trim() || !branchName.trim()) return;
    createSubAccount({
      body: { previous_account: previousAccount, branch: branchName },
      businessId: businessData?.id,
    });
  };

  const handleSearchChange = (value: string) => {
    setSearchInput(value);
  };

  useEffect(() => {
    if (businessData) {
      businessData?.kyc ? setShowKycModal(false) : setShowKycModal(true);
    }
  }, [businessData]);

  return (
    <>
      <div className="w-full flex flex-col gap-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-grey-1">
            Transactions
          </h1>
          <div className="w-full sm:w-48">
            <DatePickerWithRange
              date={dateRange}
              onDateChange={setDateRange}
              className="w-full"
            />
          </div>
        </div>

        {/* KPI Cards */}
        {TrxDataLoading || !TrxData ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 w-full">
            {Array.from({ length: 3 }).map((_, index) => (
              <Skeleton
                key={index}
                className="h-24 w-full rounded-2xl bg-grey-5"
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 w-full">
            {user?.role === "OWNER" && (
              <KpiCard
                title="Wallet Balance"
                amount={formatToNaira(
                  TrxData?.data?.results?.wallet_details?.balance || 0,
                )}
                type="wallet"
              />
            )}

            <KpiCard
              title="Total Inflow"
              amount={formatToNaira(TrxData?.data?.results?.inflow || 0)}
              type="inflow"
            />

            {user?.role === "OWNER" && (
              <KpiCard
                title="Total Outflow"
                amount={formatToNaira(TrxData?.data?.results?.outflow || 0)}
                type="outflow"
              />
            )}
          </div>
        )}

        {/* Main Account Card */}
        {TrxDataLoading || !TrxData ? (
          <Skeleton className="h-36 w-full rounded-2xl bg-grey-5" />
        ) : (
          <div className="w-full p-4 sm:p-5 bg-primary-green-100 text-white rounded-2xl">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/10 rounded-full">
                  <Landmark className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-bold">Main Account</p>
                  <p className="text-xs text-white/70 mt-0.5">
                    {`${
                      TrxData?.data?.results?.wallet_details?.bank_name || "Nil"
                    }`}{" "}
                    •{" "}
                    {`${
                      TrxData?.data?.results?.wallet_details?.account_number ||
                      "Nil"
                    }`}
                  </p>
                  <p className="text-xs text-white/70 mt-0.5">
                    Account Name:{" "}
                    <span className="font-medium text-white">{`${
                      TrxData?.data?.results?.wallet_details?.account_name ||
                      "Nil"
                    }`}</span>
                  </p>
                  {user?.role === "OWNER" && (
                    <p className="text-xs text-white/70 mt-0.5">
                      Available Balance:{" "}
                      <span className="font-bold text-white">
                        {formatToNaira(
                          TrxData?.data?.results?.wallet_details?.balance ||
                            0,
                        )}
                      </span>
                    </p>
                  )}
                </div>
              </div>

              {user?.role === "OWNER" && (
                <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                  <Link href="transactions/transfer" className="flex-1 sm:flex-none">
                    <Button
                      variant="outline"
                      className="w-full border-white/30 bg-transparent text-white hover:bg-white/10 hover:text-white"
                    >
                      Transfer
                    </Button>
                  </Link>
                  <Button
                    className="flex-1 sm:flex-none bg-white text-primary-green-100 hover:bg-white/90 whitespace-nowrap"
                    disabled={hasAccountNumber}
                    onClick={() => setShowSubAccountModal(true)}
                  >
                    <Plus className="w-4 h-4 mr-1 shrink-0" />
                    Create Sub Account
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* BNPL Transactions (UI-only until backend ships BNPL data) */}
        <div className="w-full p-4 sm:p-5 border border-grey-5 bg-white rounded-2xl">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-warning-2 rounded-full">
                <CreditCard className="w-5 h-5 text-warning-1" />
              </div>
              <div>
                <p className="text-sm font-bold text-grey-1">
                  BNPL Transactions
                </p>
                <p className="text-xs text-grey-3">
                  Akawopay Buy Now, Pay Later activity
                </p>
              </div>
            </div>
            <Link
              href="/operations/general-settings"
              className="text-xs font-bold text-primary-green-300 hover:underline"
            >
              Manage BNPL settings
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-grey-6/60 border border-grey-5 rounded-xl p-3">
              <p className="text-[11px] font-bold text-grey-3 uppercase tracking-wide">
                Active loans
              </p>
              <p className="text-lg font-extrabold text-grey-1 mt-1">0</p>
            </div>
            <div className="bg-grey-6/60 border border-grey-5 rounded-xl p-3">
              <p className="text-[11px] font-bold text-grey-3 uppercase tracking-wide">
                Outstanding
              </p>
              <p className="text-lg font-extrabold text-grey-1 mt-1">
                {formatToNaira(0)}
              </p>
            </div>
            <div className="bg-grey-6/60 border border-grey-5 rounded-xl p-3">
              <p className="text-[11px] font-bold text-grey-3 uppercase tracking-wide">
                Paid out (this month)
              </p>
              <p className="text-lg font-extrabold text-grey-1 mt-1">
                {formatToNaira(0)}
              </p>
            </div>
          </div>

          <div className="mt-4 text-center py-6 border border-dashed border-grey-5 rounded-xl bg-grey-6/30">
            <p className="text-sm font-medium text-grey-2">
              No BNPL transactions yet
            </p>
            <p className="text-xs text-grey-4 mt-1">
              Once a customer pays with Akawopay at checkout, their instalment
              plan will appear here.
            </p>
          </div>
        </div>

        {/* Transactions Table Card */}
        <div className="w-full rounded-2xl border border-grey-5 bg-white overflow-hidden">
          <div className="p-4 sm:p-6 border-b border-grey-5">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
              <div className="w-full sm:w-72">
                <SearchInput
                  placeholder="Search transactions..."
                  value={searchInput}
                  onValueChange={handleSearchChange}
                  className="h-9"
                />
              </div>

              <div className="flex gap-2">
                {filterOptions.map((filter) => (
                  <button
                    key={filter}
                    onClick={() => handleFilterChange(filter)}
                    className={cn(
                      "px-4 py-1.5 h-9 text-sm font-bold cursor-pointer rounded-full transition-all whitespace-nowrap",
                      activeFilter === filter
                        ? "bg-primary-green-300 text-white shadow-sm"
                        : "bg-white border border-grey-5 text-grey-2 hover:bg-grey-6",
                    )}
                  >
                    {filter}
                  </button>
                ))}
              </div>
            </div>

            {searchInput.length > 0 && searchInput.length < 3 && (
              <div className="mt-2 text-xs text-grey-4">
                Type at least 3 characters to search
              </div>
            )}
          </div>

          {!TrxData || TrxDataLoading ? (
            <div className="w-full p-4 sm:p-6">
              <div className="space-y-4">
                <Skeleton className="h-10 w-full bg-grey-5" />
                {Array.from({ length: 5 }).map((_, index) => (
                  <Skeleton key={index} className="h-16 w-full bg-grey-5 mt-2" />
                ))}
              </div>
            </div>
          ) : TrxData?.data?.results?.transactions?.length > 0 ? (
            <TransactionTable
              setPage={setPage}
              page={page}
              response={TrxData}
              loading={false}
            />
          ) : (
            <div className="w-full flex flex-col justify-center items-center">
              <NoTransactions />
            </div>
          )}
        </div>

        {/* Verify KYC Button */}
        <div className="w-full flex justify-center pb-2">
          <Button
            onClick={() => setShowKycModal(true)}
            className="w-full sm:w-auto"
          >
            Complete KYC Verification
          </Button>
        </div>
      </div>

      {/* KYC Verification Modal */}
      <CustomModal
        isOpen={showKycModal}
        onClose={() => setShowKycModal(false)}
        title=""
      >
        <KycConfirm page={false} />
      </CustomModal>

      {/* Create Sub Account Modal */}
      <CustomModal
        isOpen={showSubAccountModal}
        onClose={() => {
          setShowSubAccountModal(false);
          setPreviousAccount("");
          setBranchName("");
        }}
        title="Create Sub Account"
      >
        <div className="flex flex-col gap-4">
          <p className="text-sm text-grey-3">
            Enter your previous account number and branch name to create a sub
            account.
          </p>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-grey-2">
              Previous Account Number
            </label>
            <Input
              placeholder="Enter previous account number"
              value={previousAccount}
              onChange={(e) => setPreviousAccount(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-grey-2">
              Branch Name
            </label>
            <Input
              placeholder="Enter branch name"
              value={branchName}
              onChange={(e) => setBranchName(e.target.value)}
            />
          </div>
          <Button
            onClick={handleCreateSubAccount}
            disabled={
              !previousAccount.trim() ||
              !branchName.trim() ||
              isCreatingSubAccount
            }
            className="w-full h-12"
          >
            {isCreatingSubAccount ? <Spinner /> : "Create Sub Account"}
          </Button>
        </div>
      </CustomModal>
    </>
  );
};

export default Transactions;

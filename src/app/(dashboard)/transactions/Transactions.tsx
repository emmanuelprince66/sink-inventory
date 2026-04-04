"use client";

import { useCreateSubAccountMutation } from "@/api/transactions/create-sub-account";
import { CustomCard } from "@/components/app/CustomCard";
import { CustomModal } from "@/components/app/CustomModal";
import { DatePickerWithRange } from "@/components/app/DateRangePicker";
import KycConfirm from "@/components/app/kyc/KycConfirm";
import { SearchInput } from "@/components/app/SearchInput";
import { Spinner } from "@/components/app/Spinner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useTransactionsHook } from "@/hooks/useTransactionsHook";
import { formatToNaira } from "@/utils/formatMoney";
import { ArrowDownLeft, ArrowUpRight, Landmark, Plus, Wallet } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { DateRange } from "react-day-picker";
import NoTransactions from "./NoTransactions";
import TransactionTable from "./TransactionTable";
interface Transaction {
  id: string;
  customerName: string;
  type: "credit" | "debit";
  amount: number;
  date: string;
  status: "completed" | "pending" | "failed";
}

const Transactions = () => {
  const [searchInput, setSearchInput] = useState("");
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(),
    to: new Date(),
  });
  const [page, setPage] = useState(1);

  const [showPinModal, setShowPinModal] = useState(false);
  const [showKycModal, setShowKycModal] = useState(false);
  const [showTransfer, setShowTransfer] = useState(false);
  const [showChangePin, setShowChangePin] = useState(false);
  const [showSubAccountModal, setShowSubAccountModal] = useState(false);
  const [previousAccount, setPreviousAccount] = useState("");

  const filterOptions = ["All", "Credit", "Debit"] as const;
  const filterMapping = {
    All: "",
    Credit: "Credit",
    Debit: "Debit",
  } as const;
  const [activeFilter, setActiveFilter] = useState<
    (typeof filterOptions)[number]
  >(filterOptions[0]);
  const [kycType, setKycType] = useState<"business" | "individual">(
    "individual",
  );
  const handleFilterChange = (filter: (typeof filterOptions)[number]) => {
    setActiveFilter(filter);
  };

  const { TrxData, TrxDataLoading, user, businessData } = useTransactionsHook({
    searchInput,
    dateRange,
    page,
    type: filterMapping[activeFilter],
    setShowPinModal,
  });

  const hasAccountNumber =
    !!TrxData?.data?.results?.wallet_details?.account_number;

  const { mutate: createSubAccount, isPending: isCreatingSubAccount } =
    useCreateSubAccountMutation({
      onSuccess: () => {
        setShowSubAccountModal(false);
        setPreviousAccount("");
      },
    });

  const handleCreateSubAccount = () => {
    if (!previousAccount.trim()) return;
    createSubAccount({
      body: { previous_account: previousAccount },
      businessId: businessData?.id,
    });
  };
  console.log("TrxData", TrxData);

  // const formatToNaira = (amount: number) => {
  //   return new Intl.NumberFormat("en-NG", {
  //     style: "currency",
  //     currency: "NGN",
  //   }).format(amount);
  // };
  // console.log("user", user);
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
      <div className="w-full h-full flex flex-col justify-start gap-5 items-start px-2 sm:px-1">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between w-full gap-4">
          <p className="text-xl sm:text-2xl lg:text-3xl text-primary-black-100 font-medium">
            Transactions
          </p>
          <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2 w-full sm:w-auto">
            <DatePickerWithRange
              date={dateRange}
              onDateChange={setDateRange}
              className="w-full sm:w-auto"
            />
          </div>
        </div>

        {TrxDataLoading || !TrxData ? (
          <div className="flex gap-4 w-[80%]">
            {Array.from({ length: 3 }).map((_, index) => (
              <CustomCard key={index} className="w-full border-gray-200">
                <div className="flex flex-col gap-6 items-start">
                  <Skeleton className="h-4 w-[100px] bg-[#eef4ef]" />
                  <Skeleton className="h-6 w-[70px] bg-[#eef4ef]" />
                </div>
              </CustomCard>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
            {/* Wallet Balance */}

            {user?.role === "OWNER" && (
              <CustomCard className="p-4 bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200 rounded-lg">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary-green-100 rounded-full">
                      <Wallet className="w-5 h-5 text-primary-green-600" />
                    </div>
                    <span className="text-sm font-medium text-gray-600">
                      Wallet Balance
                    </span>
                  </div>
                </div>
                <div className="mt-4">
                  <span className="text-2xl font-bold text-gray-900">
                    {/* {formatToNaira(walletBalance)} */}
                    {formatToNaira(
                      TrxData?.data?.results?.wallet_details?.balance || 0,
                    )}
                  </span>
                </div>
              </CustomCard>
            )}

            {/* Inflow */}
            <CustomCard className="p-4 bg-blue-50 border border-blue-100 rounded-lg">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-full">
                    <ArrowDownLeft className="w-5 h-5 text-blue-600" />
                  </div>
                  <span className="text-sm font-medium text-gray-600">
                    Total Inflow
                  </span>
                </div>
              </div>
              <div className="mt-4">
                <span className="text-2xl font-bold text-gray-900">
                  {formatToNaira(TrxData?.data?.results?.inflow || 0)}
                </span>
              </div>
            </CustomCard>

            {/* Outflow */}

            {user?.role === "OWNER" && (
              <CustomCard className="p-4 bg-purple-50 border border-purple-100 rounded-lg">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-100 rounded-full">
                      <ArrowUpRight className="w-5 h-5 text-purple-600" />
                    </div>
                    <span className="text-sm font-medium text-gray-600">
                      Total Outflow
                    </span>
                  </div>
                </div>
                <div className="mt-4">
                  <span className="text-2xl font-bold text-gray-900">
                    {formatToNaira(TrxData?.data?.results?.outflow || 0)}
                  </span>
                </div>
              </CustomCard>
            )}
          </div>
        )}

        {/* Stats Cards */}

        {/* Bank Account Card */}

        {TrxDataLoading || !TrxData ? (
          <CustomCard className="w-full border-gray-200">
            <div className="flex flex-col gap-6 items-start">
              <Skeleton className="h-4 w-full bg-[#eef4ef]" />
              <Skeleton className="h-6 w-[300px] bg-[#eef4ef]" />
              <Skeleton className="h-6 w-[120px] bg-[#eef4ef]" />
            </div>
          </CustomCard>
        ) : (
          <CustomCard className="w-full p-4 bg-gradient-to-r from-green-600 to-emerald-700 text-white">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-full">
                  <Landmark className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-medium">Main Account</p>
                  <p className="text-xs opacity-90">
                    {`${
                      TrxData?.data?.results?.wallet_details?.bank_name || "Nil"
                    }`}{" "}
                    •{" "}
                    {`${
                      TrxData?.data?.results?.wallet_details?.account_number ||
                      "Nil"
                    }`}
                  </p>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                {/* <Button
                  variant="outline"
                  className="bg-white/10 text-white hover:bg-white/20 w-full sm:w-auto"
                >
                  View Details
                </Button> */}

                {user?.role === "OWNER" && (
                  <>
                    <Link href="transactions/transfer">
                      <Button
                        variant="outline"
                        className="bg-white/10 min-w-[150px] min-h-[50px] text-white hover:bg-white/20 w-full sm:w-auto"
                      >
                        Transfer
                      </Button>
                    </Link>
                    <Button
                      variant="outline"
                      className="bg-white/10 min-w-[150px] min-h-[50px] text-white hover:bg-white/20 w-full sm:w-auto"
                      disabled={hasAccountNumber}
                      onClick={() => setShowSubAccountModal(true)}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Create Sub Account
                    </Button>
                  </>
                )}
              </div>
            </div>
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-2">
              <p className="text-sm">
                Account Name:{" "}
                <span className=" font-medium">{`${
                  TrxData?.data?.results?.wallet_details?.account_name || "Nil"
                }`}</span>
              </p>

              {user?.role === "OWNER" && (
                <p className="text-sm">
                  Available Balance:{" "}
                  <span className="font-medium">
                    {formatToNaira(
                      TrxData?.data?.results?.wallet_details?.balance || 0,
                    )}
                  </span>
                </p>
              )}
            </div>
          </CustomCard>
        )}

        {/* Search and Filters */}
        <div className="w-full flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="w-full md:w-1/2 mb-4 mt-4">
            <SearchInput
              placeholder="Search ..."
              value={searchInput}
              onValueChange={handleSearchChange}
            />
            {searchInput.length > 0 && searchInput.length < 3 && (
              <div className="mt-1 text-sm text-muted-foreground">
                Type at least 3 characters to search
              </div>
            )}
          </div>
          <div className="flex flex-wrap gap-2 w-full md:w-auto">
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
        </div>

        {/* Transactions Table (hidden on mobile) */}

        {!TrxData || TrxDataLoading ? (
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
        ) : (
          <div className="w-full">
            {TrxData?.data?.results?.transactions?.length > 0 ? (
              <TransactionTable
                setPage={setPage}
                page={page}
                response={TrxData}
                loading={false}
              />
            ) : (
              <div className="w-full h-full flex flex-col justify-center items-center mt-8">
                <NoTransactions />
              </div>
            )}
          </div>
        )}

        {/* Mobile Transaction List (visible only on mobile) */}

        {/* Verify KYC Button */}
        <div className="w-full flex justify-center mt-6 pb-6">
          <Button
            onClick={() => setShowKycModal(true)}
            className="bg-primary-green-600 hover:bg-primary-green-700 w-full sm:w-auto"
          >
            Complete KYC Verification
          </Button>
        </div>
      </div>

      {/* Transaction Pin Modal */}

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
        }}
        title="Create Sub Account"
      >
        <div className="flex flex-col gap-4 p-2">
          <p className="text-sm text-gray-600">
            Enter your previous account number to create a sub account.
          </p>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-700">
              Previous Account Number
            </label>
            <Input
              placeholder="Enter previous account number"
              value={previousAccount}
              onChange={(e) => setPreviousAccount(e.target.value)}
            />
          </div>
          <Button
            onClick={handleCreateSubAccount}
            disabled={!previousAccount.trim() || isCreatingSubAccount}
            className="w-full h-12 bg-green-600 hover:bg-green-700 text-white"
          >
            {isCreatingSubAccount ? <Spinner /> : "Create Sub Account"}
          </Button>
        </div>
      </CustomModal>
      {/* KYC Verification Modal */}
      {/* <CustomModal
        isOpen={showTrxDetails}
        onClose={() => setShowTrxDetails(false)}
        title="Transaction Details"
      >
        <TransactionDetails />
      </CustomModal> */}
      {/* KYC Verification Modal */}
      {/* <CustomModal
        isOpen={showTransfer}
        onClose={() => setShowTransfer(false)}
        title="Transfer Funds"
      >
        <Transfer trxData={TrxData} />
      </CustomModal> */}
    </>
  );
};

export default Transactions;

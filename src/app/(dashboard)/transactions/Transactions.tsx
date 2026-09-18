"use client";

import { useCreateSubAccountMutation } from "@/api/transactions/create-sub-account";
import { CustomModal } from "@/components/app/CustomModal";
import CustomSelect, {
  SelectOption,
  SelectValue,
} from "@/components/app/CustomSelect";
import { DatePickerWithRange } from "@/components/app/DateRangePicker";
import { OtpInput } from "@/components/app/OtpInput";
import { SearchInput } from "@/components/app/SearchInput";
import { Spinner } from "@/components/app/Spinner";
import { TableSkeleton } from "@/components/app/TableSkeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useBusinessBanks } from "@/hooks/useBusinessBanks";
import { useTransactionsHook } from "@/hooks/useTransactionsHook";
import {
  useUnifiedTransactionsHook,
  type UnifiedTransactionFilter,
} from "@/hooks/useUnifiedTransactionsHook";
import { cn } from "@/lib/utils";
import { formatToNaira } from "@/utils/formatMoney";
import {
  ArrowDownLeft,
  ArrowLeft,
  ArrowUpRight,
  Check,
  ChevronDown,
  Copy,
  FileText,
  Landmark,
  Plus,
  Send,
  Settings,
  Wallet,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { DateRange } from "react-day-picker";
import NoTransactions from "./NoTransactions";
import TransactionTable from "./TransactionTable";
import TransferReceipt, {
  extractTransactionId,
  type TransferReceiptDetails,
} from "./TransferReceipt";

type ReportFormat = "PDF" | "Excel" | "CSV";

const accountInitials = (bankName?: string) =>
  bankName
    ?.split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "BK";

const maskAccount = (accountNumber?: string) =>
  accountNumber ? `•••• ${accountNumber.slice(-4)}` : "••••";

const amount = (value: unknown) => {
  const parsed = Number(value ?? 0);
  return formatToNaira(Number.isFinite(parsed) ? parsed : 0);
};

const Transactions = () => {
  const [searchInput, setSearchInput] = useState("");
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [page, setPage] = useState(1);
  const [activeFilter, setActiveFilter] =
    useState<UnifiedTransactionFilter>("ALL");
  const [showSubAccountModal, setShowSubAccountModal] = useState(false);
  const [showFundModal, setShowFundModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [showKycModal, setShowKycModal] = useState(false);
  const [receiptDetails, setReceiptDetails] =
    useState<TransferReceiptDetails | null>(null);
  const [showAllAccounts, setShowAllAccounts] = useState(false);
  const [transferStep, setTransferStep] = useState<1 | 2>(1);
  const [recipientBank, setRecipientBank] = useState<SelectValue>(null);
  const [category, setCategory] = useState<SelectValue>(null);
  const [accountNumber, setAccountNumber] = useState("");
  const [transferAmount, setTransferAmount] = useState("");
  const [narration, setNarration] = useState("");
  const [pin, setPin] = useState("");
  const [transferError, setTransferError] = useState("");
  const [previousAccount, setPreviousAccount] = useState("");
  const [branchName, setBranchName] = useState("");
  const [reportFormat, setReportFormat] = useState<ReportFormat>("PDF");

  const filterMapping = {
    ALL: "",
    CREDIT: "CREDIT",
    DEBIT: "DEBIT",
    ONLINE: "",
    BNPL: "",
  } as const;

  const { banks, selectedBank, setSelectedBankId, canSwitchBanks, isPrimary } =
    useBusinessBanks();
  const {
    TrxData,
    TrxDataLoading,
    businessData,
    BankTrxData,
    CategoriesData,
    BankDataLoading,
    CategoriesDataLoading,
    beneficiaryInfo,
    enquiryLoading,
    TransferFundsLoading,
    handleSubmitTransferFunds,
  } = useTransactionsHook({
    searchInput,
    dateRange,
    page,
    type: filterMapping[activeFilter],
    setShowPinModal: () => {},
    recipientBank,
    accountNumber,
  });
  const { response: unifiedTransactions, loading: unifiedTransactionsLoading } =
    useUnifiedTransactionsHook({
      page,
      searchInput,
      dateRange,
      filter: activeFilter,
    });

  console.log("TrxDataLoading", TrxDataLoading);
  console.log("TrxData", TrxData);

  const { mutate: createSubAccount, isPending: isCreatingSubAccount } =
    useCreateSubAccountMutation({
      onSuccess: () => {
        setShowSubAccountModal(false);
        setPreviousAccount("");
        setBranchName("");
      },
    });

  const accountList = useMemo(() => {
    if (banks.length) return banks;

    const wallet = TrxData?.data?.results?.wallet_details;
    return wallet
      ? [
          {
            id: "wallet",
            bank_name: wallet.bank_name,
            account_name: wallet.account_name,
            account_number: wallet.account_number,
          },
        ]
      : [];
  }, [banks, TrxData]);

  const wallet = TrxData?.data?.results?.wallet_details;
  const balance = wallet?.balance || 0;
  const inflow = TrxData?.data?.results?.inflow || 0;
  const outflow = TrxData?.data?.results?.outflow || 0;
  const needsKyc = Boolean(businessData) && !businessData?.kyc;
  const bankOptions: SelectOption[] = Array.isArray(BankTrxData)
    ? BankTrxData.map((bank: any) => ({
        value: bank.bankCode,
        label: bank.name,
        ...bank,
      }))
    : [];
  const categoryOptions: SelectOption[] = Array.isArray(CategoriesData?.data)
    ? CategoriesData.data.map((item: any) => ({
        value: item.id,
        label: item.name,
        ...item,
      }))
    : [];

  const handleCreateSubAccount = () => {
    if (!previousAccount.trim() || !branchName.trim()) return;
    createSubAccount({
      body: { previous_account: previousAccount, branch: branchName },
      businessId: businessData?.id,
    });
  };

  const accountLabel = (account: (typeof accountList)[number]) =>
    isPrimary(account) ? "Current" : account.account_name || "Account";

  useEffect(() => {
    if (transferStep === 1 && beneficiaryInfo?.data?.name) {
      setTransferError("");
    }
  }, [beneficiaryInfo, transferStep]);

  useEffect(() => {
    if (needsKyc) {
      setShowKycModal(true);
    }
  }, [needsKyc]);

  const closeTransferModal = () => {
    setShowTransferModal(false);
    setTransferStep(1);
    setRecipientBank(null);
    setCategory(null);
    setAccountNumber("");
    setTransferAmount("");
    setNarration("");
    setPin("");
    setTransferError("");
  };

  const continueTransfer = () => {
    if (!recipientBank || accountNumber.length !== 10) {
      setTransferError(
        "Select a bank and enter a valid 10-digit account number.",
      );
      return;
    }
    if (!beneficiaryInfo?.data?.name) {
      setTransferError("Verify the beneficiary before continuing.");
      return;
    }
    setTransferError("");
    setTransferStep(2);
  };

  const submitTransfer = () => {
    if (pin.length !== 4) {
      setTransferError("Enter your 4-digit transaction PIN.");
      return;
    }
    handleSubmitTransferFunds(
      {
        pin,
        amount: transferAmount,
        narration,
        category,
        beneficiaryRef: beneficiaryInfo?.data?.ref,
      },
      {
        onSuccess: (response) => {
          setReceiptDetails({
            amount: transferAmount,
            senderName: selectedBank?.account_name || wallet?.account_name,
            beneficiaryName: beneficiaryInfo?.data?.name,
            beneficiaryAccount: accountNumber,
            beneficiaryBank: recipientBank?.label,
            narration,
            transactionId: extractTransactionId(response),
            date: new Date().toISOString(),
            status: "Successful",
          });
          closeTransferModal();
          setShowReceiptModal(true);
        },
      },
    );
  };

  return (
    <>
      <div className="min-h-full w-full bg-[#f4f5f3] px-3 py-5 sm:px-5 lg:px-8">
        <div className="mx-auto flex w-full max-w-[1360px] flex-col gap-5">
          <header className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight text-grey-1 sm:text-3xl">
                Transactions
              </h1>
              <div className="mt-2 flex items-center gap-3">
                <p className="text-sm text-grey-3">
                  {accountList.length || 0} connected accounts
                </p>
              </div>
            </div>

            <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto">
              <DatePickerWithRange
                date={dateRange}
                onDateChange={(range) => {
                  setDateRange(range);
                  setPage(1);
                }}
                className="w-full sm:w-auto"
              />
              <Button
                type="button"
                className="h-9 rounded-md px-4"
                onClick={() => setShowSubAccountModal(true)}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add account
              </Button>
            </div>
          </header>

          <section className="scrollbar-thin flex w-full items-stretch gap-3 overflow-x-auto pb-2">
            <button
              type="button"
              onClick={() => setShowAllAccounts(true)}
              className={cn(
                "flex min-h-[164px] w-[260px] shrink-0 cursor-pointer flex-col justify-between rounded-2xl p-5 text-left text-white shadow-sm transition lg:w-[calc((100%-3rem)/5)]",
                showAllAccounts
                  ? "bg-[#17251e] ring-2 ring-primary-green-300/40"
                  : "bg-[#1e2d25] hover:bg-[#263b2f]",
              )}
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-white/70">
                  All Accounts
                </span>
                <span className="rounded-full bg-white/10 px-2 py-1 text-xs">
                  {accountList.length}
                </span>
              </div>
              <div>
                <div className="mb-2 flex -space-x-2">
                  {accountList.slice(0, 4).map((account, index) => (
                    <span
                      key={account.id}
                      className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-[#1e2d25] text-[9px] font-bold text-grey-1"
                      style={{
                        backgroundColor: [
                          "#b9dfc4",
                          "#9ed5ef",
                          "#f3c17c",
                          "#c7a9db",
                        ][index % 4],
                      }}
                    >
                      {accountInitials(account.bank_name)}
                    </span>
                  ))}
                </div>
                <span className="text-xs text-white/70">
                  {accountList.length} accounts connected
                </span>
              </div>
            </button>

            {accountList.map((account) => {
              const selected = selectedBank?.id === account.id;
              return (
                <button
                  type="button"
                  key={account.id}
                  onClick={() => {
                    setShowAllAccounts(false);
                    if (canSwitchBanks) setSelectedBankId(account.id);
                  }}
                  className={cn(
                    "min-h-[164px] w-[260px] shrink-0 cursor-pointer rounded-2xl border p-5 text-left shadow-sm transition hover:border-primary-green-300 hover:shadow-md lg:w-[calc((100%-3rem)/5)]",
                    selected && !showAllAccounts
                      ? "border-[#b8d9c0] bg-[#dfeee3] shadow-sm"
                      : "border-grey-5 bg-white hover:border-primary-green-300",
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-green-300 text-[10px] font-bold text-white ring-2 ring-primary-green-300/15">
                        {accountInitials(account.bank_name)}
                      </span>
                      <span
                        title={accountLabel(account)}
                        className="min-w-0 truncate text-[10px] font-bold uppercase tracking-wider text-grey-3"
                      >
                        {accountLabel(account)}
                      </span>
                    </div>
                    <Wallet className="h-5 w-5 shrink-0 text-grey-3" />
                  </div>
                  <p className="mt-4 text-lg font-extrabold text-grey-1">
                    {amount(selected ? balance : 0)}
                  </p>
                  <p
                    title={account.account_name || "Bank account"}
                    className="mt-1 max-w-full truncate text-xs text-grey-2"
                  >
                    {account.account_name || "Bank account"}
                  </p>
                  <p className="mt-1 truncate text-[10px] text-grey-3">
                    {account.bank_name || "Bank"} ·{" "}
                    {maskAccount(account.account_number)}
                  </p>
                </button>
              );
            })}
          </section>

          {showAllAccounts ? (
            <section className="rounded-2xl bg-[#223329] p-5 text-white shadow-[0_12px_30px_rgba(20,45,31,0.14)] sm:p-6">
              <div className="flex flex-col gap-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-white/60">
                      All Accounts
                    </p>
                    <h2 className="mt-2 text-lg font-extrabold">
                      Select an account to transfer, fund or generate statements
                    </h2>
                  </div>
                  <div className="grid w-full grid-cols-2 gap-2 sm:flex sm:w-auto">
                    <Button
                      onClick={() => setShowReportModal(true)}
                      className="w-full border border-white/20 bg-white/10 text-white hover:bg-white/20 sm:w-auto"
                    >
                      <FileText className="mr-2 h-4 w-4" />
                      Report
                    </Button>
                    <Button
                      onClick={() => setShowSubAccountModal(true)}
                      className="w-full border border-white/20 bg-white/10 text-white hover:bg-white/20 sm:w-auto"
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Add Account
                    </Button>
                  </div>
                </div>
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                  {accountList.map((account) => (
                    <button
                      type="button"
                      key={account.id}
                      onClick={() => {
                        setShowAllAccounts(false);
                        if (canSwitchBanks) setSelectedBankId(account.id);
                      }}
                      className="cursor-pointer rounded-2xl border border-white/10 bg-white/10 p-4 text-left transition hover:border-white/25 hover:bg-white/15 hover:shadow-md"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-wider text-white/55">
                            {account.bank_name || "Bank"}
                          </p>
                          <p className="mt-4 text-lg font-extrabold">
                            {amount(
                              selectedBank?.id === account.id ? balance : 0,
                            )}
                          </p>
                        </div>
                        <span className="h-4 w-4 rounded-full bg-primary-green-300" />
                      </div>
                      <p
                        title={account.account_name || "Bank account"}
                        className="mt-2 truncate text-xs text-white/80"
                      >
                        {account.account_name || "Bank account"}
                      </p>
                      <p className="mt-1 truncate text-[10px] text-white/55">
                        Select →
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            </section>
          ) : (
            <section className="rounded-2xl bg-[#223329] p-5 text-white shadow-[0_12px_30px_rgba(20,45,31,0.14)] sm:p-6">
              <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex min-w-0 items-center gap-3">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/10">
                    <Landmark className="h-5 w-5" />
                  </span>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p
                        title={selectedBank?.account_name || "Main Account"}
                        className="max-w-[280px] truncate text-sm font-bold"
                      >
                        {selectedBank?.account_name || "Main Account"}
                      </p>
                      <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px]">
                        {selectedBank && isPrimary(selectedBank)
                          ? "Current"
                          : "Sub Account"}
                      </span>
                    </div>
                    <p className="mt-1 truncate text-xs text-white/70">
                      {selectedBank?.bank_name ||
                        wallet?.bank_name ||
                        "Bank account"}{" "}
                      ·{" "}
                      {selectedBank?.account_number ||
                        wallet?.account_number ||
                        "Nil"}
                    </p>
                    <p className="mt-1 truncate text-xs text-white/60">
                      {selectedBank?.account_name ||
                        wallet?.account_name ||
                        "Account name"}
                    </p>
                  </div>
                </div>

                <div className="lg:text-right">
                  <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-white/60">
                    Available Balance
                  </p>
                  <p className="mt-1 text-3xl font-extrabold tracking-tight">
                    {amount(balance)}
                  </p>
                </div>

                <div className="grid w-full grid-cols-2 gap-2 sm:flex sm:w-auto lg:justify-end">
                  <Button
                    onClick={() => setShowTransferModal(true)}
                    className="w-full border border-white/20 bg-white/10 text-white hover:bg-white/20 sm:w-auto"
                  >
                    <Send className="mr-2 h-4 w-4" />
                    Transfer
                  </Button>
                  <Button
                    className="w-full border border-white/20 bg-white/10 text-white hover:bg-white/20 sm:w-auto"
                    onClick={() => setShowFundModal(true)}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Fund
                  </Button>
                  <Button
                    className="w-full border border-white/20 bg-white/10 text-white hover:bg-white/20 sm:w-auto"
                    onClick={() => setShowReportModal(true)}
                  >
                    <FileText className="mr-2 h-4 w-4" />
                    Report
                  </Button>
                  <Button className="w-full border border-white/20 bg-white/10 text-white hover:bg-white/20 sm:w-auto">
                    <Settings className="mr-2 h-4 w-4" />
                    Manage
                  </Button>
                </div>
              </div>
            </section>
          )}

          <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <div className="rounded-2xl border border-info-1/20 bg-info-2 p-5">
              <div className="flex items-center gap-3 text-info-1">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-info-1 text-white">
                  <ArrowDownLeft className="h-4 w-4" />
                </span>
                <span className="font-semibold">Main Account Inflow</span>
              </div>
              <p className="mt-5 text-3xl font-extrabold text-grey-1">
                {amount(inflow)}
              </p>
              <p className="mt-1 text-xs text-grey-3">Selected date range</p>
            </div>
            <div className="rounded-2xl border border-error-1/20 bg-error-2 p-5">
              <div className="flex items-center gap-3 text-error-1">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-error-1 text-white">
                  <ArrowUpRight className="h-4 w-4" />
                </span>
                <span className="font-semibold">Main Account Outflow</span>
              </div>
              <p className="mt-5 text-3xl font-extrabold text-grey-1">
                {amount(outflow)}
              </p>
              <p className="mt-1 text-xs text-grey-3">Selected date range</p>
            </div>
          </section>

          <section className="overflow-hidden rounded-2xl border border-grey-5 bg-white">
            <div className="flex flex-col gap-4 border-b border-grey-5 p-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-info-2 text-info-1">
                  <CreditCardIcon />
                </span>
                <div>
                  <h2 className="font-bold text-grey-1">Buy Now Pay Later</h2>
                  <p className="text-xs text-grey-3">
                    Akawopay instalment loans — click any row to view or approve
                  </p>
                </div>
              </div>
              <Link
                href="/operations/general-settings"
                className="text-sm font-bold text-primary-green-300 hover:underline"
              >
                Settings
              </Link>
            </div>
            <div className="grid grid-cols-1  border-b border-grey-5 md:grid-cols-3 ">
              {[
                ["Active loans", "0", "text-info-1"],
                ["Total outstanding", amount(0), "text-error-1"],
                ["Total paid", amount(0), "text-success-1"],
              ].map(([label, value, color]) => (
                <div key={label} className="p-5">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-grey-3">
                    {label}
                  </p>
                  <p className={cn("mt-2 text-2xl font-extrabold", color)}>
                    {value}
                  </p>
                </div>
              ))}
            </div>
            {/* <div className="p-5 text-center">
              <p className="text-sm font-semibold text-grey-2">
                No BNPL transactions yet
              </p>
              <p className="mt-1 text-xs text-grey-3">
                Instalment plans will appear here once a customer uses Akawopay.
              </p>
            </div> */}
          </section>

          <section className="overflow-hidden rounded-2xl border border-grey-5 bg-white">
            <div className="flex flex-col gap-4 border-b border-grey-5 p-4 sm:p-5 lg:flex-row lg:items-center lg:justify-between">
              <div className="w-full sm:w-80">
                <SearchInput
                  placeholder="Search transactions..."
                  value={searchInput}
                  onValueChange={(value) => {
                    setSearchInput(value);
                    setPage(1);
                  }}
                  className="h-10"
                />
              </div>
              <div className="flex flex-wrap gap-2">
                {(
                  [
                    ["ALL", "All"],
                    ["CREDIT", "Credit"],
                    ["DEBIT", "Debit"],
                    ["ONLINE", "Online"],
                    ["BNPL", "BNPL"],
                  ] as const
                ).map(([filter, label]) => (
                  <button
                    key={filter}
                    type="button"
                    onClick={() => {
                      setActiveFilter(filter);
                      setPage(1);
                    }}
                    className={cn(
                      "text-sm font-bold px-4 py-1.5 rounded-full border transition-colors cursor-pointer",
                      activeFilter === filter
                        ? "bg-primary-green-300 border-primary-green-300 text-white"
                        : "border-grey-5 text-grey-2 hover:bg-secondary-6",
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {unifiedTransactionsLoading ? (
              <div className="p-5">
                <TableSkeleton
                  rows={5}
                  columns={[
                    { width: "w-24" },
                    { flex: true },
                    { width: "w-20", pill: true },
                    { width: "w-24", alignRight: true },
                    { width: "w-32", hiddenOnMobile: true },
                    { width: "w-20", pill: true },
                  ]}
                />
              </div>
            ) : unifiedTransactions?.data?.results?.transactions?.length > 0 ? (
              <TransactionTable
                setPage={setPage}
                page={page}
                response={unifiedTransactions}
                loading={false}
              />
            ) : (
              <NoTransactions />
            )}
          </section>

          {needsKyc && (
            <div className="flex justify-center pb-2">
              <Button asChild>
                <Link href="/kyc">
                  <p className="text-green-500">Complete KYC Verification</p>
                </Link>
              </Button>
            </div>
          )}
        </div>
      </div>

      <CustomModal
        isOpen={showKycModal}
        onClose={() => setShowKycModal(false)}
        title="Complete your KYC verification"
        description="Verify your business to unlock transaction actions."
      >
        <div className="space-y-5">
          <p className="text-sm leading-6 text-grey-2">
            Your transaction history is available, but you need to complete your
            business KYC verification before you can transfer funds, fund an
            account, or use other transaction actions.
          </p>
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowKycModal(false)}
              className="h-10 sm:min-w-28"
            >
              Maybe later
            </Button>

            <Button
              asChild
              className="h-10 sm:min-w-28 hover:bg-primary-green-300/90"
            >
              <Link href="/kyc" onClick={() => setShowKycModal(false)}>
                <p className="text-sm font-bold  text-primary-green-300 ">
                  Complete KYC
                </p>
              </Link>
            </Button>
          </div>
        </div>
      </CustomModal>

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
          <label className="flex flex-col gap-2 text-sm font-medium text-grey-2">
            Previous Account Number
            <Input
              placeholder="Enter previous account number"
              value={previousAccount}
              onChange={(event) => setPreviousAccount(event.target.value)}
            />
          </label>
          <label className="flex flex-col gap-2 text-sm font-medium text-grey-2">
            Branch Name
            <Input
              placeholder="Enter branch name"
              value={branchName}
              onChange={(event) => setBranchName(event.target.value)}
            />
          </label>
          <Button
            onClick={handleCreateSubAccount}
            disabled={
              !previousAccount.trim() ||
              !branchName.trim() ||
              isCreatingSubAccount
            }
            className="h-12 w-full"
          >
            {isCreatingSubAccount ? <Spinner /> : "Create Sub Account"}
          </Button>
        </div>
      </CustomModal>

      <CustomModal
        isOpen={showFundModal}
        onClose={() => setShowFundModal(false)}
        title="Fund Account"
        description="Make a bank transfer to the account below. Your balance updates instantly on receipt."
      >
        <div className="rounded-2xl bg-[#223329] p-5 text-white">
          <p className="text-[10px] font-bold uppercase tracking-wider text-white/60">
            Current account
          </p>
          <p className="mt-2 text-xl font-bold">
            {selectedBank?.account_name || "Main Account"}
          </p>
          <p className="mt-5 text-2xl font-extrabold">
            {selectedBank?.account_number || wallet?.account_number || "Nil"}
          </p>
          <p className="mt-2 text-sm text-white/70">
            {selectedBank?.bank_name || wallet?.bank_name || "Bank account"}
          </p>
        </div>
        <div className="mt-4 flex flex-col gap-3 sm:flex-row">
          <Button
            variant="outline"
            className="h-12 flex-1"
            onClick={() => {
              if (selectedBank?.account_number || wallet?.account_number) {
                void navigator.clipboard?.writeText(
                  selectedBank?.account_number || wallet?.account_number || "",
                );
              }
            }}
          >
            <Copy className="mr-2 h-4 w-4" />
            Copy Account Number
          </Button>
          <Button
            className="h-12 flex-1"
            onClick={() => setShowFundModal(false)}
          >
            Done
          </Button>
        </div>
      </CustomModal>

      <CustomModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        title="Generate Report"
        description="Export your transaction history."
      >
        <div className="space-y-5">
          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-wider text-grey-3">
              Report type
            </p>
            <div className="grid grid-cols-3 gap-2">
              {["Statement", "Summary", "BNPL Report"].map((report) => (
                <button
                  key={report}
                  type="button"
                  className="rounded-xl bg-grey-6 px-3 py-3 text-xs font-bold text-grey-2 transition hover:bg-grey-5"
                >
                  {report}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-wider text-grey-3">
              Format
            </p>
            <div className="grid grid-cols-3 gap-2">
              {(["PDF", "Excel", "CSV"] as const).map((format) => (
                <button
                  key={format}
                  type="button"
                  onClick={() => setReportFormat(format)}
                  className={cn(
                    "rounded-xl px-3 py-3 text-sm font-bold",
                    reportFormat === format
                      ? "bg-primary-green-300 text-white"
                      : "bg-grey-6 text-grey-2",
                  )}
                >
                  {format}
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Button variant="outline" onClick={() => setShowReportModal(false)}>
              Cancel
            </Button>
            <Button onClick={() => setShowReportModal(false)}>
              <FileText className="mr-2 h-4 w-4" />
              Generate Report
            </Button>
          </div>
        </div>
      </CustomModal>

      <CustomModal
        isOpen={showTransferModal}
        onClose={closeTransferModal}
        title=""
        size="md"
        className="rounded-2xl p-0"
      >
        <div className="overflow-hidden rounded-2xl">
          <div className="flex items-center gap-3 border-b border-grey-5 px-5 py-4">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#1e2d25] text-white">
              <Send className="h-5 w-5" />
            </span>
            <div className="flex-1">
              <p className="text-lg font-extrabold text-grey-1">
                Transfer Money
              </p>
              <p className="text-xs text-grey-3">Step {transferStep} of 2</p>
            </div>
          </div>

          <div className="px-5 pt-4">
            <div className="flex gap-2">
              <div className="h-1 flex-1 rounded-full bg-primary-green-300" />
              <div
                className={cn(
                  "h-1 flex-1 rounded-full",
                  transferStep === 2 ? "bg-primary-green-300" : "bg-grey-5",
                )}
              />
            </div>
          </div>

          {transferStep === 1 ? (
            <div className="space-y-5 px-5 py-5">
              <CustomSelect
                label="Beneficiary Bank"
                options={bankOptions}
                value={recipientBank}
                onChange={setRecipientBank}
                isLoading={BankDataLoading}
                placeholder="Select a bank"
                required
              />

              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-grey-3">
                  Account Number
                </label>
                <div className="flex gap-2">
                  <Input
                    value={accountNumber}
                    onChange={(event) =>
                      setAccountNumber(
                        event.target.value.replace(/\D/g, "").slice(0, 10),
                      )
                    }
                    placeholder="Enter account number"
                    inputMode="numeric"
                    className="h-12"
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    className="h-12 shrink-0"
                    disabled={
                      !recipientBank ||
                      accountNumber.length !== 10 ||
                      enquiryLoading
                    }
                  >
                    {enquiryLoading ? <Spinner size="small" /> : "Verify"}
                  </Button>
                </div>
              </div>

              {beneficiaryInfo?.data?.name && (
                <div className="flex items-center gap-2 rounded-xl bg-success-2 px-4 py-3 text-sm font-semibold text-success-1">
                  <Check className="h-4 w-4" />
                  {beneficiaryInfo.data.name}
                  <span className="font-normal text-grey-3">
                    · {recipientBank?.label}
                  </span>
                </div>
              )}

              {transferError && (
                <p className="rounded-lg bg-error-2 px-3 py-2 text-sm text-error-1">
                  {transferError}
                </p>
              )}

              <Button
                type="button"
                onClick={continueTransfer}
                className="h-12"
                disabled={!beneficiaryInfo?.data?.name}
              >
                Continue
              </Button>
            </div>
          ) : (
            <div className="space-y-5 px-5 py-5">
              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-grey-3">
                  From Account
                </label>
                <div className="flex items-center justify-between rounded-xl border border-grey-5 bg-grey-6 px-4 py-3 text-sm font-medium">
                  <span>
                    {selectedBank?.account_name || "Main Account"} ·{" "}
                    {maskAccount(
                      selectedBank?.account_number || wallet?.account_number,
                    )}
                  </span>
                  <ChevronDown className="h-4 w-4 text-grey-3" />
                </div>
              </div>

              <label className="block">
                <span className="mb-2 block text-xs font-bold uppercase tracking-wide text-grey-3">
                  Amount (₦)
                </span>
                <Input
                  type="number"
                  min="0.01"
                  value={transferAmount}
                  onChange={(event) => setTransferAmount(event.target.value)}
                  placeholder="0.00"
                  className="h-14 text-xl"
                />
              </label>

              <CustomSelect
                label="Category (Optional)"
                options={categoryOptions}
                value={category}
                onChange={setCategory}
                isLoading={CategoriesDataLoading}
                placeholder="Select a category"
              />

              <label className="block">
                <span className="mb-2 block text-xs font-bold uppercase tracking-wide text-grey-3">
                  Narration (Optional)
                </span>
                <Input
                  value={narration}
                  onChange={(event) => setNarration(event.target.value)}
                  placeholder="What is this payment for?"
                  className="h-12"
                />
              </label>

              <div className="rounded-xl bg-grey-6 px-4 py-3 text-sm">
                <div className="flex justify-between gap-4">
                  <span className="text-grey-3">Sending to</span>
                  <span className="font-semibold text-right">
                    {beneficiaryInfo?.data?.name} · {recipientBank?.label}
                  </span>
                </div>
                <div className="mt-2 flex justify-between gap-4">
                  <span className="text-grey-3">Account No.</span>
                  <span className="font-semibold">{accountNumber}</span>
                </div>
                <div className="mt-2 flex justify-between gap-4">
                  <span className="text-grey-3">You send</span>
                  <span className="font-semibold">
                    {amount(transferAmount)}
                  </span>
                </div>
              </div>

              <div>
                <p className="mb-2 text-xs font-bold uppercase tracking-wide text-grey-3">
                  Enter transaction PIN
                </p>
                <div className="flex justify-center">
                  <OtpInput value={pin} onChange={setPin} length={4} />
                </div>
              </div>

              {transferError && (
                <p className="rounded-lg bg-error-2 px-3 py-2 text-sm text-error-1">
                  {transferError}
                </p>
              )}

              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setTransferStep(1);
                    setTransferError("");
                  }}
                  className="h-12"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
                <Button
                  type="button"
                  onClick={submitTransfer}
                  disabled={TransferFundsLoading || pin.length !== 4}
                  className="h-12 flex-1"
                >
                  {TransferFundsLoading ? (
                    <>
                      <Spinner size="small" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Send {amount(transferAmount)}
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>
      </CustomModal>

      <CustomModal
        isOpen={showReceiptModal}
        onClose={() => setShowReceiptModal(false)}
        title=""
        size="lg"
        className="rounded-2xl p-4 sm:p-6"
      >
        {receiptDetails && (
          <TransferReceipt
            details={receiptDetails}
            onBack={() => setShowReceiptModal(false)}
          />
        )}
      </CustomModal>
    </>
  );
};

const CreditCardIcon = () => (
  <svg
    viewBox="0 0 24 24"
    className="h-5 w-5"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <path d="M3 10h18" />
  </svg>
);

export default Transactions;

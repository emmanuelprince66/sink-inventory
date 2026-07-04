"use client";

import { CustomCard } from "@/components/app/CustomCard";
import { CustomModal } from "@/components/app/CustomModal";
import { DatePickerWithRange } from "@/components/app/DateRangePicker";
import GenerateReportButton from "@/components/app/GenerateReportButton";
import UserNotSubscribe from "@/components/app/UserNotSubscribe";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useExpensesHook } from "@/hooks/useExpensesHook";
import { cn } from "@/lib/utils";
import { formatToNaira } from "@/utils/formatMoney";
import { Calendar, DollarSign, Forward, TrendingDown } from "lucide-react";
import { useState } from "react";
import { DateRange } from "react-day-picker";
import AddExpenses from "./AddExpenses";
import AccountBalanceCard from "./expense-accounts/AccountBalanceCard";
import ExpenseAccountsView from "./expense-accounts/ExpenseAccountsView";
import ExpenseTransactionsView from "./expense-accounts/ExpenseTransactionsView";
import TransactionDetailsModal from "./expense-accounts/TransactionDetailsModal";
import TransferMoneyModal from "./expense-accounts/TransferMoneyModal";
import {
  EXPENSE_ACCOUNT,
  ExpenseTransaction,
  MOCK_TRANSACTIONS,
} from "./expense-accounts/mock-data";

// ─── Overview card ──────────────────────────────────────────────────────────

interface CustomExpenseCardProps {
  title: string;
  amount: number | string;
  type: "total" | "monthly" | "daily";
  className?: string;
}

const CustomExpenseCard = ({
  title,
  amount,
  type,
  className,
}: CustomExpenseCardProps) => {
  const variants = {
    total: {
      bg: "bg-gradient-to-br from-red-50 to-red-100",
      border: "border-red-200",
      iconBg: "bg-red-100",
      icon: <TrendingDown className="w-4 sm:w-5 h-4 sm:h-5 text-red-600" />,
      text: "text-primary-black-100",
      amountText: "text-primary-black-100",
    },
    monthly: {
      bg: "bg-gradient-to-br from-orange-50 to-orange-100",
      border: "border-orange-200",
      iconBg: "bg-orange-100",
      icon: <Calendar className="w-4 sm:w-5 h-4 sm:h-5 text-orange-600" />,
      text: "text-primary-black-100",
      amountText: "text-primary-black-100",
    },
    daily: {
      bg: "bg-gradient-to-br from-amber-50 to-amber-100",
      border: "border-amber-200",
      iconBg: "bg-amber-100",
      icon: <DollarSign className="w-4 sm:w-5 h-4 sm:h-5 text-amber-600" />,
      text: "text-primary-black-100",
      amountText: "text-primary-black-100",
    },
  };

  const variant = variants[type] || variants.total;

  return (
    <CustomCard
      className={cn(
        variant.bg,
        variant.border,
        "p-3 sm:p-4 w-full rounded-lg border transition-all hover:shadow-md",
        className,
      )}
    >
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className={cn("p-1 sm:p-2 rounded-full", variant.iconBg)}>
            {variant.icon}
          </div>
          <span className={cn("text-xs sm:text-sm font-medium", variant.text)}>
            {title}
          </span>
        </div>
        <span className="text-xs sm:text-sm flex gap-1 sm:gap-2 items-center font-medium hover:cursor-pointer text-primary-black-100">
          View analytics <Forward className="text-red-500 text-xs sm:text-sm" />
        </span>
      </div>
      <div className="mt-2 sm:mt-4">
        <span
          className={cn("text-lg sm:text-2xl font-bold", variant.amountText)}
        >
          {amount}
        </span>
      </div>
    </CustomCard>
  );
};

// ─── Page ───────────────────────────────────────────────────────────────────

type ExpenseTab = "accounts" | "transactions";

const Expenses = () => {
  const [showNotSubscribeModal, setShowNotSubscribeModal] = useState(false);
  const [addExpensesModal, setAddExpensesModal] = useState(false);
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(),
    to: new Date(),
  });

  const handleOpenNotSubscribeModal = () => setShowNotSubscribeModal(true);
  const handleCloseNotSubscribeModal = () => setShowNotSubscribeModal(false);
  const closeAddExpensesModal = () => setAddExpensesModal(false);
  const openAddExpensesModal = () => setAddExpensesModal(true);

  // Existing hook still drives the Total Expenses amount on the overview card.
  // Other state it used to need (search, category, pagination) is gone now.
  const { ExpensesData, ExpensesLoading } = useExpensesHook({
    searchInput: "",
    selectedCategory: null,
    dateRange,
    page: 1,
    handleOpenNotSubscribeModal,
  });

  // Expense Account Management state (UI-only).
  const [activeTab, setActiveTab] = useState<ExpenseTab>("accounts");
  const [openTransfer, setOpenTransfer] = useState(false);
  const [transferCategory, setTransferCategory] = useState<
    string | undefined
  >();
  const [selectedTransaction, setSelectedTransaction] =
    useState<ExpenseTransaction | null>(null);

  const pendingApprovalsCount = MOCK_TRANSACTIONS.filter(
    (t) => t.status === "PENDING",
  ).length;

  const handleTransfer = (category?: string) => {
    setTransferCategory(category);
    setOpenTransfer(true);
  };
  const handleViewTransaction = (txn: ExpenseTransaction) =>
    setSelectedTransaction(txn);

  return (
    <div className="w-full h-full flex flex-col justify-start gap-4 sm:gap-6 items-start pb-12">
      {/* Header Section */}
      <div className="w-full">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between w-full mb-4 sm:mb-6 gap-3 sm:gap-0">
          <p className="text-2xl md:text-3xl text-primary-black-100 font-[500]">
            Expenses
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
            <GenerateReportButton
              reportType="expenses"
              className="w-full sm:w-auto"
            />
            <Button
              className="bg-green-500 hover:bg-green-600 text-white px-3 sm:px-4 py-1.5 sm:py-2 text-sm sm:text-base w-full sm:w-auto"
              onClick={openAddExpensesModal}
            >
              + Add Expenses
            </Button>
            <div className="w-full">
              <DatePickerWithRange
                date={dateRange}
                onDateChange={setDateRange}
                className="w-full"
              />
            </div>
          </div>
        </div>

        {/* Overview row — Total Expenses + Expense Account Balance */}
        <div className="mb-4 sm:mb-6">
          <h2 className="text-base sm:text-lg font-medium text-primary-black-100 mb-3 sm:mb-4">
            Overview
          </h2>

          {ExpensesLoading || !ExpensesData ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
              {Array.from({ length: 2 }).map((_, index) => (
                <CustomCard key={index} className="w-full border-gray-200">
                  <div className="flex flex-col gap-4 sm:gap-6 items-start">
                    <Skeleton className="h-3 sm:h-4 w-[80px] sm:w-[100px] bg-[#eef4ef]" />
                    <Skeleton className="h-4 sm:h-6 w-[60px] sm:w-[70px] bg-[#eef4ef]" />
                  </div>
                </CustomCard>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
              <CustomExpenseCard
                title="Total Expenses"
                amount={formatToNaira(
                  ExpensesData?.data?.results?.total_expenses,
                )}
                type="total"
              />
              <AccountBalanceCard
                balance={EXPENSE_ACCOUNT.balance}
                accountNumber={EXPENSE_ACCOUNT.accountNumber}
                bankName={EXPENSE_ACCOUNT.bankName}
                pendingApprovals={pendingApprovalsCount}
                onTransfer={() => handleTransfer()}
              />
            </div>
          )}
        </div>
      </div>

      {/* Body — two tabs: the category dashboard and the global transactions log */}
      <Tabs
        value={activeTab}
        onValueChange={(v) => setActiveTab(v as ExpenseTab)}
        className="w-full"
      >
        <div className="overflow-x-auto -mx-2 sm:-mx-4 px-2 sm:px-4">
          <TabsList className="bg-white border border-slate-200 p-1 h-auto inline-flex">
            <TabsTrigger
              value="accounts"
              className="text-xs sm:text-sm data-[state=active]:bg-emerald-50 data-[state=active]:text-emerald-700 data-[state=active]:shadow-none px-3 sm:px-4 py-1.5"
            >
              Expense Accounts
            </TabsTrigger>
            <TabsTrigger
              value="transactions"
              className="text-xs sm:text-sm data-[state=active]:bg-emerald-50 data-[state=active]:text-emerald-700 data-[state=active]:shadow-none px-3 sm:px-4 py-1.5"
            >
              Transactions
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="accounts" className="mt-4">
          <ExpenseAccountsView
            onTransfer={(defaultCategory) => handleTransfer(defaultCategory)}
            onViewTransaction={handleViewTransaction}
            onViewAllTransactions={() => setActiveTab("transactions")}
          />
        </TabsContent>

        <TabsContent value="transactions" className="mt-4">
          <ExpenseTransactionsView
            onSelectTransaction={handleViewTransaction}
          />
        </TabsContent>
      </Tabs>

      {/* Modals */}
      <TransferMoneyModal
        isOpen={openTransfer}
        onClose={() => setOpenTransfer(false)}
        defaultCategory={transferCategory}
      />

      <TransactionDetailsModal
        isOpen={!!selectedTransaction}
        onClose={() => setSelectedTransaction(null)}
        transaction={selectedTransaction}
        onApprove={(id) => {
          // UI-only — wire to PATCH /expense-transactions/{id}/approve when ready.
          console.log("approve", id);
          setSelectedTransaction(null);
        }}
        onReject={(id) => {
          console.log("reject", id);
          setSelectedTransaction(null);
        }}
      />

      {/* Add Expenses Modal (existing flow — unchanged) */}
      <CustomModal
        isOpen={addExpensesModal}
        onClose={closeAddExpensesModal}
        trigger={false}
        title="Add New Expense"
      >
        <AddExpenses
          handleOpenNotSubscribeModal={handleOpenNotSubscribeModal}
          closeModal={closeAddExpensesModal}
        />
      </CustomModal>

      {/* Subscription Modal */}
      <CustomModal
        isOpen={showNotSubscribeModal}
        onClose={handleCloseNotSubscribeModal}
        trigger={false}
        title="Subscription Details"
      >
        <div className="w-full">
          <UserNotSubscribe />
        </div>
      </CustomModal>
    </div>
  );
};

export default Expenses;

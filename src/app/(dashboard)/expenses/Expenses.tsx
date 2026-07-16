"use client";

import { CustomCard } from "@/components/app/CustomCard";
import { CustomModal } from "@/components/app/CustomModal";
import { DatePickerWithRange } from "@/components/app/DateRangePicker";
import GenerateReportButton from "@/components/app/GenerateReportButton";
import UserNotSubscribe from "@/components/app/UserNotSubscribe";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { useToast } from "@/hooks/toast/useToast";
import { useExpensesHook } from "@/hooks/useExpensesHook";
import { cn } from "@/lib/utils";
import { formatToNaira } from "@/utils/formatMoney";
import {
  ArrowUpRight,
  ChevronDown,
  PiggyBank,
  Plus,
  TrendingDown,
  TrendingUp,
  Wallet,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { DateRange } from "react-day-picker";
import AddExpenses from "./AddExpenses";
import ExpenseAccountsView from "./expense-accounts/ExpenseAccountsView";
import ExpenseTransactionsView from "./expense-accounts/ExpenseTransactionsView";
import TransactionDetailsModal from "./expense-accounts/TransactionDetailsModal";

type ExpenseTab = "accounts" | "transactions";

const OVERVIEW_CARD_STYLES = {
  error: { bg: "bg-error-2", iconColor: "text-error-1" },
  success: { bg: "bg-success-2", iconColor: "text-success-1" },
} as const;

const CustomExpenseCard = ({
  title,
  amount,
  tone,
}: {
  title: string;
  amount: number | string;
  tone: keyof typeof OVERVIEW_CARD_STYLES;
}) => {
  const style = OVERVIEW_CARD_STYLES[tone];
  const Icon = tone === "success" ? TrendingUp : TrendingDown;
  return (
    <CustomCard
      className={cn(
        "rounded-2xl border-none transition-all w-full h-full p-0",
        style.bg,
      )}
      contentClassName="p-4 sm:p-5 flex flex-col gap-3 h-full"
    >
      <div className="flex items-center gap-2">
        <span className={style.iconColor}>
          <Icon className="w-[15px] h-[15px]" />
        </span>
        <span className={cn("text-xs font-bold", style.iconColor)}>
          {title}
        </span>
      </div>
      <p className="text-2xl font-extrabold text-grey-1">{amount}</p>
    </CustomCard>
  );
};

/** Real bank-account data — results.summary on /expenses/business/{id}/
 * (account_balance, bank_name, account_number). No "pending" count is
 * shown — there's no pending-approvals field in that data yet. */
const ExpenseAccountBalanceCard = ({
  balance,
  bankName,
  accountNumber,
}: {
  balance: number;
  bankName?: string;
  accountNumber?: string;
}) => {
  const { showToast } = useToast();
  return (
    <CustomCard
      className="rounded-2xl border border-primary-green-300/15 bg-gradient-to-br from-secondary-6 via-white to-secondary-6 w-full h-full p-0"
      contentClassName="p-4 sm:p-5 flex flex-col gap-3 h-full"
    >
      <div className="flex items-center gap-2.5">
        <div className="w-9 h-9 rounded-xl bg-primary-green-300 flex items-center justify-center text-white shrink-0">
          <Wallet className="w-4 h-4" />
        </div>
        <div className="min-w-0">
          <span className="text-xs font-bold text-primary-green-100 uppercase tracking-wide block">
            Expense Account Balance
          </span>
          {(bankName || accountNumber) && (
            <span className="text-[11px] text-grey-3 truncate block">
              {bankName}
              {bankName && accountNumber ? " · " : ""}
              {accountNumber}
            </span>
          )}
        </div>
      </div>
      <div>
        <p className="text-2xl font-extrabold text-grey-1">
          {formatToNaira(balance)}
        </p>
        <p className="text-[11px] text-grey-3 mt-0.5">
          Funds available for operational spending
        </p>
      </div>
      <Button
        size="sm"
        className="w-fit gap-1.5"
        onClick={() => showToast("Transfer Money is coming soon.", "info")}
      >
        <ArrowUpRight className="w-3.5 h-3.5" />
        Transfer Money
      </Button>
    </CustomCard>
  );
};

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

  const { ExpensesData, ExpensesLoading } = useExpensesHook({
    dateRange,
    handleOpenNotSubscribeModal,
  });

  // Real bank-account data — results.summary on /expenses/business/{id}/.
  const accountSummary = ExpensesData?.data?.results?.summary;

  // ─── Expense Account Management state ─────────────────────────────────────
  const [activeTab, setActiveTab] = useState<ExpenseTab>("accounts");
  const [selectedTransaction, setSelectedTransaction] = useState<any | null>(
    null,
  );

  const handleViewTransaction = (txn: any) => setSelectedTransaction(txn);

  return (
    <div className="w-full h-full flex flex-col justify-start gap-4 sm:gap-6 items-start px-2 sm:px-4">
      {/* Header Section */}
      <div className="w-full">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between w-full mb-4 sm:mb-6 gap-3 sm:gap-0">
          <h1 className="text-xl sm:text-2xl md:text-3xl text-grey-1 font-extrabold">
            Expenses
          </h1>

          <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-full sm:w-auto">
                  More Actions
                  <ChevronDown className="w-4 h-4 ml-1" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52 p-1.5">
                <DropdownMenuItem
                  onClick={openAddExpensesModal}
                  className="rounded-lg py-1.5 font-semibold text-grey-2 focus:bg-secondary-6 focus:text-grey-2 cursor-pointer gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add Expenses
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="rounded-lg py-1.5 focus:bg-secondary-6">
                  <Link
                    href="/expenses/budgets"
                    className="font-semibold text-grey-2 flex items-center gap-2 cursor-pointer"
                  >
                    <PiggyBank className="w-4 h-4" />
                    Manage Budgets
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="p-0 focus:bg-transparent">
                  <div>
                    <GenerateReportButton
                      reportType="expenses"
                      variant="ghost"
                      className="w-full justify-start rounded-lg py-1.5 font-semibold text-grey-2 hover:bg-secondary-6 hover:text-grey-2"
                    />
                  </div>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <div className="w-full">
              <DatePickerWithRange
                date={dateRange}
                onDateChange={setDateRange}
                className="w-full"
              />
            </div>
          </div>
        </div>
        {/* Overview Cards */}
        <div className="mb-4 sm:mb-6">
          <p className="text-sm font-bold text-primary-green-300 border-b border-border-tint pb-3 mb-4 sm:mb-5">
            Overview
          </p>

          {ExpensesLoading || !ExpensesData ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {Array.from({ length: 3 }).map((_, index) => (
                <CustomCard
                  key={index}
                  className="w-full rounded-2xl border-none h-[100px] sm:h-[120px]"
                >
                  <div className="flex flex-col gap-3 sm:gap-6 items-start h-full justify-center">
                    <Skeleton className="h-3 sm:h-4 w-[80px] sm:w-[100px] bg-grey-5" />
                    <Skeleton className="h-4 sm:h-6 w-[60px] sm:w-[70px] bg-grey-5" />
                  </div>
                </CustomCard>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              <CustomExpenseCard
                title="Total Expenses"
                tone="error"
                amount={formatToNaira(
                  ExpensesData?.data?.results?.total_expenses,
                )}
              />
              <CustomExpenseCard
                title="Spent This Month"
                tone="success"
                amount={formatToNaira(accountSummary?.spent_this_month ?? 0)}
              />
              <ExpenseAccountBalanceCard
                balance={accountSummary?.account_balance ?? 0}
                bankName={accountSummary?.bank_name}
                accountNumber={accountSummary?.account_number}
              />
            </div>
          )}
        </div>
      </div>

      {/* ─── Expense Account Management tabs ─── */}
      <Tabs
        value={activeTab}
        onValueChange={(v) => setActiveTab(v as ExpenseTab)}
        className="w-full"
      >
        <div className="flex items-center border-b border-border-tint overflow-x-auto -mx-2 sm:-mx-4 px-2 sm:px-4">
          <button
            onClick={() => setActiveTab("accounts")}
            className={cn(
              "px-4 py-3 text-sm font-bold border-b-2 cursor-pointer whitespace-nowrap transition-colors mr-2",
              activeTab === "accounts"
                ? "border-primary-green-300 text-primary-green-300"
                : "border-transparent text-grey-3 hover:text-grey-2",
            )}
          >
            Expense Accounts
          </button>
          <button
            onClick={() => setActiveTab("transactions")}
            className={cn(
              "px-4 py-3 text-sm font-bold border-b-2 cursor-pointer whitespace-nowrap transition-colors",
              activeTab === "transactions"
                ? "border-primary-green-300 text-primary-green-300"
                : "border-transparent text-grey-3 hover:text-grey-2",
            )}
          >
            Transactions
          </button>
        </div>

        <TabsContent value="accounts" className="mt-4">
          <ExpenseAccountsView
            dateRange={dateRange}
            onViewTransaction={handleViewTransaction}
            onViewAllTransactions={() => setActiveTab("transactions")}
          />
        </TabsContent>

        <TabsContent value="transactions" className="mt-4">
          <ExpenseTransactionsView
            dateRange={dateRange}
            onSelectTransaction={handleViewTransaction}
          />
        </TabsContent>
      </Tabs>

      {/* Add Expenses Modal */}
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

      <TransactionDetailsModal
        isOpen={!!selectedTransaction}
        onClose={() => setSelectedTransaction(null)}
        transaction={selectedTransaction}
      />
    </div>
  );
};

export default Expenses;

"use client";

import { CustomCard } from "@/components/app/CustomCard";
import { CustomModal } from "@/components/app/CustomModal";
import { DatePickerWithRange } from "@/components/app/DateRangePicker";
import GenerateReportModal from "@/components/app/GenerateReportModal";
import { StatCardSkeletonRow } from "@/components/app/StatCardSkeleton";
import UserNotSubscribe from "@/components/app/UserNotSubscribe";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import {
  expenseAccountLabel,
  useExpenseAccounts,
} from "@/hooks/useExpenseAccounts";
import { useExpensesHook } from "@/hooks/useExpensesHook";
import { useReportGeneration } from "@/hooks/useReportGeneration";
import { cn } from "@/lib/utils";
import { formatToNaira } from "@/utils/formatMoney";
import {
  ArrowUpRight,
  ChevronDown,
  FileDown,
  PiggyBank,
  Plus,
  TrendingDown,
  TrendingUp,
  Wallet,
} from "lucide-react";
import moment from "moment";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { DateRange } from "react-day-picker";
import AddExpenses from "./AddExpenses";
import ExpenseAccountsView from "./expense-accounts/ExpenseAccountsView";
import ExpenseTransactionsView from "./expense-accounts/ExpenseTransactionsView";
import CreateExpenseAccountModal from "./sub-account/CreateExpenseAccountModal";
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
  /** Whether a transfer has an account to come out of. */
  canTransfer,
  onCreateAccount,
  onTransfer,
}: {
  balance: number;
  bankName?: string;
  accountNumber?: string;
  canTransfer: boolean;
  onCreateAccount: () => void;
  onTransfer: () => void;
}) => {
  return (
    <CustomCard
      className="relative overflow-hidden rounded-2xl border border-primary-green-300/20 bg-gradient-to-br from-primary-green-300/15 via-secondary-6 to-white w-full h-full p-0"
      contentClassName="relative p-4 sm:p-5 flex flex-col gap-3 h-full"
    >
      {/* Decorative glow — depth without breaking the flat-card design language */}
      <div className="absolute -right-8 -top-10 w-32 h-32 rounded-full bg-primary-green-300/25 blur-2xl pointer-events-none" />
      <div className="absolute -left-10 -bottom-12 w-32 h-32 rounded-full bg-primary-green-300/10 blur-2xl pointer-events-none" />

      <div className="relative flex items-center gap-2.5">
        <div className="w-9 h-9 rounded-xl bg-primary-green-300 flex items-center justify-center text-white shrink-0 shadow-sm">
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
      <div className="relative">
        <p className="text-2xl font-extrabold text-grey-1">
          {formatToNaira(balance)}
        </p>
        <p className="text-[11px] text-grey-3 mt-0.5">
          Funds available for operational spending
        </p>
      </div>

      {/* A plain button that navigates, rather than a Link wrapped in one:
          asChild hands the styling to Radix's Slot, and this button sits on a
          gradient where anything less than the solid fill every other primary
          button gets reads as disabled. Transfers need an account to come out
          of, so without one it offers to create that instead of opening a
          screen whose only message would be "create an account first". */}
      <div className="relative flex items-center gap-2">
        {canTransfer ? (
          <Button size="sm" className="w-fit gap-1.5" onClick={onTransfer}>
            <ArrowUpRight className="w-3.5 h-3.5" />
            Transfer Money
          </Button>
        ) : (
          <Button
            size="sm"
            variant="outline"
            className="w-fit gap-1.5 bg-white"
            onClick={onCreateAccount}
          >
            <Plus className="w-3.5 h-3.5" />
            Create Expense Account
          </Button>
        )}
      </div>
    </CustomCard>
  );
};

const Expenses = () => {
  const router = useRouter();
  const [showNotSubscribeModal, setShowNotSubscribeModal] = useState(false);
  const [createExpenseAccountOpen, setCreateExpenseAccountOpen] =
    useState(false);
  const [addExpensesModal, setAddExpensesModal] = useState(false);
  // Today-only made every card on this page (and the category grid) look
  // nearly empty by default, and disagree with drill-down pages like
  // CategoryDetail that default to a 6-month window for the same category
  // — same data, wildly different numbers, purely from the date filter.
  // Match that convention here so the overview is consistent by default.
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: moment().subtract(6, "months").startOf("day").toDate(),
    to: moment().endOf("day").toDate(),
  });

  const handleOpenNotSubscribeModal = () => setShowNotSubscribeModal(true);
  const handleCloseNotSubscribeModal = () => setShowNotSubscribeModal(false);
  const closeAddExpensesModal = () => setAddExpensesModal(false);
  const openAddExpensesModal = () => setAddExpensesModal(true);

  const { ExpensesData, ExpensesLoading } = useExpensesHook({
    dateRange,
    handleOpenNotSubscribeModal,
  });

  const {
    isConfigOpen: isGenerateReportOpen,
    openConfig: openGenerateReport,
    closeConfig: closeGenerateReport,
    isStarting: isGenerateReportStarting,
    handleGenerate: handleGenerateReport,
  } = useReportGeneration("expenses");

  // Real bank-account data — results.summary on /expenses/business/{id}/.
  const accountSummary = ExpensesData?.data?.results?.summary;

  // The expense accounts, and which one is being spent from. Read off the live
  // business payload rather than the summary above, so an account created a
  // moment ago counts immediately, and shared with the transfer route so the
  // account named on this page is the one the money leaves.
  const {
    accounts: expenseAccounts,
    selected: selectedExpenseAccount,
    setSelectedId: setSelectedExpenseAccountId,
    balance: expenseBalance,
    hasExpenseAccount,
    hasMultiple: hasMultipleExpenseAccounts,
  } = useExpenseAccounts();

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
            <Button
              className="w-full sm:w-auto gap-1.5"
              onClick={() => setCreateExpenseAccountOpen(true)}
            >
              <Plus className="w-4 h-4" />
              Create Expense Account
            </Button>
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
                <DropdownMenuItem
                  onClick={openGenerateReport}
                  className="rounded-lg py-1.5 font-semibold text-grey-2 focus:bg-secondary-6 focus:text-grey-2 cursor-pointer gap-2"
                >
                  <FileDown className="w-4 h-4" />
                  Generate Report
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
          {/* The section heading doubles as the row that says which expense
              account is in play — right-aligned, so it sits directly over the
              balance card it governs. Only rendered when there is a choice to
              make: a picker holding one option is a question with one answer.

              The choice is shared with the transfer screen, so the account
              named here is the one Transfer Money spends from. */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border-tint pb-3 mb-4 sm:mb-5">
            <p className="text-sm font-bold text-primary-green-300">Overview</p>

            {hasMultipleExpenseAccounts && (
              <div className="flex items-center gap-2">
                <span className="hidden whitespace-nowrap text-[11px] font-bold uppercase tracking-wide text-grey-3 sm:inline">
                  Spending from
                </span>
                {/* SelectValue stays a DIRECT child of the trigger: the
                    trigger's own line-clamp is scoped to its immediate
                    children, so wrapping it in anything lets a long account
                    name run straight out of the box. */}
                <Select
                  value={selectedExpenseAccount?.id ?? ""}
                  onValueChange={setSelectedExpenseAccountId}
                >
                  {/* min-h-9! overrides the trigger's own min-h-[50px]; both
                      are min-height utilities, so class order alone would not
                      decide it. */}
                  <SelectTrigger className="h-9 min-h-9! w-[190px] max-w-full justify-start overflow-hidden rounded-xl border-primary-green-300/30 bg-white px-2.5 text-xs font-bold text-grey-1 *:data-[slot=select-value]:min-w-0 *:data-[slot=select-value]:flex-1">
                    <Wallet className="h-3.5 w-3.5 shrink-0 text-primary-green-300" />
                    {/* Children override what Radix would otherwise render —
                        the selected item's full two-line content, which does
                        not belong in a 36px-tall trigger. */}
                    <SelectValue placeholder="Select account">
                      {expenseAccountLabel(selectedExpenseAccount)}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent className="max-w-[260px]">
                    {expenseAccounts.map((account) => (
                      <SelectItem key={account.id} value={account.id}>
                        <span className="flex min-w-0 flex-col">
                          <span className="truncate text-xs font-bold text-grey-1">
                            {expenseAccountLabel(account)}
                          </span>
                          <span className="truncate text-[10px] text-grey-3">
                            {account.bank_name}
                            {account.bank_name && account.account_number
                              ? " · "
                              : ""}
                            {account.account_number}
                          </span>
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {ExpensesLoading || !ExpensesData ? (
            <StatCardSkeletonRow
              count={3}
              gridClassName="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4"
            />
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
                // The selected account's own figures once there is one to
                // select, so the card agrees with the picker above it and with
                // the transfer screen. The summary is a single set of fields
                // and cannot answer "which account?" once a business holds
                // more than one, so it is only the fallback.
                balance={
                  hasExpenseAccount
                    ? expenseBalance
                    : (accountSummary?.account_balance ?? 0)
                }
                bankName={
                  selectedExpenseAccount?.bank_name ?? accountSummary?.bank_name
                }
                accountNumber={
                  selectedExpenseAccount?.account_number ??
                  accountSummary?.account_number
                }
                canTransfer={hasExpenseAccount}
                onCreateAccount={() => setCreateExpenseAccountOpen(true)}
                onTransfer={() => router.push("/expenses/transfer")}
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

      {/* Generate Report Modal — rendered here (outside the DropdownMenu)
          on purpose. The dropdown unmounts its children on close, so a
          modal nested inside it would flicker open-then-closed the moment
          it opens (the dropdown's close/focus-return races the dialog's
          own mount). */}
      <GenerateReportModal
        isOpen={isGenerateReportOpen}
        onClose={closeGenerateReport}
        reportType="expenses"
        onSubmit={handleGenerateReport}
        isSubmitting={isGenerateReportStarting}
      />

      <TransactionDetailsModal
        isOpen={!!selectedTransaction}
        onClose={() => setSelectedTransaction(null)}
        transaction={selectedTransaction}
      />

      <CreateExpenseAccountModal
        open={createExpenseAccountOpen}
        onClose={() => setCreateExpenseAccountOpen(false)}
      />
    </div>
  );
};

export default Expenses;

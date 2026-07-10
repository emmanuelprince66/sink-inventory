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
import { useExpensesHook } from "@/hooks/useExpensesHook";
import { cn } from "@/lib/utils";
import { formatToNaira } from "@/utils/formatMoney";
import { ChevronDown, Plus, TrendingDown } from "lucide-react";
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

type ExpenseTab = "accounts" | "transactions";

// Matches Sales' CustomSalesCard pattern — tinted background, icon+label row,
// value below. See sink/src/app/(dashboard)/sales/Sales.tsx.
const EXPENSE_CARD_STYLES: Record<
  string,
  { bg: string; iconColor: string; icon: React.ReactNode }
> = {
  "Total Expenses": {
    bg: "bg-error-2",
    iconColor: "text-error-1",
    icon: <TrendingDown className="w-[15px] h-[15px]" />,
  },
};

const CustomExpenseCard = ({
  title,
  amount,
}: {
  title: string;
  amount: number | string;
}) => {
  const cardStyle = EXPENSE_CARD_STYLES[title] ?? {
    bg: "bg-grey-6",
    iconColor: "text-grey-3",
    icon: <TrendingDown className="w-[15px] h-[15px]" />,
  };

  return (
    <CustomCard
      className={cn(
        "rounded-2xl border-none transition-all w-full h-full p-0",
        cardStyle.bg,
      )}
      contentClassName="p-4 sm:p-5 flex flex-col gap-3 h-full"
    >
      <div className="flex items-center gap-2">
        <span className={cardStyle.iconColor}>{cardStyle.icon}</span>
        <span className={cn("text-xs font-bold", cardStyle.iconColor)}>
          {title}
        </span>
      </div>
      <p className="text-2xl font-extrabold text-grey-1">{amount}</p>
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

  // ─── Expense Account Management state (mock-data build) ──────────────────
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
          <p className="text-sm font-bold text-primary-green-300 border-b border-border-tint pb-2 mb-3 sm:mb-4">
            Overview
          </p>

          {ExpensesLoading || !ExpensesData ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              {Array.from({ length: 2 }).map((_, index) => (
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <CustomExpenseCard
                title="Total Expenses"
                amount={formatToNaira(
                  ExpensesData?.data?.results?.total_expenses,
                )}
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

      {/* ─── Expense Account Management tabs (mock-data build) ─── */}
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

      {/* ─── Expense Account Management modals (mock-data build) ─── */}
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
          console.log("approve", id);
          setSelectedTransaction(null);
        }}
        onReject={(id) => {
          console.log("reject", id);
          setSelectedTransaction(null);
        }}
      />
    </div>
  );
};

export default Expenses;

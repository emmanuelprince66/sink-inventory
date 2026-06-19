"use client";

import { CustomCard } from "@/components/app/CustomCard";
import { CustomModal } from "@/components/app/CustomModal";
import { DatePickerWithRange } from "@/components/app/DateRangePicker";
import GenerateReportButton from "@/components/app/GenerateReportButton";
import { SearchInput } from "@/components/app/SearchInput";
import UserNotSubscribe from "@/components/app/UserNotSubscribe";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useExpensesHook } from "@/hooks/useExpensesHook";
import { cn } from "@/lib/utils";
import { formatToNaira } from "@/utils/formatMoney";
import {
  Briefcase,
  Calendar,
  ChevronLeft,
  ChevronRight,
  DollarSign,
  Forward,
  Receipt,
  TrendingDown,
  Wallet as WalletIcon,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { DateRange } from "react-day-picker";
import AddExpenses from "./AddExpenses";
import AllExpenses from "./AllExpenses";
import AccountBalanceCard from "./expense-accounts/AccountBalanceCard";
import CreateSubAccountModal from "./expense-accounts/CreateSubAccountModal";
import ExpenseAccountsView from "./expense-accounts/ExpenseAccountsView";
import ExpenseTransactionsView from "./expense-accounts/ExpenseTransactionsView";
import TransactionDetailsModal from "./expense-accounts/TransactionDetailsModal";
import TransferMoneyModal from "./expense-accounts/TransferMoneyModal";
import {
  ExpenseTransaction,
  MOCK_TRANSACTIONS,
  computeTotalBalance,
} from "./expense-accounts/mock-data";

interface Category {
  id: string;
  name: string;
  type: string;
}

interface CategoriesResponse {
  success: boolean;
  message: string;
  data: Category[];
}

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
        className
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

type ExpenseTab = "expenses" | "accounts" | "transactions";

const Expenses = () => {
  const [searchInput, setSearchInput] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showNotSubscribeModal, setShowNotSubscribeModal] = useState(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [addExpensesModal, setAddExpensesModal] = useState(false);
  const [page, setPage] = useState(1);
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(),
    to: new Date(),
  });

  // Expense Account Management state (UI-only).
  const [activeTab, setActiveTab] = useState<ExpenseTab>("expenses");
  const [openCreateSubAccount, setOpenCreateSubAccount] = useState(false);
  const [openTransfer, setOpenTransfer] = useState(false);
  const [transferSourceId, setTransferSourceId] = useState<string | undefined>();
  const [selectedTransaction, setSelectedTransaction] =
    useState<ExpenseTransaction | null>(null);

  const totalBalance = computeTotalBalance();
  const pendingApprovalsCount = MOCK_TRANSACTIONS.filter(
    (t) => t.status === "PENDING",
  ).length;

  const handleCreateSubAccount = () => setOpenCreateSubAccount(true);
  const handleTransfer = (sourceId?: string) => {
    setTransferSourceId(sourceId);
    setOpenTransfer(true);
  };
  const handleViewTransaction = (txn: ExpenseTransaction) =>
    setSelectedTransaction(txn);
  const handleGoToTransactionsTab = () => setActiveTab("transactions");

  const categoriesContainerRef = useRef<HTMLDivElement>(null);

  const handleOpenNotSubscribeModal = () => setShowNotSubscribeModal(true);
  const handleCloseNotSubscribeModal = () => setShowNotSubscribeModal(false);
  const closeAddExpensesModal = () => setAddExpensesModal(false);
  const openAddExpensesModal = () => setAddExpensesModal(true);

  const {
    ExpensesData,
    ExpensesLoading,
    CategoriesDataLoading,
    CategoriesData,
  } = useExpensesHook({
    searchInput,
    selectedCategory,
    dateRange,
    page,
    handleOpenNotSubscribeModal,
  });

  const handleSearchChange = (value: string) => {
    setSearchInput(value);
  };

  const handleCategoryClick = (category: string) => {
    setSelectedCategory(category);
  };

  const handleAllClick = () => {
    setSelectedCategory(null);
  };

  const checkScrollAvailability = () => {
    const container = categoriesContainerRef.current;
    if (container) {
      setCanScrollLeft(container.scrollLeft > 0);
      setCanScrollRight(
        container.scrollLeft < container.scrollWidth - container.clientWidth
      );
    }
  };

  const scrollCategories = (direction: "left" | "right") => {
    const container = categoriesContainerRef.current;
    if (container) {
      const scrollAmount = 200;
      const currentScroll = container.scrollLeft;
      const newScroll =
        direction === "left"
          ? currentScroll - scrollAmount
          : currentScroll + scrollAmount;

      container.scrollTo({
        left: newScroll,
        behavior: "smooth",
      });
    }
  };

  useEffect(() => {
    checkScrollAvailability();
    const container = categoriesContainerRef.current;
    if (container) {
      container.addEventListener("scroll", checkScrollAvailability);
      return () =>
        container.removeEventListener("scroll", checkScrollAvailability);
    }
  }, [CategoriesData]);

  useEffect(() => {
    const handleResize = () => checkScrollAvailability();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const totalExpenses = ExpensesData?.data?.results?.total_expenses || 0;

  return (
    <div className="w-full h-full flex flex-col justify-start gap-4 sm:gap-6 items-start px-2 sm:px-4">
      {/* Header Section */}
      <div className="w-full bg-white">
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
        {/* Overview row — existing Total Expenses card + new Expense Account Balance card */}
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
                  ExpensesData?.data?.results?.total_expenses
                )}
                type="total"
              />
              <AccountBalanceCard
                totalBalance={totalBalance}
                accountCount={MOCK_TRANSACTIONS.length > 0 ? 5 : 0}
                pendingApprovals={pendingApprovalsCount}
                onCreateSubAccount={handleCreateSubAccount}
                onTransfer={() => handleTransfer()}
              />
            </div>
          )}
        </div>
      </div>

      {/* Tabs — Expenses / Expense Accounts / Transactions */}
      <Tabs
        value={activeTab}
        onValueChange={(v) => setActiveTab(v as ExpenseTab)}
        className="w-full"
      >
        <div className="overflow-x-auto -mx-2 sm:-mx-4 px-2 sm:px-4">
          <TabsList className="bg-white border border-slate-200 p-1 h-auto inline-flex">
            <TabsTrigger
              value="expenses"
              className="text-xs sm:text-sm data-[state=active]:bg-emerald-50 data-[state=active]:text-emerald-700 data-[state=active]:shadow-none px-3 sm:px-4 py-1.5"
            >
              Expenses
            </TabsTrigger>
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

        {/* Tab 1 — existing Expenses flow */}
        <TabsContent value="expenses" className="mt-4">
          <div className="w-full rounded-lg shadow-sm border border-gray-200 bg-white">
        {/* Categories and Search Header */}
        <div className="p-4 sm:p-6 border-b border-gray-200 bg-white rounded-t-lg w-full">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 mb-3 sm:mb-4">
            <h2 className="text-lg sm:text-xl font-semibold text-primary-black-100 flex items-center gap-2">
              Manage Expenses
              <span className="text-xs bg-red-100 px-2 py-1 rounded-full text-red-600 font-medium">
                {ExpensesData?.data?.total?.toLocaleString() || "0"}
              </span>
            </h2>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 w-full sm:w-auto">
              <div className="w-full sm:w-60 md:w-80">
                <SearchInput
                  placeholder="Search by expense name..."
                  value={searchInput}
                  onValueChange={handleSearchChange}
                />
              </div>

              <Link href="/categories/expenses" className="w-full sm:w-auto">
                <Button
                  variant="outline"
                  className="text-green-500 border-green-200 hover:bg-green-50 w-full sm:w-auto"
                >
                  View More
                </Button>
              </Link>
            </div>
          </div>

          {/* Categories Tabs */}
          {CategoriesDataLoading || !CategoriesData ? (
            <div className="flex gap-2 overflow-x-auto pb-2">
              {Array.from({ length: 6 }).map((_, index) => (
                <Skeleton
                  key={index}
                  className="h-8 sm:h-10 w-16 sm:w-20 bg-gray-200 rounded-md flex-shrink-0"
                />
              ))}
            </div>
          ) : (
            <div className="w-full">
              <div className="flex items-center w-full">
                {canScrollLeft && (
                  <button
                    onClick={() => scrollCategories("left")}
                    disabled={!canScrollLeft}
                    className={cn(
                      "p-1 sm:p-2 rounded-md transition-all mr-1 sm:mr-2 flex-shrink-0",
                      canScrollLeft
                        ? "text-gray-600 hover:text-green-500 hover:bg-green-50"
                        : "text-gray-300 cursor-not-allowed"
                    )}
                  >
                    <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                )}

                <div
                  ref={categoriesContainerRef}
                  className="flex gap-1 sm:gap-2 overflow-x-auto flex-1 scrollbar-hide py-1"
                  style={{
                    scrollbarWidth: "none",
                    msOverflowStyle: "none",
                  }}
                >
                  <button
                    className={cn(
                      "px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium cursor-pointer rounded-md transition-all whitespace-nowrap flex-shrink-0",
                      selectedCategory === null
                        ? "bg-[#52b661] text-white shadow-sm"
                        : "text-gray-600 hover:text-green-500 hover:bg-green-50"
                    )}
                    onClick={handleAllClick}
                  >
                    All
                  </button>

                  {CategoriesData?.data?.map((category: Category) => (
                    <button
                      key={category.id}
                      className={cn(
                        "px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm cursor-pointer font-medium rounded-md transition-all whitespace-nowrap flex-shrink-0",
                        selectedCategory === category.id
                          ? "bg-[#52b661] text-white shadow-sm"
                          : "text-gray-600 hover:text-green-500 hover:bg-green-50"
                      )}
                      onClick={() => handleCategoryClick(category.id)}
                    >
                      {category.name}
                    </button>
                  ))}
                </div>

                {canScrollRight && (
                  <button
                    onClick={() => scrollCategories("right")}
                    disabled={!canScrollRight}
                    className={cn(
                      "p-1 sm:p-2 rounded-md transition-all ml-1 sm:ml-2 flex-shrink-0",
                      canScrollRight
                        ? "text-gray-600 hover:text-green-500 hover:bg-green-50"
                        : "text-gray-300 cursor-not-allowed"
                    )}
                  >
                    <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                )}
              </div>
            </div>
          )}

          {searchInput.length > 0 && searchInput.length < 3 && (
            <div className="mt-2 text-xs sm:text-sm text-gray-500">
              Type at least 3 characters to search
            </div>
          )}
        </div>

        {/* Table Content */}
        <div className="p-4 sm:p-6">
          {ExpensesLoading || !ExpensesData ? (
            <div className="w-full">
              <div className="space-y-3 sm:space-y-4">
                <Skeleton className="h-8 sm:h-10 w-full bg-gray-200" />
                {Array.from({ length: 5 }).map((_, index) => (
                  <Skeleton
                    key={index}
                    className="h-12 sm:h-16 w-full bg-gray-200 mt-1 sm:mt-2"
                  />
                ))}
              </div>
            </div>
          ) : (
            <AllExpenses
              expensesData={ExpensesData}
              expensesLoading={ExpensesLoading}
              setPage={setPage}
              page={page}
            />
          )}
        </div>
      </div>
        </TabsContent>

        {/* Tab 2 — Expense Accounts dashboard */}
        <TabsContent value="accounts" className="mt-4">
          <ExpenseAccountsView
            onCreateSubAccount={handleCreateSubAccount}
            onTransfer={(sourceId) => handleTransfer(sourceId)}
            onViewTransaction={handleViewTransaction}
            onViewTransactionsTab={handleGoToTransactionsTab}
          />
        </TabsContent>

        {/* Tab 3 — Transaction history */}
        <TabsContent value="transactions" className="mt-4">
          <ExpenseTransactionsView
            onSelectTransaction={handleViewTransaction}
          />
        </TabsContent>
      </Tabs>

      {/* Expense Account Management modals */}
      <CreateSubAccountModal
        isOpen={openCreateSubAccount}
        onClose={() => setOpenCreateSubAccount(false)}
      />
      <TransferMoneyModal
        isOpen={openTransfer}
        onClose={() => setOpenTransfer(false)}
        defaultSourceId={transferSourceId}
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
    </div>
  );
};

export default Expenses;

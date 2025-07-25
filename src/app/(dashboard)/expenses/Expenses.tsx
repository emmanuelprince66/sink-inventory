"use client";

import { CustomCard } from "@/components/app/CustomCard";
import { CustomModal } from "@/components/app/CustomModal";
import { DatePickerWithRange } from "@/components/app/DateRangePicker";
import { SearchInput } from "@/components/app/SearchInput";
import UserNotSubscribe from "@/components/app/UserNotSubscribe";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useExpensesHook } from "@/hooks/useExpensesHook";
import { cn } from "@/lib/utils";
import { formatToNaira } from "@/utils/formatMoney";
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  DollarSign,
  Forward,
  TrendingDown,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { DateRange } from "react-day-picker";
import AddExpenses from "./AddExpenses";
import AllExpenses from "./AllExpenses";

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
      icon: <TrendingDown className="w-5 h-5 text-red-600" />,
      text: "text-primary-black-100",
      amountText: "text-primary-black-100",
    },
    monthly: {
      bg: "bg-gradient-to-br from-orange-50 to-orange-100",
      border: "border-orange-200",
      iconBg: "bg-orange-100",
      icon: <Calendar className="w-5 h-5 text-orange-600" />,
      text: "text-primary-black-100",
      amountText: "text-primary-black-100",
    },
    daily: {
      bg: "bg-gradient-to-br from-amber-50 to-amber-100",
      border: "border-amber-200",
      iconBg: "bg-amber-100",
      icon: <DollarSign className="w-5 h-5 text-amber-600" />,
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
        "p-4 w-full rounded-lg border transition-all hover:shadow-md",
        className
      )}
    >
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className={cn("p-2 rounded-full", variant.iconBg)}>
            {variant.icon}
          </div>
          <span className={cn("text-sm font-medium", variant.text)}>
            {title}
          </span>
        </div>
        <span className="text-sm flex gap-2 items-center font-medium hover:cursor-pointer text-primary-black-100 ">
          View analytics <Forward className="text-red-500 text-sm" />
        </span>
      </div>
      <div className="mt-4">
        <span className={cn("text-2xl font-bold", variant.amountText)}>
          {amount}
        </span>
      </div>
    </CustomCard>
  );
};

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

  // Check scroll availability
  const checkScrollAvailability = () => {
    const container = categoriesContainerRef.current;
    if (container) {
      setCanScrollLeft(container.scrollLeft > 0);
      setCanScrollRight(
        container.scrollLeft < container.scrollWidth - container.clientWidth
      );
    }
  };

  // Category navigation functions
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

  // Check scroll availability when categories load or container size changes
  useEffect(() => {
    checkScrollAvailability();
    const container = categoriesContainerRef.current;
    if (container) {
      container.addEventListener("scroll", checkScrollAvailability);
      return () =>
        container.removeEventListener("scroll", checkScrollAvailability);
    }
  }, [CategoriesData]);

  // Check on window resize
  useEffect(() => {
    const handleResize = () => checkScrollAvailability();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const totalExpenses = ExpensesData?.data?.results?.total_expenses || 0;

  return (
    <div className="w-full h-full flex flex-col justify-start gap-6 items-start">
      {/* Header Section */}
      <div className="w-full bg-white">
        <div className="flex items-center justify-between w-full mb-6">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl md:text-3xl text-primary-black-100 font-[600]">
              Expenses
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <Button
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2"
              onClick={openAddExpensesModal}
            >
              + Add Expenses
            </Button>

            <DatePickerWithRange date={dateRange} onDateChange={setDateRange} />
          </div>
        </div>

        {/* Overview Cards */}
        <div className="mb-6">
          <h2 className="text-lg font-medium text-primary-black-100 mb-4">
            Overview
          </h2>

          {ExpensesLoading || !ExpensesData ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <CustomExpenseCard
                title="Total Expenses"
                amount={formatToNaira(
                  ExpensesData?.data?.results?.total_expenses
                )}
                type="total"
              />
              {/* <CustomExpenseCard
                title="Monthly Average"
                amount={formatToNaira(
                  ExpensesData?.data?.results?.monthly_average || 0
                )}
                type="monthly"
              />
              <CustomExpenseCard
                title="Daily Average"
                amount={formatToNaira(
                  ExpensesData?.data?.results?.daily_average || 0
                )}
                type="daily"
              /> */}
            </div>
          )}
        </div>
      </div>

      {/* Main Content Section */}
      <div className="w-full rounded-lg shadow-sm border border-gray-200 bg-white">
        {/* Categories and Search Header */}
        <div className="p-6 border-b border-gray-200 bg-white rounded-t-lg w-full">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-primary-black-100">
              Manage Expenses
              <span className="ml-2 text-xs bg-red-100 px-2 py-1 rounded-full text-red-600 font-medium">
                {ExpensesData?.data?.total?.toLocaleString() || "0"}
              </span>
            </h2>

            <div className="flex items-center gap-4">
              <div className="w-80">
                <SearchInput
                  placeholder="Search by expense name..."
                  value={searchInput}
                  onValueChange={handleSearchChange}
                />
              </div>

              <Link href="/categories/expenses">
                <Button
                  variant="outline"
                  className="text-green-500 border-green-200 hover:bg-green-50"
                >
                  View More
                </Button>
              </Link>
            </div>
          </div>

          {/* Categories Tabs */}
          {CategoriesDataLoading || !CategoriesData ? (
            <div className="flex gap-2">
              {Array.from({ length: 6 }).map((_, index) => (
                <Skeleton
                  key={index}
                  className="h-10 w-20 bg-gray-200 rounded-md flex-shrink-0"
                />
              ))}
            </div>
          ) : (
            <div className="w-full">
              <div className="flex items-center w-full">
                {/* Left Navigation Button */}
                <button
                  onClick={() => scrollCategories("left")}
                  disabled={!canScrollLeft}
                  className={cn(
                    "p-2 rounded-md transition-all mr-2 flex-shrink-0",
                    canScrollLeft
                      ? "text-gray-600 hover:text-green-500 hover:bg-green-50"
                      : "text-gray-300 cursor-not-allowed"
                  )}
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>

                {/* Categories Container */}
                <div
                  ref={categoriesContainerRef}
                  className="flex gap-2 overflow-x-auto flex-1 scrollbar-hide"
                  style={{
                    scrollbarWidth: "none",
                    msOverflowStyle: "none",
                  }}
                >
                  {/* All Tab */}
                  <button
                    className={cn(
                      "px-4 py-2 text-sm font-medium cursor-pointer rounded-md transition-all whitespace-nowrap flex-shrink-0",
                      selectedCategory === null
                        ? "bg-[#52b661] text-white shadow-sm"
                        : "text-gray-600 hover:text-green-500 hover:bg-green-50"
                    )}
                    onClick={handleAllClick}
                  >
                    All
                  </button>

                  {/* Category Tabs */}
                  {CategoriesData?.data?.map((category: Category) => (
                    <button
                      key={category.id}
                      className={cn(
                        "px-4 py-2 text-sm cursor-pointer font-medium rounded-md transition-all whitespace-nowrap flex-shrink-0",
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

                {/* Right Navigation Button */}
                <button
                  onClick={() => scrollCategories("right")}
                  disabled={!canScrollRight}
                  className={cn(
                    "p-2 rounded-md transition-all ml-2 flex-shrink-0",
                    canScrollRight
                      ? "text-gray-600 hover:text-green-500 hover:bg-green-50"
                      : "text-gray-300 cursor-not-allowed"
                  )}
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}

          {searchInput.length > 0 && searchInput.length < 3 && (
            <div className="mt-2 text-sm text-gray-500">
              Type at least 3 characters to search
            </div>
          )}
        </div>

        {/* Table Content */}
        <div className="p-6">
          {ExpensesLoading || !ExpensesData ? (
            <div className="w-full">
              <div className="space-y-4">
                <Skeleton className="h-10 w-full bg-gray-200" />
                {Array.from({ length: 5 }).map((_, index) => (
                  <Skeleton
                    key={index}
                    className="h-16 w-full bg-gray-200 mt-2"
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

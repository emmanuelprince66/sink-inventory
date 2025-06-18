"use client";

import { CustomCard } from "@/components/app/CustomCard";
import { CustomModal } from "@/components/app/CustomModal";
import { DatePickerWithRange } from "@/components/app/DateRangePicker";
import { SearchInput } from "@/components/app/SearchInput";
import UserNotSubscribe from "@/components/app/UserNotSubscribe";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useExpensesHook } from "@/hooks/useExpensesHook";
import { formatToNaira } from "@/utils/formatMoney";
import { ArrowRight, PieChart } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
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

interface CustomInventoryCardProps {
  title: string;
  amount: number | string;
  type: "value" | "profit" | "other";
  className?: string;
}

const Expenses = () => {
  const [searchInput, setSearchInput] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showNotSubscribeModal, setShowNotSubscribeModal] = useState(false);
  const handleOpenNotSubscribeModal = () => setShowNotSubscribeModal(true);
  const handleCloseNotSubscribeModal = () => setShowNotSubscribeModal(false);
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(),
    to: new Date(),
  });

  const {
    ExpensesData,
    ExpensesLoading,
    CategoriesDataLoading,
    CategoriesData,
  } = useExpensesHook({
    searchInput,
    selectedCategory,
    dateRange,
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

  const [addExpensesModal, setAddExpensesModal] = useState(false);
  const closeAddExpensesModal = () => setAddExpensesModal(false);
  const openAddExpensesModal = () => setAddExpensesModal(true);

  return (
    <>
      <div className="w-full h-full flex flex-col justify-start gap-5 items-start">
        <div className="flex items-center justify-between w-full">
          <div className="flex justify-between items-center w-full">
            <p className="text-2xl md:text-3xl text-primary-black-100 font-[500]">
              Expenses
            </p>

            <div className="flex items-center gap-2">
              <Button
                className=" border-primary-green-300"
                onClick={openAddExpensesModal}
              >
                Add Expenses
              </Button>

              <DatePickerWithRange
                date={dateRange}
                onDateChange={setDateRange}
              />
            </div>
          </div>
        </div>

        {ExpensesLoading || !ExpensesData ? (
          <div className="flex gap-4 w-[500px] mt-5">
            {Array.from({ length: 1 }).map((_, index) => (
              <CustomCard key={index} className="w-full border-gray-200">
                <div className="flex flex-col gap-6 items-start">
                  <Skeleton className="h-4 w-full bg-[#eef4ef]" />
                  <Skeleton className="h-6 w-[300px] bg-[#eef4ef]" />
                  <Skeleton className="h-6 w-[100px] bg-[#eef4ef]" />
                </div>
              </CustomCard>
            ))}
          </div>
        ) : (
          <CustomCard className="w-[500px] h-[150px] mt-5 flex flex-col gap-4 justify-between p-4 bg-primary-green-200 border border-primary-green-300 rounded-lg shadow-sm">
            {/* Top Section - Full width */}
            <div className="flex justify-between items-center w-full">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white rounded-full">
                  <PieChart className="w-5 h-5 text-primary-green-300" />
                </div>
                <span className="text-sm font-medium text-gray-600">
                  Total Expenses
                </span>
              </div>

              <button className="flex items-center gap-1 group cursor-pointer">
                <span className="text-sm font-medium text-gray-900 group-hover:text-primary-green-700 transition-colors">
                  See Analytics
                </span>
                <ArrowRight className="w-4 h-4 text-primary-green-300 group-hover:text-primary-green-700 group-hover:translate-x-1 transition-all" />
              </button>
            </div>

            {/* Bottom Section - Full width */}
            <div className="flex flex-col w-full gap-1 mt-4">
              <span className="text-2xl font-bold text-gray-900">
                {formatToNaira(ExpensesData?.data?.results?.total_expenses)}
              </span>
            </div>
          </CustomCard>
        )}

        <div className="w-[100%] items-center flex justify-between my-2">
          <p className="text-primary-black-100 mr-2">Categories</p>
          <div className="flex gap-2 items-center">
            <Link href={"/categories/expenses"}>
              <Button className="px-3 py-1 rounded-md text-xs border border-gray-300 hover:text-primary-black-100 hover:bg-gray-50 text-primary-green-600">
                View More
              </Button>
            </Link>
          </div>
        </div>

        {CategoriesDataLoading || !CategoriesData ? (
          <div className="flex gap-4 w-1/2">
            {Array.from({ length: 5 }).map((_, index) => (
              <CustomCard key={index} className="w-[100px] border-gray-200">
                <div className="flex flex-col  items-start w-full">
                  <Skeleton className="h-5 w-[40px] bg-[#eef4ef]" />
                </div>
              </CustomCard>
            ))}
          </div>
        ) : (
          <div className="flex gap-3 mb-4 flex-wrap">
            <Button
              className={`px-4 py-2 rounded-md h-14 min-w-[70px] text-sm hover:text-white font-medium transition-colors ${
                selectedCategory === null
                  ? "bg-primary-green-300 text-white"
                  : "bg-primary-green-200 text-primary-black-100"
              }`}
              onClick={handleAllClick}
            >
              All
            </Button>

            {CategoriesData.data.map((category: Category) => (
              <Button
                key={category.id}
                className={`px-4 py-2 rounded-md h-14 min-w-[70px] text-sm hover:text-white font-medium transition-colors ${
                  selectedCategory === category.name
                    ? "bg-primary-green-300 text-white"
                    : "bg-primary-green-200 text-primary-black-100"
                }`}
                onClick={() => handleCategoryClick(category.id)}
              >
                {category.name}
              </Button>
            ))}
          </div>
        )}

        <div className="w-full md:w-1/2 mb-4 mt-4">
          <SearchInput
            placeholder="Search by expense name ..."
            value={searchInput}
            onValueChange={handleSearchChange}
          />
          {searchInput.length > 0 && searchInput.length < 3 && (
            <div className="mt-1 text-sm text-muted-foreground">
              Type at least 3 characters to search
            </div>
          )}
        </div>

        {ExpensesLoading || !ExpensesData ? (
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
          <AllExpenses
            expensesData={ExpensesData}
            expensesLoading={ExpensesLoading}
          />
        )}
      </div>

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

      <CustomModal
        isOpen={showNotSubscribeModal}
        onClose={handleCloseNotSubscribeModal}
        trigger={false}
        title="Subscription Details"
      >
        <div className="w-full ">
          <UserNotSubscribe />
        </div>
      </CustomModal>
    </>
  );
};

export default Expenses;

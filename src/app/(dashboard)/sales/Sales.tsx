"use client";

import { CustomCard } from "@/components/app/CustomCard";
import { CustomModal } from "@/components/app/CustomModal";
import { DatePickerWithRange } from "@/components/app/DateRangePicker";
import { SearchInput } from "@/components/app/SearchInput";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSalesHook } from "@/hooks/useSalesHook";
import { useUserRole } from "@/lib/store/user-store";
import { cn } from "@/lib/utils";
import { formatToNaira } from "@/utils/formatMoney";
import {
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Users,
  Wallet,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { DateRange } from "react-day-picker";
import OrderHistory from "./OrderHistory";
import ProductsSold from "./ProductsSold";
import ShowAllAttendants from "./ShowAllAttendants";

const productFilterOptions = [
  "All",
  "Fast Moving",
  "Most Profitable",
  "Top Selling",
] as const;

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

const orderFilterOptions = [
  "All",
  "Completed",
  "Pending",
  "Cancelled",
] as const;

const CustomSalesCard = ({
  title,
  amount,
  type,
}: {
  title: string;
  amount: number | string;
  type?: string;
}) => {
  const isRevenueCard = title === "Revenue";
  const isCostCard = title === "Product Cost";
  const isItemsCard = title === "Items Sold";
  const isDiscountCard = title === "Total Discount";
  const isProfitCard = title === "Profit";

  const getCardStyle = () => {
    if (isRevenueCard) {
      return {
        bg: "bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200",
        text: "text-primary-black-100",
        amount: "text-primary-black-100",
        badge: "bg-blue-100",
        icon: <Wallet className="w-5 h-5 text-blue-600" />,
      };
    }
    if (isCostCard) {
      return {
        bg: "bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200",
        text: "text-primary-black-100",
        amount: "text-primary-black-100",
        badge: "bg-amber-100",
        icon: <AlertCircle className="w-5 h-5 text-amber-600" />,
      };
    }
    if (isItemsCard) {
      return {
        bg: "bg-gradient-to-br from-indigo-50 to-indigo-100 border-indigo-200",
        text: "text-primary-black-100",
        amount: "text-primary-black-100",
        badge: "bg-indigo-100",
        icon: <Users className="w-5 h-5 text-indigo-600" />,
      };
    }
    if (isDiscountCard) {
      return {
        bg: "bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200",
        text: "text-primary-black-1000",
        amount: "text-primary-black-100",
        badge: "bg-purple-100",
        icon: <AlertCircle className="w-5 h-5 text-purple-600" />,
      };
    }
    if (isProfitCard) {
      return {
        bg: "bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200",
        text: "text-primary-black-100",
        amount: "text-primary-black-100",
        badge: "bg-emerald-100",
        icon: <Wallet className="w-5 h-5 text-emerald-600" />,
      };
    }
    return {
      bg: "bg-gradient-to-br from-gray-50 to-gray-100 border-gray-200",
      text: "text-primary-black-100",
      amount: "text-primary-black-100",
      badge: "bg-gray-100",
      icon: <Wallet className="w-5 h-5 text-gray-600" />,
    };
  };

  const cardStyle = getCardStyle();

  return (
    <CustomCard
      className={cn(
        "p-4 rounded-lg border transition-all hover:shadow-md w-full h-full",
        cardStyle.bg
      )}
    >
      <div className="flex flex-col gap-2 h-full justify-between">
        <div className="flex justify-between items-start w-full">
          <div className="flex items-center gap-3">
            <div className={cn("p-2 rounded-full", cardStyle.badge)}>
              {cardStyle.icon}
            </div>
            <span className={cn("text-sm font-medium", cardStyle.text)}>
              {title}
            </span>
          </div>
          {type === "discount" && (
            <p className="text-xs hover:underline cursor-pointer text-purple-600">
              View More
            </p>
          )}
        </div>
        <p className={cn("text-2xl font-bold", cardStyle.amount)}>{amount}</p>
      </div>
    </CustomCard>
  );
};

const Sales = () => {
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(),
    to: new Date(),
  });
  const { user } = useUserRole();

  const [searchInput, setSearchInput] = useState("");
  const [ShowAttendants, setShowAttendants] = useState(false);
  const [attendantId, setAttendantId] = useState("");
  const [page, setPage] = useState(1);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [activeProductFilter, setActiveProductFilter] = useState<
    (typeof productFilterOptions)[number]
  >(productFilterOptions[0]);
  const [activeOrderFilter, setActiveOrderFilter] = useState<
    (typeof orderFilterOptions)[number]
  >(orderFilterOptions[0]);
  const [activeTab, setActiveTab] = useState<"products" | "history">(
    "products"
  );
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
    null
  );

  const categoriesContainerRef = useRef<HTMLDivElement>(null);

  const closeAttendantsModal = () => setShowAttendants(false);
  const openAttendantsModal = () => setShowAttendants(true);

  const handleCategoryClick = (categoryId: string) => {
    setSelectedCategoryId(categoryId);
  };

  const handleClickAttendants = (attendants: any) => {
    setAttendantId(attendants?.id);
    closeAttendantsModal();
  };

  const {
    SalesData,
    SalesLoading,
    AttendantsData,
    AttendantsLoading,
    CategoriesData,
    CategoriesDataLoading,
    SalesOrderData,
    SalesOrderLoading,
  } = useSalesHook({
    activeFilter: activeProductFilter,
    activeFilterTwo: activeOrderFilter,
    selectedCategoryId,
    dateRange,
    searchInput,
    attendantId,
    page,
  });

  console.log("salesData", SalesData);

  const totalProfit = useMemo(() => {
    return SalesData?.data?.results?.data.reduce(
      (acc: any, curr: any) => acc + curr.profit,
      0
    );
  }, [SalesData]);

  const handleAllClick = () => {
    setSelectedCategoryId(null);
  };

  const handleSearchChange = (value: string) => {
    setSearchInput(value);
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

  const totalProductsItems = SalesData?.data?.results?.data?.length || 0;
  const totalOrderItems = SalesOrderData?.data?.total || 0;

  return (
    <div className="w-full h-full flex flex-col justify-start gap-6 items-start">
      {/* Header Section */}
      <div className="w-full bg-white">
        <div className="flex items-center justify-between w-full mb-6">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl md:text-3xl text-primary-black-100 font-[600]">
              Sales
            </h1>
          </div>

          <div className="flex items-center gap-3">
            {user && user?.role === "OWNER" && (
              <Button
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2"
                onClick={openAttendantsModal}
              >
                Attendants
              </Button>
            )}

            <DatePickerWithRange date={dateRange} onDateChange={setDateRange} />
          </div>
        </div>

        {/* Overview Cards */}
        <div className="mb-6">
          <h2 className="text-lg font-medium text-primary-black-100 mb-4">
            Overview
          </h2>

          {SalesLoading || !SalesData ? (
            <div className="w-full grid grid-cols-2 md:grid-cols-5 gap-4">
              {Array.from({ length: 5 }).map((_, index) => (
                <CustomCard
                  key={index}
                  className="w-full border-gray-200 h-[120px]"
                >
                  <div className="flex flex-col gap-6 items-start h-full justify-center">
                    <Skeleton className="h-4 w-[100px] bg-[#eef4ef]" />
                    <Skeleton className="h-6 w-[70px] bg-[#eef4ef]" />
                  </div>
                </CustomCard>
              ))}
            </div>
          ) : (
            <div className="w-full grid grid-cols-2 md:grid-cols-5 gap-4">
              <CustomSalesCard
                title={"Revenue"}
                amount={formatToNaira(SalesData?.data?.results?.revenue)}
              />
              <CustomSalesCard
                title={"Product Cost"}
                amount={formatToNaira(SalesData?.data?.results?.cost)}
              />
              <CustomSalesCard
                title={"Items Sold"}
                amount={SalesData?.data?.results?.orders}
              />
              <CustomSalesCard
                title={"Total Discount"}
                amount={formatToNaira(SalesData?.data?.results?.discount || 0)}
                type="discount"
              />

              {user && user?.role === "OWNER" && (
                <CustomSalesCard
                  title={"Profit"}
                  amount={formatToNaira(totalProfit)}
                />
              )}
            </div>
          )}
        </div>
      </div>

      {/* Main Content Section */}
      <div className="w-full rounded-lg shadow-sm border border-gray-200 bg-white">
        {/* Tabs Header */}
        <div className="p-6 border-b border-gray-200 bg-white rounded-t-lg w-full">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-primary-black-100 flex items-center gap-2">
              {activeTab === "products" ? (
                <>
                  Sales Analytics
                  <span className="text-xs bg-blue-100 px-2 py-1 rounded-full text-blue-600 font-medium">
                    {totalProductsItems.toLocaleString()}
                  </span>
                </>
              ) : (
                <>
                  Order History
                  <span className="text-xs bg-green-100 px-2 py-1 rounded-full text-green-600 font-medium">
                    {totalOrderItems.toLocaleString()}
                  </span>
                </>
              )}
            </h2>

            <div className="flex items-center gap-4">
              <div className="w-80">
                <SearchInput
                  placeholder="Search ..."
                  value={searchInput}
                  onValueChange={handleSearchChange}
                />
              </div>
            </div>
          </div>

          {/* Tabs Navigation */}
          <div className="w-full ">
            <Tabs
              value={activeTab}
              onValueChange={(value) =>
                setActiveTab(value as "products" | "history")
              }
              className="w-full"
            >
              <TabsList className="w-[400px] bg-primary-green-50 border-b border-gray-200">
                <TabsTrigger
                  value="products"
                  className="data-[state=active]:bg-primary-green-300 data-[state=active]:text-white"
                >
                  Products Sold
                </TabsTrigger>
                <TabsTrigger
                  value="history"
                  className="data-[state=active]:bg-primary-green-300 data-[state=active]:text-white"
                >
                  Order History
                </TabsTrigger>
              </TabsList>

              {searchInput.length > 0 && searchInput.length < 3 && (
                <div className="mt-2 text-sm text-gray-500">
                  Type at least 3 characters to search
                </div>
              )}

              {/* Products Tab Content */}
              <TabsContent value="products" className="mt-6">
                {/* Product Filter Options */}
                <div className="flex gap-3 mb-4 flex-wrap">
                  {productFilterOptions.map((filter) => (
                    <Button
                      key={filter}
                      className={`px-4 py-2 rounded-md h-10 min-w-[70px] text-sm hover:text-white font-medium transition-colors ${
                        activeProductFilter === filter
                          ? "bg-primary-green-300 text-white shadow-sm"
                          : "bg-primary-green-200 text-primary-black-100 hover:bg-primary-green-250"
                      }`}
                      onClick={() => setActiveProductFilter(filter)}
                    >
                      {filter}
                    </Button>
                  ))}
                </div>

                {/* Subtle demarcation line */}
                <div className="w-full h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent my-6"></div>

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
                  <div className="w-full mb-4">
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
                            selectedCategoryId === null
                              ? "bg-[#52b661] text-white shadow-sm"
                              : "text-gray-600 hover:text-green-500 hover:bg-green-50"
                          )}
                          onClick={handleAllClick}
                        >
                          All
                        </button>

                        {/* Category Tabs */}
                        {CategoriesData.data.map((category: Category) => (
                          <button
                            key={category.id}
                            className={cn(
                              "px-4 py-2 text-sm cursor-pointer font-medium rounded-md transition-all whitespace-nowrap flex-shrink-0",
                              selectedCategoryId === category.id
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
              </TabsContent>

              {/* Order History Tab Content */}
              <TabsContent value="history" className="mt-6">
                <div className="flex gap-3 mb-4 flex-wrap">
                  {orderFilterOptions.map((filter) => (
                    <Button
                      key={filter}
                      className={`px-4 py-2 rounded-md h-10 min-w-[70px] text-sm hover:text-white font-medium transition-colors ${
                        activeOrderFilter === filter
                          ? "bg-primary-green-300 text-white shadow-sm"
                          : "bg-primary-green-200 text-primary-black-100 hover:bg-primary-green-250"
                      }`}
                      onClick={() => setActiveOrderFilter(filter)}
                    >
                      {filter}
                    </Button>
                  ))}
                </div>

                {/* Subtle demarcation line for order history too */}
                <div className="w-full h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent my-6"></div>
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {/* Table Content */}
        <div className="p-6">
          <Tabs
            value={activeTab}
            onValueChange={(value) =>
              setActiveTab(value as "products" | "history")
            }
            className="w-full"
          >
            <TabsContent value="products">
              {SalesLoading || !SalesData ? (
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
                <ProductsSold
                  SalesData={SalesData}
                  SalesLoading={SalesLoading}
                  activeFilter={activeProductFilter}
                  setActiveFilter={setActiveProductFilter}
                  filterOptions={productFilterOptions}
                  searchInput={searchInput}
                  handleSearchChange={handleSearchChange}
                />
              )}
            </TabsContent>

            <TabsContent value="history">
              {SalesOrderLoading || !SalesOrderData ? (
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
                <OrderHistory
                  SalesOrderData={SalesOrderData}
                  loading={SalesOrderLoading}
                  activeFilter={activeOrderFilter}
                  setActiveFilter={setActiveOrderFilter}
                  filterOptions={orderFilterOptions}
                  setPage={setPage}
                  page={page}
                />
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Attendants Modal */}
      <CustomModal
        isOpen={ShowAttendants}
        onClose={closeAttendantsModal}
        trigger={false}
        title="Store Attendants"
      >
        <ShowAllAttendants
          AttendantsData={AttendantsData}
          AttendantsLoading={AttendantsLoading}
          handleClickAttendants={handleClickAttendants}
        />
      </CustomModal>
    </div>
  );
};

export default Sales;

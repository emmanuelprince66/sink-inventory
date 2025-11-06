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
import DiscountProduct from "./DiscountProduct";
import OrderHistory from "./OrderHistory";
import ProductsSold from "./ProductsSold";
import ShowAllAttendants from "./ShowAllAttendants";

const productFilterOptions = [
  "All",
  "Fast Moving",
  "Most Profitable",
  "Top Selling",
  "Discounted",
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
  func,
}: {
  title: string;
  amount: number | string;
  type?: string;
  func?: any;
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
        icon: <Wallet className="w-4 sm:w-5 h-4 sm:h-5 text-blue-600" />,
      };
    }
    if (isCostCard) {
      return {
        bg: "bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200",
        text: "text-primary-black-100",
        amount: "text-primary-black-100",
        badge: "bg-amber-100",
        icon: <AlertCircle className="w-4 sm:w-5 h-4 sm:h-5 text-amber-600" />,
      };
    }
    if (isItemsCard) {
      return {
        bg: "bg-gradient-to-br from-indigo-50 to-indigo-100 border-indigo-200",
        text: "text-primary-black-100",
        amount: "text-primary-black-100",
        badge: "bg-indigo-100",
        icon: <Users className="w-4 sm:w-5 h-4 sm:h-5 text-indigo-600" />,
      };
    }
    if (isDiscountCard) {
      return {
        bg: "bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200",
        text: "text-primary-black-1000",
        amount: "text-primary-black-100",
        badge: "bg-purple-100",
        icon: <AlertCircle className="w-4 sm:w-5 h-4 sm:h-5 text-purple-600" />,
      };
    }
    if (isProfitCard) {
      return {
        bg: "bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200",
        text: "text-primary-black-100",
        amount: "text-primary-black-100",
        badge: "bg-emerald-100",
        icon: <Wallet className="w-4 sm:w-5 h-4 sm:h-5 text-emerald-600" />,
      };
    }
    return {
      bg: "bg-gradient-to-br from-gray-50 to-gray-100 border-gray-200",
      text: "text-primary-black-100",
      amount: "text-primary-black-100",
      badge: "bg-gray-100",
      icon: <Wallet className="w-4 sm:w-5 h-4 sm:h-5 text-gray-600" />,
    };
  };

  const cardStyle = getCardStyle();

  return (
    <CustomCard
      className={cn(
        "p-3 sm:p-4 rounded-lg border transition-all hover:shadow-md w-full h-full",
        cardStyle.bg
      )}
    >
      <div className="flex flex-col gap-1 sm:gap-2 h-full justify-between">
        <div className="flex justify-between items-start w-full">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className={cn("p-1 sm:p-2 rounded-full", cardStyle.badge)}>
              {cardStyle.icon}
            </div>
            <span
              className={cn("text-xs sm:text-sm font-medium", cardStyle.text)}
            >
              {title}
            </span>
          </div>
          {type === "discount" && (
            <p
              onClick={func}
              className="text-xs hover:underline cursor-pointer text-purple-600"
            >
              View More
            </p>
          )}
        </div>
        <p className={cn("text-lg sm:text-2xl font-bold", cardStyle.amount)}>
          {amount}
        </p>
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

  const [showDiscountSalesModal, setShowDiscountSalesModal] = useState(false);

  const closeDiscountSalesModal = () => setShowDiscountSalesModal(false);

  const handleOpenDiscountSalesModal = () => {
    setActiveProductFilter("Discounted");
    setShowDiscountSalesModal(true);
  };
  const {
    SalesData,
    SalesLoading,
    AttendantsData,
    AttendantsLoading,
    CategoriesData,
    CategoriesDataLoading,
    SalesOrderData,
    handleProductsRowClick,
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

  const totalProductsItems = SalesData?.data?.results?.data?.length || 0;
  const totalOrderItems = SalesOrderData?.data?.total || 0;

  return (
    <div className="w-full h-full flex flex-col justify-start gap-4 sm:gap-6 items-start">
      {/* Header Section */}
      <div className="w-full bg-white px-2 sm:px-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between w-full mb-4 sm:mb-6 gap-3 sm:gap-0">
          <div className="flex items-center gap-2 sm:gap-3">
            <h1 className="text-xl sm:text-2xl md:text-3xl text-primary-black-100 font-[600]">
              Sales
            </h1>
          </div>

          <div className="flex flex-col justify-center sm:flex-row items-center sm:items-center gap-2 sm:gap-3 w-full sm:w-auto">
            <Button
              variant={"outline"}
              className="text-green-600 px-3 sm:px-4 py-1.5 sm:py-2 text-sm sm:text-base w-full sm:w-auto"
              // onClick={openAttendantsModal}
            >
              Download Report
            </Button>

            {user && user?.role === "OWNER" && (
              <Button
                className="bg-green-500 hover:bg-green-600 text-white px-3 sm:px-4 py-1.5 sm:py-2 text-sm sm:text-base w-full sm:w-auto"
                onClick={openAttendantsModal}
              >
                Attendants
              </Button>
            )}

            <div className="w-full">
              <DatePickerWithRange
                date={dateRange}
                onDateChange={setDateRange}
                className="w-full sm:w-auto mx-auto sm:mx-auto"
              />
            </div>
          </div>
        </div>

        {/* Overview Cards */}
        <div className="mb-4 sm:mb-6">
          <h2 className="text-base sm:text-lg font-medium text-primary-black-100 mb-3 sm:mb-4">
            Overview
          </h2>

          {SalesLoading || !SalesData ? (
            <div className="w-full grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 sm:gap-4">
              {Array.from({ length: 5 }).map((_, index) => (
                <CustomCard
                  key={index}
                  className="w-full border-gray-200 h-[100px] sm:h-[120px]"
                >
                  <div className="flex flex-col gap-3 sm:gap-6 items-start h-full justify-center">
                    <Skeleton className="h-3 sm:h-4 w-[80px] sm:w-[100px] bg-[#eef4ef]" />
                    <Skeleton className="h-4 sm:h-6 w-[60px] sm:w-[70px] bg-[#eef4ef]" />
                  </div>
                </CustomCard>
              ))}
            </div>
          ) : (
            <div className="w-full grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 sm:gap-4">
              {user && user?.role === "OWNER" && (
                <>
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
                    amount={formatToNaira(
                      SalesData?.data?.results?.discount || 0
                    )}
                    type="discount"
                    func={handleOpenDiscountSalesModal}
                  />
                  <CustomSalesCard
                    title={"Profit"}
                    amount={formatToNaira(totalProfit)}
                  />
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Main Content Section */}
      <div className="w-full rounded-lg shadow-sm border border-gray-200 bg-white">
        {/* Tabs Header */}
        <div className="p-4 sm:p-6 border-b border-gray-200 bg-white rounded-t-lg w-full">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 mb-3 sm:mb-4">
            <h2 className="text-lg sm:text-xl font-semibold text-primary-black-100 flex items-center gap-2">
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

            <div className="w-full sm:w-80">
              <SearchInput
                placeholder="Search ..."
                value={searchInput}
                onValueChange={handleSearchChange}
              />
            </div>
          </div>

          {/* Tabs Navigation */}
          <div className="w-full">
            <Tabs
              value={activeTab}
              onValueChange={(value) =>
                setActiveTab(value as "products" | "history")
              }
              className="w-full"
            >
              <TabsList className="w-full sm:w-[400px] bg-primary-green-50 border-b border-gray-200">
                <TabsTrigger
                  value="products"
                  className="data-[state=active]:bg-primary-green-300 data-[state=active]:text-white text-xs sm:text-sm"
                >
                  Products Sold
                </TabsTrigger>
                <TabsTrigger
                  value="history"
                  className="data-[state=active]:bg-primary-green-300 data-[state=active]:text-white text-xs sm:text-sm"
                >
                  Order History
                </TabsTrigger>
              </TabsList>

              {searchInput.length > 0 && searchInput.length < 3 && (
                <div className="mt-2 text-xs sm:text-sm text-gray-500">
                  Type at least 3 characters to search
                </div>
              )}

              {/* Products Tab Content */}
              <TabsContent value="products" className="mt-4 sm:mt-6">
                {/* Product Filter Options */}
                <div className="flex gap-2 sm:gap-3 mb-3 sm:mb-4 overflow-x-auto pb-2">
                  {productFilterOptions.map((filter) => (
                    <Button
                      key={filter}
                      className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-md h-8 sm:h-10 min-w-[70px] text-xs sm:text-sm hover:text-primary-black-100 font-medium transition-colors whitespace-nowrap ${
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
                <div className="w-full h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent my-4 sm:my-6"></div>

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
                  <div className="w-full mb-3 sm:mb-4">
                    <div className="flex items-center w-full">
                      {/* Left Navigation Button */}
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

                      {/* Categories Container */}
                      <div
                        ref={categoriesContainerRef}
                        className="flex gap-1 sm:gap-2 overflow-x-auto flex-1 scrollbar-hide py-1"
                        style={{
                          scrollbarWidth: "none",
                          msOverflowStyle: "none",
                        }}
                      >
                        {/* All Tab */}
                        <button
                          className={cn(
                            "px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium cursor-pointer rounded-md transition-all whitespace-nowrap flex-shrink-0",
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
                              "px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm cursor-pointer font-medium rounded-md transition-all whitespace-nowrap flex-shrink-0",
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
              </TabsContent>

              {/* Order History Tab Content */}
              <TabsContent value="history" className="mt-4 sm:mt-6">
                <div className="flex gap-2 sm:gap-3 mb-3 sm:mb-4 overflow-x-auto pb-2">
                  {orderFilterOptions.map((filter) => (
                    <Button
                      key={filter}
                      className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-md h-8 sm:h-10 min-w-[70px] text-xs sm:text-sm hover:text-white font-medium transition-colors whitespace-nowrap ${
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
                <div className="w-full h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent my-4 sm:my-6"></div>
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {/* Table Content */}
        <div className="p-4 sm:p-6">
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
                <ProductsSold
                  SalesData={SalesData}
                  SalesLoading={SalesLoading}
                  activeFilter={activeProductFilter}
                  setActiveFilter={setActiveProductFilter}
                  filterOptions={productFilterOptions}
                  searchInput={searchInput}
                  handleProductsRowClick={handleProductsRowClick}
                  handleSearchChange={handleSearchChange}
                />
              )}
            </TabsContent>

            <TabsContent value="history">
              {SalesOrderLoading || !SalesOrderData ? (
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
      <CustomModal
        isOpen={showDiscountSalesModal}
        onClose={closeDiscountSalesModal}
        trigger={false}
        title="Discounted Sales"
      >
        <DiscountProduct
          SalesData={SalesData}
          SalesLoading={SalesLoading}
          closeDiscountSalesModal={closeDiscountSalesModal}
        />
      </CustomModal>
    </div>
  );
};

export default Sales;

"use client";

import { CustomCard } from "@/components/app/CustomCard";
import { CustomModal } from "@/components/app/CustomModal";
import { DatePickerWithRange } from "@/components/app/DateRangePicker";
import GenerateReportButton from "@/components/app/GenerateReportButton";
import { SearchInput } from "@/components/app/SearchInput";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { useSalesHook } from "@/hooks/useSalesHook";
import { useBusinessStore } from "@/lib/store/useBusinessStore";
import { useUserRole } from "@/lib/store/user-store";
import { cn } from "@/lib/utils";
import { formatToNaira } from "@/utils/formatMoney";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  Percent,
  Receipt,
  Settings,
  Tag,
  TrendingUp,
  Users,
  Wallet,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { DateRange } from "react-day-picker";
import DiscountProduct from "./DiscountProduct";
// Download Report temporarily disabled — re-enable when ready.
// import { DownloadSalesButton } from "./DownloadSalesButton";
import ComboSalesTable from "./ComboSalesTable";
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

const SALES_CARD_STYLES: Record<
  string,
  { bg: string; iconColor: string; icon: React.ReactNode }
> = {
  Revenue: {
    bg: "bg-[#eff6ff]",
    iconColor: "text-info-1",
    icon: <CreditCard className="w-[15px] h-[15px]" />,
  },
  "Product Cost": {
    bg: "bg-warning-2",
    iconColor: "text-warning-1",
    icon: <Tag className="w-[15px] h-[15px]" />,
  },
  "Items Sold": {
    bg: "bg-[#f5f3ff]",
    iconColor: "text-[#7c3aed]",
    icon: <Users className="w-[15px] h-[15px]" />,
  },
  "Total Discount": {
    bg: "bg-[#f5f3ff]",
    iconColor: "text-[#7c3aed]",
    icon: <Percent className="w-[15px] h-[15px]" />,
  },
  Profit: {
    bg: "bg-success-2",
    iconColor: "text-success-1",
    icon: <TrendingUp className="w-[15px] h-[15px]" />,
  },
  VAT: {
    bg: "bg-warning-2",
    iconColor: "text-warning-1",
    icon: <Receipt className="w-[15px] h-[15px]" />,
  },
};
const DEFAULT_SALES_CARD_STYLE = {
  bg: "bg-grey-6",
  iconColor: "text-grey-3",
  icon: <Wallet className="w-[15px] h-[15px]" />,
};

// Matches Figma reference: Convert Mobile Screens to Desktop/src/app/App.tsx, SalesScreen
// (KPI card grid, ~line 869) — rounded-2xl, p-5, icon LEFT of label, icon 15px, label 12px/700,
// value 24px/800 #111827. See sink/docs/FIGMA_VS_CODE_COMPARISON.md for the full breakdown.
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
  const cardStyle = SALES_CARD_STYLES[title] ?? DEFAULT_SALES_CARD_STYLE;

  return (
    <CustomCard
      className={cn(
        "rounded-2xl border-none transition-all w-full h-full p-0 relative",
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
      {type === "discount" && (
        <p
          onClick={func}
          className="absolute top-4 sm:top-5 right-4 sm:right-5 text-xs font-bold hover:underline cursor-pointer text-primary-green-300"
        >
          View More
        </p>
      )}
    </CustomCard>
  );
};

const Sales = () => {
  // Kept for DownloadSalesButton, currently disabled above.
  const business_id = useBusinessStore((state) => state.business_id);
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
    "products",
  );
  const [showComboSales, setShowComboSales] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
    null,
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
      0,
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
        container.scrollLeft < container.scrollWidth - container.clientWidth,
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

  return (
    <div className="w-0 min-w-full h-full flex flex-col justify-start gap-4 sm:gap-6 items-start">
      {/* Header Section */}
      <div className="w-full">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between w-full mb-4 sm:mb-6 gap-3 sm:gap-0">
          <div className="flex items-center gap-2 sm:gap-3">
            <h1 className="text-xl sm:text-2xl md:text-3xl text-grey-1 font-extrabold">
              Sales
            </h1>
          </div>

          <div className="flex flex-col justify-center sm:flex-row items-center sm:items-center gap-2 sm:gap-3 w-full sm:w-auto">
            {/* Download Report temporarily disabled — re-enable when ready.
            <DownloadSalesButton
              business_id={business_id}
              dateRange={dateRange}
              activeTab={activeTab}
              attendantId={attendantId}
              searchInput={searchInput}
              activeProductFilter={activeProductFilter}
              activeOrderFilter={activeOrderFilter}
              className="w-full sm:w-auto"
            />
            */}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-full sm:w-auto">
                  More Actions
                  <ChevronDown className="w-4 h-4 ml-1" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52 p-1.5">
                <DropdownMenuItem asChild className="p-0 focus:bg-transparent">
                  <div>
                    <GenerateReportButton
                      reportType="sales"
                      variant="ghost"
                      className="w-full justify-start rounded-lg py-1.5 font-semibold text-grey-2 hover:bg-secondary-6 hover:text-grey-2"
                    />
                  </div>
                </DropdownMenuItem>
                {user && user?.role === "OWNER" && (
                  <DropdownMenuItem
                    onClick={openAttendantsModal}
                    className="rounded-lg py-1.5 font-semibold text-grey-2 focus:bg-secondary-6 focus:text-grey-2"
                  >
                    <Users className="w-4 h-4 mr-0.5" />
                    Attendants
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            <div className="w-full">
              <DatePickerWithRange
                date={dateRange}
                onDateChange={setDateRange}
                className="w-full sm:w-auto mx-auto sm:mx-auto"
              />
            </div>
          </div>
        </div>

        {/* Overview Cards - Updated Responsive Version */}
        <div>
          <p className="text-sm font-bold text-primary-green-300 border-b border-border-tint pb-2 mb-3 sm:mb-4">
            Overview
          </p>

          {SalesLoading || !SalesData ? (
            <div className="w-full grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-4">
              {Array.from({ length: 6 }).map((_, index) => (
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
            <>
              {user &&
                (user?.role === "OWNER" ||
                  user?.role === "ADMIN-ATTENDANT" ||
                  user?.role === "ACCOUNTANT" ||
                  user?.role === "PRODUCTION-MANAGER") && (
                  <>
                    {/* Mobile: 2 columns */}
                    <div className="grid grid-cols-2 gap-2 md:hidden">
                      <CustomSalesCard
                        title={"Revenue"}
                        amount={formatToNaira(
                          SalesData?.data?.results?.revenue,
                        )}
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
                          SalesData?.data?.results?.discount || 0,
                        )}
                        type="discount"
                        func={handleOpenDiscountSalesModal}
                      />
                      <CustomSalesCard
                        title={"Profit"}
                        amount={formatToNaira(totalProfit)}
                      />
                      <CustomSalesCard
                        title={"VAT"}
                        amount={formatToNaira(
                          SalesData?.data?.results?.vat || 0,
                        )}
                      />
                    </div>

                    {/* Tablet: 3 columns */}
                    <div className="hidden md:grid md:grid-cols-3 lg:hidden gap-3">
                      <CustomSalesCard
                        title={"Revenue"}
                        amount={formatToNaira(
                          SalesData?.data?.results?.revenue,
                        )}
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
                          SalesData?.data?.results?.discount || 0,
                        )}
                        type="discount"
                        func={handleOpenDiscountSalesModal}
                      />
                      <CustomSalesCard
                        title={"Profit"}
                        amount={formatToNaira(totalProfit)}
                      />
                      <CustomSalesCard
                        title={"VAT"}
                        amount={formatToNaira(
                          SalesData?.data?.results?.vat || 0,
                        )}
                      />
                    </div>

                    {/* Desktop: 6 columns */}
                    <div className="hidden lg:grid lg:grid-cols-3 gap-4">
                      <CustomSalesCard
                        title={"Revenue"}
                        amount={formatToNaira(
                          SalesData?.data?.results?.revenue,
                        )}
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
                          SalesData?.data?.results?.discount || 0,
                        )}
                        type="discount"
                        func={handleOpenDiscountSalesModal}
                      />
                      <CustomSalesCard
                        title={"Profit"}
                        amount={formatToNaira(totalProfit)}
                      />
                      <CustomSalesCard
                        title={"VAT"}
                        amount={formatToNaira(
                          SalesData?.data?.results?.vat || 0,
                        )}
                      />
                    </div>
                  </>
                )}
            </>
          )}
        </div>
      </div>

      {/* Main Content Section */}
      {/* Matches Figma reference: Convert Mobile Screens to Desktop/src/app/App.tsx, SalesScreen
          "Sales Analytics section" (~line 900) — no shadow on this container, border-tint only.
          shadow-sm was removed here to match the spec exactly (was an unintentional extra). */}
      <div className="w-full rounded-2xl border border-border-tint bg-white overflow-hidden">
        {/* Tabs Header */}
        <div className="pt-4 sm:pt-6 w-full">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 mb-4 px-4 sm:px-6">
            <div className="flex flex-wrap items-center gap-3">
              <p className="text-sm font-extrabold text-grey-1">
                {activeTab === "products" ? "Sales Analytics" : "Order History"}
              </p>
              <button
                type="button"
                className="p-1.5 rounded-lg hover:bg-grey-6 text-grey-4 transition-colors cursor-pointer"
              >
                <Settings className="w-3.5 h-3.5" />
              </button>

              {/* Combo Sales Toggle */}
              <div className="flex items-center gap-2 ml-2">
                <Switch
                  id="combo-toggle"
                  checked={showComboSales}
                  onCheckedChange={setShowComboSales}
                />
                <label
                  htmlFor="combo-toggle"
                  className="text-xs font-semibold text-grey-3 cursor-pointer"
                >
                  View Combo Sales
                </label>
              </div>
            </div>

            <div className="w-full sm:w-80">
              <SearchInput
                placeholder="Search ..."
                value={searchInput}
                onValueChange={handleSearchChange}
              />
            </div>
          </div>

          {/* Tabs Navigation */}
          <div className={showComboSales ? "hidden" : "w-full"}>
            <Tabs
              value={activeTab}
              onValueChange={(value) =>
                setActiveTab(value as "products" | "history")
              }
              className="w-full"
            >
              <div className="flex items-center border-b border-border-tint px-4 sm:px-6">
                <button
                  onClick={() => setActiveTab("products")}
                  className={cn(
                    "px-4 py-3 text-sm font-bold border-b-2 cursor-pointer transition-colors mr-2",
                    activeTab === "products"
                      ? "border-primary-green-300 text-primary-green-300"
                      : "border-transparent text-grey-3 hover:text-grey-2",
                  )}
                >
                  Products Sold
                </button>
                <button
                  onClick={() => setActiveTab("history")}
                  className={cn(
                    "px-4 py-3 text-sm font-bold border-b-2 cursor-pointer transition-colors",
                    activeTab === "history"
                      ? "border-primary-green-300 text-primary-green-300"
                      : "border-transparent text-grey-3 hover:text-grey-2",
                  )}
                >
                  Order History
                </button>
              </div>

              {searchInput.length > 0 && searchInput.length < 3 && (
                <div className="mt-2 text-xs font-medium text-grey-3 px-4 sm:px-6">
                  Type at least 3 characters to search
                </div>
              )}

              {/* Products Tab Content */}
              <TabsContent value="products" className=" sm:mt-3">
                {/* Product Filter Options */}
                <div className="flex gap-2 sm:gap-3 flex-wrap px-4 sm:px-6 pb-4 border-b border-border-tint">
                  {productFilterOptions.map((filter) => (
                    <button
                      key={filter}
                      className={cn(
                        "px-3 sm:px-4 py-1.5 rounded-full text-xs font-bold transition-colors whitespace-nowrap cursor-pointer",
                        activeProductFilter === filter
                          ? "bg-primary-green-300 text-white"
                          : "bg-white border border-grey-5 text-grey-2 hover:bg-grey-6",
                      )}
                      onClick={() => setActiveProductFilter(filter)}
                    >
                      {filter}
                    </button>
                  ))}
                </div>

                {/* Categories Tabs */}
                {CategoriesDataLoading || !CategoriesData ? (
                  <div className="flex gap-2 overflow-x-auto pb-2 px-4 sm:px-6 pt-4">
                    {Array.from({ length: 6 }).map((_, index) => (
                      <Skeleton
                        key={index}
                        className="h-8 sm:h-10 w-16 sm:w-20 bg-grey-5 rounded-full flex-shrink-0"
                      />
                    ))}
                  </div>
                ) : (
                  <div className="w-full mb-3 sm:mb-4 px-4 sm:px-6 pt-4">
                    <div className="flex items-center w-full">
                      {/* Left Navigation Button */}
                      {canScrollLeft && (
                        <button
                          onClick={() => scrollCategories("left")}
                          disabled={!canScrollLeft}
                          className={cn(
                            "p-1 sm:p-2 rounded-full transition-all mr-1 sm:mr-2 flex-shrink-0",
                            canScrollLeft
                              ? "text-grey-3 hover:text-primary-green-300 hover:bg-secondary-6"
                              : "text-grey-5 cursor-not-allowed",
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
                            "px-3 sm:px-4 py-1.5 text-xs font-bold cursor-pointer rounded-full transition-all whitespace-nowrap flex-shrink-0",
                            selectedCategoryId === null
                              ? "bg-primary-green-300 text-white"
                              : "bg-white border border-grey-5 text-grey-2 hover:bg-grey-6",
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
                              "px-3 sm:px-4 py-1.5 text-xs cursor-pointer font-bold rounded-full transition-all whitespace-nowrap flex-shrink-0",
                              selectedCategoryId === category.id
                                ? "bg-primary-green-300 text-white"
                                : "bg-white border border-grey-5 text-grey-2 hover:bg-grey-6",
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
                            "p-1 sm:p-2 rounded-full transition-all ml-1 sm:ml-2 flex-shrink-0",
                            canScrollRight
                              ? "text-grey-3 hover:text-primary-green-300 hover:bg-secondary-6"
                              : "text-grey-5 cursor-not-allowed",
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
              <TabsContent value="history" className=" sm:mt-3">
                <div className="flex gap-2 sm:gap-3 flex-wrap px-4 sm:px-6 pb-4">
                  {orderFilterOptions.map((filter) => (
                    <button
                      key={filter}
                      className={cn(
                        "px-3 sm:px-4 py-1.5 rounded-full text-xs font-bold transition-colors whitespace-nowrap cursor-pointer",
                        activeOrderFilter === filter
                          ? "bg-primary-green-300 text-white"
                          : "bg-white border border-grey-5 text-grey-2 hover:bg-grey-6",
                      )}
                      onClick={() => setActiveOrderFilter(filter)}
                    >
                      {filter}
                    </button>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {/* Table Content */}
        <div className="pb-4 sm:pb-6">
          {showComboSales ? (
            <ComboSalesTable />
          ) : (
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
                    <div className="sm:space-y-4">
                      <Skeleton className="h-8 sm:h-10 w-full bg-grey-5" />
                      {Array.from({ length: 5 }).map((_, index) => (
                        <Skeleton
                          key={index}
                          className="h-12 sm:h-16 w-full bg-grey-5 mt-1 sm:mt-2"
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
                      <Skeleton className="h-8 sm:h-10 w-full bg-grey-5" />
                      {Array.from({ length: 5 }).map((_, index) => (
                        <Skeleton
                          key={index}
                          className="h-12 sm:h-16 w-full bg-grey-5 mt-1 sm:mt-2"
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
          )}
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

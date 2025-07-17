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
import { AlertCircle, Users, Wallet } from "lucide-react";
import { useMemo, useState } from "react";
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
  const closeAttendantsModal = () => setShowAttendants(false);
  const [attendantId, setAttendantId] = useState("");
  const [page, setPage] = useState(1);

  const openAttendantsModal = () => setShowAttendants(true);
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

  return (
    <div className="w-full h-full flex flex-col justify-start gap-5 items-start">
      <div className="flex items-center justify-between w-full">
        <div className="flex justify-between items-center w-full">
          <p className="text-2xl md:text-3xl text-primary-black-100 font-[500]">
            Sales
          </p>

          <div className="flex items-center gap-2">
            {user && user?.role === "OWNER" && (
              <Button className="" onClick={openAttendantsModal}>
                Attendants
              </Button>
            )}

            <DatePickerWithRange date={dateRange} onDateChange={setDateRange} />
          </div>
        </div>
      </div>

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

      <Tabs
        value={activeTab}
        onValueChange={(value) => setActiveTab(value as "products" | "history")}
        className="w-full mt-6"
      >
        <TabsList className="w-[400px] bg-primary-green-50">
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
        <div className="w-full h-[1px] bg-gray-200 mt-[-8px]" />

        <div className="w-full md:w-1/2 mb-4 mt-4">
          <SearchInput
            placeholder="Search ..."
            value={searchInput}
            onValueChange={handleSearchChange}
          />
          {searchInput.length > 0 && searchInput.length < 3 && (
            <div className="mt-1 text-sm text-muted-foreground">
              Type at least 3 characters to search
            </div>
          )}
        </div>

        <TabsContent value="products">
          {activeTab === "products" && (
            <div className="flex gap-3 mb-4 flex-wrap">
              {productFilterOptions.map((filter) => (
                <Button
                  key={filter}
                  className={`px-4 py-2 rounded-md h-14 min-w-[70px] text-sm hover:text-white font-medium transition-colors ${
                    activeProductFilter === filter
                      ? "bg-primary-green-300 text-white"
                      : "bg-primary-green-200 text-primary-black-100"
                  }`}
                  onClick={() => setActiveProductFilter(filter)}
                >
                  {filter}
                </Button>
              ))}
            </div>
          )}

          <div className="w-full h-[4px] bg-gray-200 my-5"></div>

          {activeTab === "products" && (
            <>
              {CategoriesDataLoading || !CategoriesData ? (
                <div className="flex gap-3 mb-4 flex-wrap">
                  {Array.from({ length: 8 }).map((_, index) => (
                    <Skeleton
                      key={index}
                      className="h-14 w-[100px] rounded-md bg-[#eef4ef]"
                    />
                  ))}
                </div>
              ) : (
                <div className="flex gap-3 mb-4 flex-wrap">
                  <Button
                    className={`px-4 py-2 rounded-md h-14 min-w-[70px] text-sm hover:text-white font-medium transition-colors ${
                      selectedCategoryId === null
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
                        selectedCategoryId === category.id
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
            </>
          )}

          {SalesLoading || !SalesData ? (
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

      {/* attendants Modal */}
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

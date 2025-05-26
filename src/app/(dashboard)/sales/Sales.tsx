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
import { formatToNaira } from "@/utils/formatMoney";
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

const orderFilterOptions = [
  "All",
  "Completed",
  "Pending",
  "Cancelled",
] as const;

const CustomSalesCard = ({
  title,
  amount,
}: {
  title: string;
  amount: number | string;
}) => {
  return (
    <CustomCard className="bg-primary-green-200 border-primary-green-300 w-full">
      <div className="flex flex-col gap-6 items-start">
        <p className="font-[500] text-sm text-primary-black-100">{title}</p>
        <p className="font-[600] text-xl text-primary-black-100">{amount}</p>
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

  const handleClickAttendants = (attendants: any) => {
    setAttendantId(attendants?.id);
    closeAttendantsModal();
    console.log("444", attendants);
  };

  const {
    SalesData,
    SalesLoading,
    AttendantsData,
    AttendantsLoading,
    SalesOrderData,
    SalesOrderLoading,
  } = useSalesHook(
    activeProductFilter,
    activeOrderFilter,
    dateRange,
    searchInput,
    attendantId,
    page
  );

  const totalProfit = useMemo(() => {
    return SalesData?.data?.results?.data.reduce(
      (acc: any, curr: any) => acc + curr.profit,
      0
    );
  }, [SalesData]);

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
              <Button
                className=" border-primary-green-300"
                onClick={openAttendantsModal}
              >
                Attendants
              </Button>
            )}

            <DatePickerWithRange date={dateRange} onDateChange={setDateRange} />
          </div>
        </div>
      </div>

      {SalesLoading || !SalesData ? (
        <div className="flex gap-4 w-1/2">
          {Array.from({ length: 4 }).map((_, index) => (
            <CustomCard key={index} className="w-full border-gray-200">
              <div className="flex flex-col gap-6 items-start">
                <Skeleton className="h-4 w-[100px] bg-[#eef4ef]" />
                <Skeleton className="h-6 w-[70px] bg-[#eef4ef]" />
              </div>
            </CustomCard>
          ))}
        </div>
      ) : (
        <div className="w-1/2 grid grid-cols-2 md:grid-cols-4 gap-4">
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
        <TabsList className="w-[400px]">
          <TabsTrigger value="products">Products Sold</TabsTrigger>
          <TabsTrigger value="history">Order History</TabsTrigger>
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
        isOpen={ShowAttendants} // FIXED: Removed the negation
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

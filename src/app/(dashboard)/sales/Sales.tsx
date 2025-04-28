"use client";

import { useEffect, useState } from "react";

import { CustomCard } from "@/components/app/CustomCard";
import { DatePickerWithRange } from "@/components/app/DateRangePicker";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSalesHook } from "@/hooks/useSalesHook";

import OrderHistory from "./OrderHistory";
import ProductsSold from "./ProductsSold";

interface SalesData {
  title: string;
  amount: number | string;
}

const CustomSalesCard = ({ title, amount }: SalesData) => {
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
  const {
    SalesData,
    SalesLoading,
    dateRange,
    setDateRange,
    SalesOrderData,
    SalesOrderLoading,
  } = useSalesHook();
  console.log("Slassss", SalesData);
  const [showViewSales, setShowViewSales] = useState<"products" | "history">(
    "products"
  );
  const [totalProfit, setTotalProfit] = useState<any>(null);

  // Sales data array

  useEffect(() => {
    if (SalesData) {
      const totalProfit = SalesData?.data?.results?.data.reduce(
        (acc: any, curr: any) => acc + curr.profit,
        0 // Initial value for acc is 0
      );
      console.log("Total Profit:", totalProfit);
      setTotalProfit(totalProfit);
    }
  }, [SalesData]);

  return (
    <div className="w-full h-full flex flex-col justify-start gap-5 items-start">
      <div className="flex items-center justify-between w-full">
        <div className="flex justify-between items-center w-full">
          <p className="text-2xl md:text-3xl text-primary-black-100 font-[500]">
            Sales
          </p>

          <DatePickerWithRange date={dateRange} onDateChange={setDateRange} />
        </div>
      </div>

      {/* Cards container */}

      {SalesLoading || !SalesData ? (
        <>
          <div className="flex gap-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <CustomCard key={index} className="w-full border-gray-200">
                <div className="flex flex-col gap-6 items-start">
                  <Skeleton className="h-4 w-[100px] bg-[#eef4ef]" />
                  <Skeleton className="h-6 w-[70px] bg-[#eef4ef]" />
                </div>
              </CustomCard>
            ))}
          </div>

          <div className="flex gap-3 mt-4 mb-3 w-full">
            {Array.from({ length: 2 }).map((_, index) => (
              <Skeleton
                key={index}
                className="h-14 w-[100px] rounded-md bg-[#eef4ef]"
              />
            ))}
          </div>

          {/* Skeleton for filters */}
          <div className="flex gap-3 mt-4 mb-3 w-full">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton
                key={index}
                className="h-14 w-[100px] rounded-md bg-[#eef4ef]"
              />
            ))}
          </div>

          {/* Skeleton for search */}
          <div className="w-1/2">
            <Skeleton className="h-10 w-full bg-[#eef4ef]" />
          </div>

          {/* Skeleton for AllCustomers table */}
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
        </>
      ) : (
        <>
          <div className="w-1/2 grid grid-cols-1 md:grid-cols-4 gap-4">
            <CustomSalesCard
              title={"Revenue"}
              amount={SalesData?.data?.results?.revenue}
            />

            <CustomSalesCard
              title={"Product Cost"}
              amount={SalesData?.data?.results?.cost}
            />

            <CustomSalesCard
              title={"Items Sold"}
              amount={SalesData?.data?.results?.orders}
            />
            <CustomSalesCard title={"Profit "} amount={totalProfit} />
          </div>
        </>
      )}

      {/* First filter */}
      <Tabs
        value={showViewSales}
        onValueChange={(value) =>
          setShowViewSales(value as "products" | "history")
        }
        className="w-full mt-6"
      >
        <TabsList className="w-[400px]">
          <TabsTrigger value="products">Products Sold</TabsTrigger>
          <TabsTrigger value="history">Order History</TabsTrigger>
        </TabsList>
        <div className="w-full h-[1px] bg-gray-200 mt-[-8px]" />

        {/* Content conditional rendering */}
        <TabsContent value="products">
          <ProductsSold SalesData={SalesData} SalesLoading={SalesLoading} />
        </TabsContent>
        <TabsContent value="history">
          <OrderHistory
            SalesOrderData={SalesOrderData}
            loading={SalesOrderLoading}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Sales;

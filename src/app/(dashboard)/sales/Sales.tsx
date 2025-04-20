"use client";

import React, { useState } from "react";
import { CustomCard } from "@/components/app/CustomCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import ProductsSold from "./ProductsSold";
import OrderHistory from "./OrderHistory";

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
  const [showViewSales, setShowViewSales] = useState<"products" | "history">(
    "products"
  );

  // Sales data array
  const salesData: SalesData[] = [
    { title: "Revenue", amount: "N12,345" },
    { title: "Items Sold", amount: "1,234" },
    { title: "Profit", amount: "N8,642" },
  ];

  return (
    <div className="w-full h-full flex flex-col justify-start gap-5 items-start">
      <div className="flex items-center justify-between w-full">
        <div className="flex justify-between items-center w-full">
          <p className="text-2xl md:text-3xl text-primary-black-100 font-[500]">
            Sales
          </p>
        </div>
      </div>

      {/* Cards container */}
      <div className="w-1/2 grid grid-cols-1 md:grid-cols-3 gap-4">
        {salesData.map((data, index) => (
          <CustomSalesCard
            key={index}
            title={data.title}
            amount={data.amount}
          />
        ))}
      </div>

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
          <ProductsSold />
        </TabsContent>
        <TabsContent value="history">
          <OrderHistory />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Sales;

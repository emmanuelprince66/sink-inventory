"use client";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import useShippingHook from "@/hooks/useShippingHook";
import { Truck } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import ShippingTable from "./shippingTable";
const Shipping = () => {
  const [currentView, setCurrentView] = useState("main");

  const { ShippingData, allShippingDataLoading } = useShippingHook({});
  const [page, setPage] = useState(1);

  console.log("ShippingData", ShippingData);

  // Sample data for the table

  return (
    <div className="container mx-auto p-6">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Shipping Method</h1>
          <div className="flex gap-3">
            {/* <Button
            variant="outline"
            className="flex items-center gap-2 border-gray-200 border bg-transparent"
          >
            <Settings className="h-4 w-4" />
            Settings
          </Button>
          <Button
            onClick={() => setCurrentView("free-shipping")}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Create Free Shipping
          </Button> */}

            <Link href="/shipping/create">
              <Button
                variant="outline"
                className="flex items-center gap-2 border-gray-200 border"
              >
                <Truck className="h-4 w-4" />
                Create Shipping Method
              </Button>
            </Link>
          </div>
        </div>

        {/* shipping table  */}

        {allShippingDataLoading || !ShippingData ? (
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
          <ShippingTable
            response={ShippingData}
            page={page}
            loading={false}
            setPage={setPage}
          />
        )}
      </div>
      {/* {currentView === "free-shipping" && (
        <CreateFreeShipping onBack={() => setCurrentView("main")} />
      )}
      {currentView === "shipping-method" && (
        <CreateShippingMethod onBack={() => setCurrentView("main")} />
      )} */}
    </div>
  );
};

export default Shipping;

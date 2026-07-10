"use client";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import useShippingHook from "@/hooks/useShippingHook";
import { Truck } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import ShippingTable from "./shippingTable";
const Shipping = () => {
  const { ShippingData, allShippingDataLoading } = useShippingHook({});
  const [page, setPage] = useState(1);

  return (
    <div className="w-full h-full flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl md:text-3xl font-extrabold text-grey-1">
          Shipping Method
        </h1>
        <Link href="/shipping/create">
          <Button className="flex items-center gap-2">
            <Truck className="h-4 w-4" />
            Create Shipping Method
          </Button>
        </Link>
      </div>

      {/* shipping table  */}
      {allShippingDataLoading || !ShippingData ? (
        <div className="w-full">
          <div className="space-y-4">
            <Skeleton className="h-10 w-full bg-grey-5" />
            {Array.from({ length: 5 }).map((_, index) => (
              <Skeleton key={index} className="h-16 w-full bg-grey-5 mt-2" />
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
  );
};

export default Shipping;

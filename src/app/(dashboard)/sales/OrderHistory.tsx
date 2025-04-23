import { SearchInput } from "@/components/app/SearchInput";
import { Button } from "@/components/ui/button";
import React, { useState } from "react";
import NoOrders from "./NoOrders";

const OrderHistory = () => {
  // Second filter options
  const filterOptions = ["All", "Completed", "Pending", "Cancelled"];
  const [activeFilter, setActiveFilter] = useState(filterOptions[0]);

  const [orders, setOrders] = useState([]);
  return (
    <>
      {/* Second filter */}
      <div className="flex flex-col items-start gap-3 mt-4  h-full w-full">
        <div className="flex gap-3 items-center">
          {filterOptions.map((option) => (
            <Button
              key={option}
              className={`px-4 py-2 rounded-md h-14 min-w-[70px] text-sm hover:text-white font-medium transition-colors ${
                activeFilter === option
                  ? "bg-primary-green-300 text-white"
                  : "bg-primary-green-200 text-primary-black-100"
              }`}
              onClick={() => setActiveFilter(option)}
            >
              {option}
            </Button>
          ))}
        </div>

        {/* Second filter end */}
        {/* search input */}
        <SearchInput
          placeholder="Search.... "
          className=""
          onValueChange={(value: string) => {
            console.log(value);
          }}
          value=""
        />
        {/* search input ends */}

        <NoOrders />
      </div>
    </>
  );
};

export default OrderHistory;

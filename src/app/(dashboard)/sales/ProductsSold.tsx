import { SearchInput } from "@/components/app/SearchInput";
import { Button } from "@/components/ui/button";
import React, { useState } from "react";

const ProductsSold = () => {
  // Second filter options
  const filterOptions = [
    "All",
    "Fast Moving",
    "Most Profitable",
    "Top Selling",
  ];
  const [activeFilter, setActiveFilter] = useState(filterOptions[0]);
  return (
    <>
      {/* Second filter */}
      <div className="flex gap-3 mt-4 mb-3">
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
        value=""
        onValueChange={() => {}}
      />
      {/* search input ends */}
    </>
  );
};

export default ProductsSold;

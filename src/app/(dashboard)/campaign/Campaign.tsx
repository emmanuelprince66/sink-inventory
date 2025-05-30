"use client";

import { CustomCard } from "@/components/app/CustomCard";
import { SearchInput } from "@/components/app/SearchInput";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { PieChart } from "lucide-react";
import { useState } from "react";

const Campaign = () => {
  const [searchInput, setSearchInput] = useState("");

  return (
    <div className="w-full h-full flex flex-col justify-start gap-5 items-start">
      <div className="flex items-center justify-between w-full">
        <div className="flex justify-between items-center w-full">
          <p className="text-2xl md:text-3xl text-primary-black-100 font-[500]">
            Campaign
          </p>

          <div className="flex items-center gap-2">
            <Button
              className=" border-primary-green-300"
              // onClick={openAddExpensesModal}
            >
              Add Campaign
            </Button>
          </div>
        </div>
      </div>

      {false ? (
        <div className="flex gap-4 w-[500px] mt-5">
          {Array.from({ length: 1 }).map((_, index) => (
            <CustomCard key={index} className="w-full border-gray-200">
              <div className="flex flex-col gap-6 items-start">
                <Skeleton className="h-4 w-full bg-[#eef4ef]" />
                <Skeleton className="h-6 w-[300px] bg-[#eef4ef]" />
                <Skeleton className="h-6 w-[100px] bg-[#eef4ef]" />
              </div>
            </CustomCard>
          ))}
        </div>
      ) : (
        <CustomCard className="w-[500px] h-[150px] mt-5 flex flex-col gap-4 justify-between p-4 bg-primary-green-200 border border-primary-green-300 rounded-lg shadow-sm">
          {/* Top Section - Full width */}
          <div className="flex justify-between items-center w-full">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white rounded-full">
                <PieChart className="w-5 h-5 text-primary-green-300" />
              </div>
              <span className="text-sm font-medium text-gray-600">
                Message Credit
              </span>
            </div>

            <button className="flex items-center gap-1 group cursor-pointer">
              <span className="text-sm bg-white rounded-full p-2 font-medium text-primary-green-300 group-hover:text-primary-green-700 transition-colors">
                Active
              </span>
            </button>
          </div>

          {/* Bottom Section - Full width */}
          <div className="w-full flex justify-even items-center">
            <div className="flex flex-col w-full gap-1 mt-4">
              <span className="text-sm  text-gray-900">Available</span>
              <span className="text-1xl font-bold text-gray-900">
                500 Credits
              </span>
            </div>
            <div className="flex flex-col w-full gap-1 mt-4">
              <span className="text-sm  text-gray-900">Used</span>
              <span className="text-1xl font-bold text-gray-900">
                300 Credits
              </span>
            </div>
            <div className="flex flex-col w-full gap-1 mt-4">
              <Button>Get Credits</Button>
            </div>
          </div>
        </CustomCard>
      )}

      {/* search */}

      <div className="w-full md:w-1/2 mb-4 mt-4">
        <SearchInput
          placeholder="Search campaigns ..."
          value={searchInput}
          onValueChange={() => {}}
        />
        {searchInput.length > 0 && searchInput.length < 3 && (
          <div className="mt-1 text-sm text-muted-foreground">
            Type at least 3 characters to search
          </div>
        )}
      </div>
    </div>
  );
};

export default Campaign;

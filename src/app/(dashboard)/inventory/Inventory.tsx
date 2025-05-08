"use client";

import { CustomCard } from "@/components/app/CustomCard";
import { SearchInput } from "@/components/app/SearchInput";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useInventoryHook } from "@/hooks/useInventoryHook";
import Link from "next/link";

import { CustomModal } from "@/components/app/CustomModal";
import { cn } from "@/lib/utils"; // Assuming you're using the cn utility
import { useState } from "react";
import AddService from "./AddService";
import AllInventory from "./AllInventory";
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

interface CustomInventoryCardProps {
  title: string;
  amount: number | string;
  type: "value" | "profit" | "other"; // More specific type definition
  className?: string;
}

const CustomInventoryCard = ({
  title,
  amount,
  type,
  className,
}: CustomInventoryCardProps) => {
  // Define color variants
  const variants = {
    value: {
      bg: "bg-primary-green-200 border border-gray-100",
      text: "text-primary-black-100",
      border: "border-primary-100",
    },
    profit: {
      bg: "bg-[#1e1e1e]",
      text: "text-white",
      border: "border-[#1e1e1e]",
    },
    other: {
      bg: "bg-green-500",
      text: "text-white",
      border: "border-green-500",
    },
  };

  // Get the appropriate variant based on type
  const variant = variants[type] || variants.other;

  return (
    <CustomCard
      className={cn(
        variant.bg,
        variant.text,
        variant.border,
        "w-full",
        className
      )}
    >
      <div className="flex flex-col gap-6 items-start">
        <p className="font-[500] text-sm">{title}</p>
        <p className="font-[600] text-xl">{amount}</p>
      </div>
    </CustomCard>
  );
};

const Inventory = () => {
  const [searchInput, setSearchInput] = useState("");
  const [addServiceModal, setAddServiceModal] = useState(false);
  const closeAddServiceModal = () => setAddServiceModal(false);
  const openddServiceModal = () => setAddServiceModal(true);

  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
    null
  );

  const {
    InventoryData,
    CategoriesData,
    InventoryDataLoading,
    CategoriesDataLoading,
  } = useInventoryHook({
    searchInput,
    selectedCategoryId,
    closeAddServiceModal,
  });

  const handleSearchChange = (value: string) => {
    setSearchInput(value);
  };

  const handleCategoryClick = (categoryId: string) => {
    setSelectedCategoryId(categoryId);
    // You might want to do something else with the ID here
  };

  const handleAllClick = () => {
    setSelectedCategoryId(null);
    // Reset any other filter logic here
  };

  console.log("InventoryData", InventoryData);
  console.log("CategoriesData", CategoriesData);
  return (
    <div className="w-full h-full flex flex-col justify-start gap-5 items-start">
      <div className="flex items-center justify-between w-full">
        <div className="flex justify-between items-center w-full">
          <p className="text-2xl md:text-3xl text-primary-black-100 font-[500]">
            Inventory
          </p>

          <div className="gap-1 flex items-center">
            <Button onClick={openddServiceModal}>Add Service</Button>

            <Link href={"/product/add-product"}>
              <Button>Add Product</Button>
            </Link>
          </div>
        </div>
      </div>

      <p className="text-primary-black-100">Overview</p>

      {InventoryDataLoading || !InventoryData ? (
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
          <CustomInventoryCard
            title={"Inventory Value"}
            amount={InventoryData?.data?.results?.inventory_value}
            type="value"
          />
          <CustomInventoryCard
            title={"Profit"}
            amount={InventoryData?.data?.results?.profit}
            type="profit"
          />
          <CustomInventoryCard
            title={"Selling"}
            amount={InventoryData?.data?.results?.selling_price}
            type="other"
          />
        </div>
      )}
      <div className="w-[100%] items-center flex justify-between my-2">
        <p className="text-primary-black-100 mr-2">Categories</p>

        {/* "View More" Button - Subtle outline style */}

        <Link href={"/categories"}>
          <div className="flex gap-2 items-center">
            <Button className="px-3 py-1 rounded-md text-xs border border-gray-300 hover:text-primary-black-100 hover:bg-gray-50 text-primary-green-600">
              View More
            </Button>
          </div>
        </Link>
      </div>

      {CategoriesDataLoading || !CategoriesData ? (
        <div className="flex gap-4 w-1/2">
          {Array.from({ length: 8 }).map((_, index) => (
            <CustomCard key={index} className="w-full border-gray-200">
              <div className="flex flex-col gap-6 items-start">
                <Skeleton className="h-4 w-[100px] bg-[#eef4ef]" />
                <Skeleton className="h-6 w-[70px] bg-[#eef4ef]" />
              </div>
            </CustomCard>
          ))}
        </div>
      ) : (
        <div className="flex gap-3 mb-4 flex-wrap">
          {/* All button */}
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

          {/* Category buttons */}
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

      {/* seachh */}

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

      {/* all inventort */}

      {InventoryDataLoading || !InventoryData ? (
        <div className="w-full">
          <div className="space-y-4">
            <Skeleton className="h-10 w-full bg-[#eef4ef]" />
            {Array.from({ length: 5 }).map((_, index) => (
              <Skeleton key={index} className="h-16 w-full bg-[#eef4ef] mt-2" />
            ))}
          </div>
        </div>
      ) : (
        <AllInventory data={InventoryData} loading={InventoryDataLoading} />
      )}

      <CustomModal
        isOpen={addServiceModal} // FIXED: Removed the negation
        onClose={closeAddServiceModal}
        trigger={false}
        title="Add New Service"
      >
        <AddService />
      </CustomModal>
    </div>
  );
};

export default Inventory;

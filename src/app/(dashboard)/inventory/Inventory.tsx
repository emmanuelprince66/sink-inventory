"use client";

import { CustomCard } from "@/components/app/CustomCard";
import { CustomModal } from "@/components/app/CustomModal";
import { SearchInput } from "@/components/app/SearchInput";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useInventoryHook } from "@/hooks/useInventoryHook";
import { cn } from "@/lib/utils";
import { formatToNaira } from "@/utils/formatMoney";
import { DollarSign, Tag, TrendingUp } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import AddService from "./AddService";
import InventoryTable from "./InventoryTable";
import NoInventory from "./NoInventory";

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
  type: "value" | "profit" | "other";
  className?: string;
}

const CustomInventoryCard = ({
  title,
  amount,
  type,
  className,
}: CustomInventoryCardProps) => {
  const variants = {
    value: {
      bg: "bg-gradient-to-br from-indigo-50 to-indigo-100",
      border: "border-indigo-200",
      iconBg: "bg-indigo-100",
      icon: <TrendingUp className="w-5 h-5 text-indigo-600" />,
      text: "text-indigo-800",
      amountText: "text-indigo-600",
    },
    profit: {
      bg: "bg-gradient-to-br from-emerald-50 to-emerald-100",
      border: "border-emerald-200",
      iconBg: "bg-emerald-100",
      icon: <DollarSign className="w-5 h-5 text-emerald-600" />,
      text: "text-emerald-800",
      amountText: "text-emerald-600",
    },
    other: {
      bg: "bg-gradient-to-br from-amber-50 to-amber-100",
      border: "border-amber-200",
      iconBg: "bg-amber-100",
      icon: <Tag className="w-5 h-5 text-amber-600" />,
      text: "text-amber-800",
      amountText: "text-amber-600",
    },
  };

  const variant = variants[type] || variants.other;

  return (
    <CustomCard
      className={cn(
        variant.bg,
        variant.border,
        "p-4 rounded-lg border transition-all hover:shadow-md",
        className
      )}
    >
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className={cn("p-2 rounded-full", variant.iconBg)}>
            {variant.icon}
          </div>
          <span className={cn("text-sm font-medium", variant.text)}>
            {title}
          </span>
        </div>
      </div>
      <div className="mt-4">
        <span className={cn("text-2xl font-bold", variant.amountText)}>
          {amount}
        </span>
      </div>
    </CustomCard>
  );
};
const Inventory = () => {
  const [addServiceModal, setAddServiceModal] = useState(false);
  const closeAddServiceModal = () => setAddServiceModal(false);
  const openddServiceModal = () => setAddServiceModal(true);

  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
    null
  );
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");

  const handleSearchChange = (value: string) => {
    setSearchInput(value);
  };

  const {
    InventoryData,
    CategoriesData,
    InventoryDataLoading,
    CategoriesDataLoading,
  } = useInventoryHook({
    selectedCategoryId,
    searchInput,
    page,
  });
  console.log("InventoryData", InventoryData);

  const handleCategoryClick = (categoryId: string) => {
    setSelectedCategoryId(categoryId);
  };

  const handleAllClick = () => {
    setSelectedCategoryId(null);
  };

  // Handlers for new buttons

  return (
    <div className="w-full h-full flex flex-col justify-start gap-5 items-start">
      <div className="flex items-center justify-between w-full">
        <div className="flex justify-between items-center w-full">
          <p className="text-2xl md:text-3xl text-primary-black-100 font-[500]">
            Inventory
          </p>

          <div className="gap-2 flex items-center flex-wrap">
            {/* Primary Buttons */}
            <Button onClick={openddServiceModal}>Add Service</Button>
            <Link href={"/product/add-product"}>
              <Button>Add Product</Button>
            </Link>

            {/* Secondary Buttons */}

            <Link href={"/product/upload-product"}>
              <Button
                variant="outline"
                className="border-primary-green-300 text-primary-green-300 hover:bg-primary-green-50"
              >
                <span className="hidden md:inline">Upload</span> CSV
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <p className="text-primary-black-100">Overview</p>

      {InventoryDataLoading || !InventoryData ? (
        <div className="flex gap-4 w-[80%]">
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
        <div className="w-[80%] grid grid-cols-2 md:grid-cols-4 gap-4">
          <CustomInventoryCard
            title={"Inventory Value"}
            amount={formatToNaira(
              InventoryData?.data?.results?.inventory_value
            )}
            type="value"
          />
          <CustomInventoryCard
            title={"Profit"}
            amount={formatToNaira(InventoryData?.data?.results?.profit)}
            type="profit"
          />
          <CustomInventoryCard
            title={"Selling"}
            amount={formatToNaira(InventoryData?.data?.results?.selling_price)}
            type="other"
          />
        </div>
      )}

      <div className="w-[100%] items-center flex justify-between my-2">
        <p className="text-primary-black-100 mr-2">Categories</p>
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

      <div className="w-full mt-3">
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
        {InventoryDataLoading || !InventoryData ? (
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
          <>
            {InventoryData?.data?.results?.data?.length > 0 ? (
              <InventoryTable
                setPage={setPage}
                page={page}
                response={InventoryData}
                loading={false}
              />
            ) : (
              <div className="w-full h-full flex flex-col justify-center items-center mt-8">
                <NoInventory />
              </div>
            )}
          </>
        )}
      </div>

      {/* <AllInventory
        setPage={setPage}
        page={page}
        loading={InventoryDataLoading}
      /> */}

      {/*  */}

      <CustomModal
        isOpen={addServiceModal}
        onClose={closeAddServiceModal}
        trigger={false}
        title="Add New Service"
      >
        <AddService closeModal={closeAddServiceModal} />
      </CustomModal>
    </div>
  );
};

export default Inventory;

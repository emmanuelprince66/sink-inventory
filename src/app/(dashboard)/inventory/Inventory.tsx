"use client";

import { CustomCard } from "@/components/app/CustomCard";
import { CustomModal } from "@/components/app/CustomModal";
import { SearchInput } from "@/components/app/SearchInput";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useInventoryHook } from "@/hooks/useInventoryHook";
import { cn } from "@/lib/utils";
import { formatToNaira } from "@/utils/formatMoney";
import {
  ChevronLeft,
  ChevronRight,
  Cloud,
  DollarSign,
  Tag,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
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
      text: "text-primary-black-100",
      amountText: "text-primary-black-100",
    },
    profit: {
      bg: "bg-gradient-to-br from-emerald-50 to-emerald-100",
      border: "border-emerald-200",
      iconBg: "bg-emerald-100",
      icon: <DollarSign className="w-5 h-5 text-emerald-600" />,
      text: "text-primary-black-100",
      amountText: "text-primary-black-100",
    },
    other: {
      bg: "bg-gradient-to-br from-amber-50 to-amber-100",
      border: "border-amber-200",
      iconBg: "bg-amber-100",
      icon: <Tag className="w-5 h-5 text-amber-600" />,
      text: "text-primary-black-100",
      amountText: "text-primary-black-100",
    },
  };

  const variant = variants[type] || variants.other;

  return (
    <CustomCard
      className={cn(
        variant.bg,
        variant.border,
        "p-4 w-full rounded-lg border transition-all hover:shadow-md",
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
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const categoriesContainerRef = useRef<HTMLDivElement>(null);

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

  const handleCategoryClick = (categoryId: string) => {
    setSelectedCategoryId(categoryId);
  };

  const handleAllClick = () => {
    setSelectedCategoryId(null);
  };

  const totalItems = InventoryData?.data?.total || 0;

  // Check scroll availability
  const checkScrollAvailability = () => {
    const container = categoriesContainerRef.current;
    if (container) {
      setCanScrollLeft(container.scrollLeft > 0);
      setCanScrollRight(
        container.scrollLeft < container.scrollWidth - container.clientWidth
      );
    }
  };

  // Category navigation functions
  const scrollCategories = (direction: "left" | "right") => {
    const container = categoriesContainerRef.current;
    if (container) {
      const scrollAmount = 200;
      const currentScroll = container.scrollLeft;
      const newScroll =
        direction === "left"
          ? currentScroll - scrollAmount
          : currentScroll + scrollAmount;

      container.scrollTo({
        left: newScroll,
        behavior: "smooth",
      });
    }
  };

  // Check scroll availability when categories load or container size changes
  useEffect(() => {
    checkScrollAvailability();
    const container = categoriesContainerRef.current;
    if (container) {
      container.addEventListener("scroll", checkScrollAvailability);
      return () =>
        container.removeEventListener("scroll", checkScrollAvailability);
    }
  }, [CategoriesData]);

  // Check on window resize
  useEffect(() => {
    const handleResize = () => checkScrollAvailability();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="w-full h-full flex flex-col justify-start gap-6 items-start ">
      {/* Header Section */}
      <div className="w-full bg-white">
        <div className="flex items-center justify-between w-full mb-6">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl md:text-3xl text-primary-black-100 font-[600]">
              Inventory
            </h1>
          </div>

          <div className="gap-3 flex items-center flex-wrap">
            {/* Primary Buttons */}
            <Button
              onClick={openddServiceModal}
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2"
            >
              + Add Service
            </Button>
            <Link href={"/product/add-product"}>
              <Button className="bg-green-500 hover:bg-green-600 text-white px-4 py-2">
                + Add Product
              </Button>
            </Link>

            {/* Secondary Buttons */}
            <Link href={"/product/upload-product"}>
              <Button
                variant="outline"
                className="border-gray-300 text-gray-700 hover:bg-gray-50 px-4 py-2"
              >
                <Cloud className="w-4 h-4 mr-2" />
                Upload Product
              </Button>
            </Link>
          </div>
        </div>

        {/* Overview Cards */}
        <div className="mb-6">
          <h2 className="text-lg font-medium text-primary-black-100 mb-4">
            Overview
          </h2>

          {InventoryDataLoading || !InventoryData ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {Array.from({ length: 3 }).map((_, index) => (
                <CustomCard key={index} className="w-full border-gray-200">
                  <div className="flex flex-col gap-6 items-start">
                    <Skeleton className="h-4 w-[100px] bg-[#eef4ef]" />
                    <Skeleton className="h-6 w-[70px] bg-[#eef4ef]" />
                  </div>
                </CustomCard>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                title={"Selling Price"}
                amount={formatToNaira(
                  InventoryData?.data?.results?.selling_price
                )}
                type="other"
              />
            </div>
          )}
        </div>
      </div>

      {/* Main Content Section */}
      <div className="w-full rounded-lg shadow-sm border border-gray-200 bg-white">
        {/* Categories and Search Header */}
        <div className="p-6 border-b bg-white rounded-t-lg w-full">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-primary-black-100">
              Manage Inventory
              <span className="ml-2 text-[10px] bg-green-100 px-2 py-1 rounded-full  text-green-500 font-medium text-lg">
                {totalItems.toLocaleString()}
              </span>
            </h2>

            <div className="flex items-center gap-4">
              <div className="w-80">
                <SearchInput
                  placeholder="Search Item, EAN..."
                  value={searchInput}
                  onValueChange={handleSearchChange}
                />
              </div>

              <Link href={"/categories"}>
                <Button
                  variant="outline"
                  className="text-green-500 border-green-200 hover:bg-green-50"
                >
                  View More
                </Button>
              </Link>
            </div>
          </div>

          {/* Categories Tabs */}
          {CategoriesDataLoading || !CategoriesData ? (
            <div className="flex gap-2">
              {Array.from({ length: 6 }).map((_, index) => (
                <Skeleton
                  key={index}
                  className="h-10 w-20 bg-gray-200 rounded-md flex-shrink-0"
                />
              ))}
            </div>
          ) : (
            <div className="w-full">
              <div className="flex items-center w-full">
                {/* Left Navigation Button */}
                <button
                  onClick={() => scrollCategories("left")}
                  disabled={!canScrollLeft}
                  className={cn(
                    "p-2 rounded-md transition-all mr-2 flex-shrink-0",
                    canScrollLeft
                      ? "text-gray-600 hover:text-green-500 hover:bg-green-50"
                      : "text-gray-300 cursor-not-allowed"
                  )}
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>

                {/* Categories Container */}
                <div
                  ref={categoriesContainerRef}
                  className="flex gap-2 overflow-x-auto flex-1 scrollbar-hide"
                  style={{
                    scrollbarWidth: "none",
                    msOverflowStyle: "none",
                  }}
                >
                  {/* All Tab */}
                  <button
                    className={cn(
                      "px-4 py-2 text-sm font-medium cursor-pointer rounded-md transition-all whitespace-nowrap flex-shrink-0",
                      selectedCategoryId === null
                        ? "bg-green-500 text-white shadow-sm"
                        : "text-gray-600 hover:text-green-500 hover:bg-green-50"
                    )}
                    onClick={handleAllClick}
                  >
                    All
                  </button>

                  {/* Category Tabs */}
                  {CategoriesData.data.map((category: Category) => (
                    <button
                      key={category.id}
                      className={cn(
                        "px-4 py-2 text-sm cursor-pointer font-medium rounded-md transition-all whitespace-nowrap flex-shrink-0",
                        selectedCategoryId === category.id
                          ? "bg-green-500 text-white shadow-sm"
                          : "text-gray-600 hover:text-green-500 hover:bg-green-50"
                      )}
                      onClick={() => handleCategoryClick(category.id)}
                    >
                      {category.name}
                    </button>
                  ))}
                </div>

                {/* Right Navigation Button */}
                <button
                  onClick={() => scrollCategories("right")}
                  disabled={!canScrollRight}
                  className={cn(
                    "p-2 rounded-md transition-all ml-2 flex-shrink-0",
                    canScrollRight
                      ? "text-gray-600 hover:text-green-500 hover:bg-green-50"
                      : "text-gray-300 cursor-not-allowed"
                  )}
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}

          {searchInput.length > 0 && searchInput.length < 3 && (
            <div className="mt-2 text-sm text-gray-500">
              Type at least 3 characters to search
            </div>
          )}
        </div>

        {/* Table Content */}
        <div className="p-6">
          {InventoryDataLoading || !InventoryData ? (
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
            <>
              {InventoryData?.data?.results?.data?.length > 0 ? (
                <InventoryTable
                  setPage={setPage}
                  page={page}
                  response={InventoryData}
                  loading={false}
                />
              ) : (
                <div className="w-full h-64 flex flex-col justify-center items-center">
                  <NoInventory />
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Add Service Modal */}
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

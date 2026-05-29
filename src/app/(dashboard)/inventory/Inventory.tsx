"use client";

import { CustomCard } from "@/components/app/CustomCard";
import { CustomModal } from "@/components/app/CustomModal";
import GenerateReportButton from "@/components/app/GenerateReportButton";
import { SearchInput } from "@/components/app/SearchInput";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { ProductFilters, useInventoryHook } from "@/hooks/useInventoryHook";
import { cn } from "@/lib/utils";
import { formatToNaira } from "@/utils/formatMoney";

import { useUserRole } from "@/lib/store/user-store";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Cloud,
  DollarSign,
  Filter,
  Layers,
  MoreHorizontal,
  Package,
  Plus,
  Tag,
  TrendingUp,
  Wrench,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import AddService from "./AddService";
import { DownloadInventoryButton } from "./DownloadInventoryReportsButton";
import ComboTable from "./ComboTable";
import InventoryTable from "./InventoryTable";
import NoInventory from "./NoInventory";
import ServiceTable from "./ServiceTable";

interface Category {
  id: string;
  name: string;
  type: string;
}

interface Department {
  id: string;
  name: string;
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
        className,
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

const DEFAULT_FILTERS: ProductFilters = {
  allowTax: false,
  sellOnline: false,
  inHouse: false,
  rawMaterial: false,
  watchlist: false,
};

const Inventory = () => {
  const [addServiceModal, setAddServiceModal] = useState(false);
  const closeAddServiceModal = () => setAddServiceModal(false);
  const openddServiceModal = () => setAddServiceModal(true);
  const { role, can } = useUserRole();
  const allowedRoles = ["OWNER", "ADMIN-ATTENDANT", "INVENTORY-MANAGER"];
  const canManageInventory = role ? allowedRoles.includes(role) : false;
  console.log("can", can("damage_items"));
  console.log("can-1", can("transfer_items"));
  console.log("role", role);

  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
    null,
  );
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<
    string | null
  >(null);
  const [activeTab, setActiveTab] = useState<"PRODUCT" | "SERVICE" | "COMBO">(
    "PRODUCT",
  );
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const categoriesContainerRef = useRef<HTMLDivElement>(null);

  const [productFilters, setProductFilters] =
    useState<ProductFilters>(DEFAULT_FILTERS);

  const getActiveFiltersCount = () =>
    Object.values(productFilters).filter(Boolean).length;

  const handleSearchChange = (value: string) => {
    setSearchInput(value);
  };

  const {
    InventoryData,
    CategoriesData,
    DepartmentData,
    DepartmentDataLoading,
    business_id,
    InventoryDataLoading,
    CategoriesDataLoading,
  } = useInventoryHook({
    selectedCategoryId,
    selectedType:
      activeTab === "PRODUCT"
        ? "PRODUCT"
        : activeTab === "COMBO"
          ? "COMBO"
          : "SERVICE",
    searchInput,
    selectedDepartmentId,
    page,
    productFilters: activeTab === "PRODUCT" ? productFilters : undefined,
  });

  const handleCategoryClick = (categoryId: string) =>
    setSelectedCategoryId(categoryId);
  const handleAllClick = () => setSelectedCategoryId(null);
  const handleDepartmentClick = (departmentId: string) =>
    setSelectedDepartmentId(departmentId);
  const handleAllDepartmentsClick = () => setSelectedDepartmentId(null);

  const handleTabChange = (tab: "PRODUCT" | "SERVICE" | "COMBO") => {
    setActiveTab(tab);
    setSelectedCategoryId(null);
    setPage(1);
  };

  const totalItems = InventoryData?.data?.total || 0;

  const checkScrollAvailability = () => {
    const container = categoriesContainerRef.current;
    if (container) {
      setCanScrollLeft(container.scrollLeft > 0);
      setCanScrollRight(
        container.scrollLeft < container.scrollWidth - container.clientWidth,
      );
    }
  };

  const scrollCategories = (direction: "left" | "right") => {
    const container = categoriesContainerRef.current;
    if (container) {
      const scrollAmount = 200;
      container.scrollTo({
        left:
          container.scrollLeft +
          (direction === "left" ? -scrollAmount : scrollAmount),
        behavior: "smooth",
      });
    }
  };

  useEffect(() => {
    checkScrollAvailability();
    const container = categoriesContainerRef.current;
    if (container) {
      container.addEventListener("scroll", checkScrollAvailability);
      return () =>
        container.removeEventListener("scroll", checkScrollAvailability);
    }
  }, [CategoriesData]);

  useEffect(() => {
    const handleResize = () => checkScrollAvailability();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="w-full h-full flex flex-col justify-start gap-6 items-start">
      {/* Header Section */}
      <div className="w-full bg-white px-2 sm:px-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between w-full mb-4 sm:mb-6 gap-3 sm:gap-0">
          <p className="text-2xl md:text-3xl text-primary-black-100 font-[500]">
            Inventory
          </p>

          {canManageInventory && (
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <GenerateReportButton
                reportType="inventory"
                className="w-full sm:w-auto"
              />
              {/* Add New dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button className="flex-1 sm:flex-none bg-green-500 hover:bg-green-600 text-white px-4 py-2 text-sm font-medium gap-1.5">
                    <Plus className="w-4 h-4" />
                    Add New
                    <ChevronDown className="w-4 h-4 ml-0.5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="bg-white border border-gray-200 shadow-lg min-w-[200px]"
                >
                  <DropdownMenuItem
                    asChild
                    className="cursor-pointer px-4 py-2.5 hover:bg-green-50 hover:text-green-600 transition-colors"
                  >
                    <Link href={"/new-add-product"}>
                      <Package className="w-4 h-4 mr-2" />
                      New Product
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={openddServiceModal}
                    className="cursor-pointer px-4 py-2.5 hover:bg-green-50 hover:text-green-600 transition-colors"
                  >
                    <Wrench className="w-4 h-4 mr-2" />
                    New Service
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    asChild
                    className="cursor-pointer px-4 py-2.5 hover:bg-green-50 hover:text-green-600 transition-colors"
                  >
                    <Link href={"/inventory/combo"}>
                      <Layers className="w-4 h-4 mr-2" />
                      New Combo
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* More actions dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="border-gray-200 text-gray-700 hover:bg-gray-50 px-3 py-2 text-sm font-medium gap-1.5"
                  >
                    <MoreHorizontal className="w-4 h-4" />
                    <span className="hidden sm:inline">More</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="bg-white border border-gray-200 shadow-lg min-w-[200px] p-0"
                >
                  <div className="px-2 py-1.5">
                    <DownloadInventoryButton business_id={business_id} />
                  </div>
                  <DropdownMenuItem
                    asChild
                    className="cursor-pointer px-4 py-2.5 hover:bg-gray-50 transition-colors"
                  >
                    <Link href={"/product/upload-product"}>
                      <Cloud className="w-4 h-4 mr-2" />
                      Bulk Upload
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>

        {/* Overview Cards */}
        <div className="mb-4 sm:mb-6">
          <h2 className="text-base sm:text-lg font-medium text-primary-black-100 mb-3 sm:mb-4">
            Overview
          </h2>

          {InventoryDataLoading || !InventoryData ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
              {Array.from({ length: 3 }).map((_, index) => (
                <CustomCard key={index} className="w-full border-gray-200">
                  <div className="flex flex-col gap-4 sm:gap-6 items-start">
                    <Skeleton className="h-4 w-[80px] sm:w-[100px] bg-[#eef4ef]" />
                    <Skeleton className="h-5 sm:h-6 w-[60px] sm:w-[70px] bg-[#eef4ef]" />
                  </div>
                </CustomCard>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
              <CustomInventoryCard
                title={"Inventory Value"}
                amount={formatToNaira(
                  InventoryData?.data?.results?.inventory_value,
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
                  InventoryData?.data?.results?.selling_price,
                )}
                type="other"
              />
            </div>
          )}
        </div>
      </div>

      {/* Main Content Section */}
      <div className="w-full rounded-lg shadow-sm border border-gray-200 bg-white">
        {/* Tabs Header */}
        <div className="border-b border-gray-200">
          <div className="flex">
            <button
              onClick={() => handleTabChange("PRODUCT")}
              className={cn(
                "px-6 py-4 text-sm cursor-pointer font-medium border-b-2 transition-all",
                activeTab === "PRODUCT"
                  ? "border-green-500 text-green-600 bg-green-50"
                  : "border-transparent text-gray-600 hover:text-green-600 hover:border-green-300",
              )}
            >
              Products
              {activeTab === "PRODUCT" && (
                <span className="ml-2 text-[10px] bg-green-100 px-2 py-1 rounded-full text-green-500 font-medium">
                  {totalItems.toLocaleString()}
                </span>
              )}
            </button>
            <button
              onClick={() => handleTabChange("SERVICE")}
              className={cn(
                "px-6 py-4 text-sm font-medium cursor-pointer border-b-2 transition-all",
                activeTab === "SERVICE"
                  ? "border-green-500 text-green-600 bg-green-50"
                  : "border-transparent text-gray-600 hover:text-green-600 hover:border-green-300",
              )}
            >
              Services
              {activeTab === "SERVICE" && (
                <span className="ml-2 text-[10px] bg-green-100 px-2 py-1 rounded-full text-green-500 font-medium">
                  {totalItems.toLocaleString()}
                </span>
              )}
            </button>
            <button
              onClick={() => handleTabChange("COMBO")}
              className={cn(
                "px-6 py-4 text-sm font-medium cursor-pointer border-b-2 transition-all",
                activeTab === "COMBO"
                  ? "border-green-500 text-green-600 bg-green-50"
                  : "border-transparent text-gray-600 hover:text-green-600 hover:border-green-300",
              )}
            >
              Combos
              {activeTab === "COMBO" && (
                <span className="ml-2 text-[10px] bg-green-100 px-2 py-1 rounded-full text-green-500 font-medium">
                  {totalItems.toLocaleString()}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Categories and Search Header */}
        <div className="p-4 sm:p-6 border-b border-gray-200 bg-white w-full overflow-hidden">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 mb-4">
            <h2 className="text-lg sm:text-xl font-semibold text-primary-black-100">
              {activeTab === "PRODUCT" ? "Manage Products" : "Manage Services"}
            </h2>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full sm:w-auto">
              <div className="w-full sm:w-60 md:w-80">
                <SearchInput
                  placeholder={
                    activeTab === "PRODUCT"
                      ? "Search Item, EAN..."
                      : "Search Services..."
                  }
                  value={searchInput}
                  onValueChange={handleSearchChange}
                />
              </div>

              {/* Product Filters Dropdown - Only show for Products */}
              {activeTab === "PRODUCT" && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      className="text-gray-700 border-gray-200 hover:bg-gray-50 w-full sm:w-auto relative"
                    >
                      <Filter className="w-4 h-4 mr-2" />
                      <span className="whitespace-nowrap">Filters</span>
                      {getActiveFiltersCount() > 0 && (
                        <span className="ml-2 bg-green-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-medium">
                          {getActiveFiltersCount()}
                        </span>
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 bg-white">
                    <DropdownMenuLabel className="text-sm font-semibold">
                      Product Settings
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuCheckboxItem
                      checked={productFilters.allowTax}
                      onCheckedChange={(checked) =>
                        setProductFilters({
                          ...productFilters,
                          allowTax: checked,
                        })
                      }
                      className="cursor-pointer"
                    >
                      <span className="text-sm">Allow tax calculation</span>
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem
                      checked={productFilters.sellOnline}
                      onCheckedChange={(checked) =>
                        setProductFilters({
                          ...productFilters,
                          sellOnline: checked,
                        })
                      }
                      className="cursor-pointer"
                    >
                      <span className="text-sm">Sell this product online</span>
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem
                      checked={productFilters.inHouse}
                      onCheckedChange={(checked) =>
                        setProductFilters({
                          ...productFilters,
                          inHouse: checked,
                        })
                      }
                      className="cursor-pointer"
                    >
                      <span className="text-sm">Produces in-house</span>
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem
                      checked={productFilters.rawMaterial}
                      onCheckedChange={(checked) =>
                        setProductFilters({
                          ...productFilters,
                          rawMaterial: checked,
                        })
                      }
                      className="cursor-pointer"
                    >
                      <span className="text-sm">Make raw material</span>
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem
                      checked={productFilters.watchlist}
                      onCheckedChange={(checked) =>
                        setProductFilters({
                          ...productFilters,
                          watchlist: checked,
                        })
                      }
                      className="cursor-pointer"
                    >
                      <span className="text-sm">Watchlist</span>
                    </DropdownMenuCheckboxItem>

                    {getActiveFiltersCount() > 0 && (
                      <>
                        <DropdownMenuSeparator />
                        <div className="p-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="w-full text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() => setProductFilters(DEFAULT_FILTERS)}
                          >
                            Clear all filters
                          </Button>
                        </div>
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}

              {role === "ADMIN-ATTENDANT" ||
                (role === "OWNER" && (
                  <Link href={"/categories"} className="w-full sm:w-auto">
                    <Button
                      variant="outline"
                      className="text-green-500 border-green-200 hover:bg-green-50 w-full sm:w-auto"
                    >
                      Manage Category
                    </Button>
                  </Link>
                ))}
            </div>
          </div>

          {/* Departments + Categories Filters */}
          {activeTab && (
            <>
              {CategoriesDataLoading || !CategoriesData ? (
                <div className="space-y-4">
                  <div>
                    <Skeleton className="h-4 w-24 mb-2 bg-gray-200" />
                    <div className="flex gap-2">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Skeleton
                          key={i}
                          className="h-8 w-24 rounded-md bg-gray-200 flex-shrink-0"
                        />
                      ))}
                    </div>
                  </div>
                  <div>
                    <Skeleton className="h-4 w-20 mb-2 bg-gray-200" />
                    <div className="flex gap-2">
                      {Array.from({ length: 6 }).map((_, i) => (
                        <Skeleton
                          key={i}
                          className="h-8 w-20 rounded-md bg-gray-200 flex-shrink-0"
                        />
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="w-full min-w-0 space-y-4">
                  {/* Departments Filter */}
                  <div className="min-w-0 w-full">
                    <h3 className="text-sm font-medium text-gray-700 mb-2">
                      Department
                    </h3>
                    {DepartmentDataLoading ? (
                      <div className="flex gap-2 py-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Skeleton
                            key={i}
                            className="h-8 w-24 rounded-md bg-gray-200 flex-shrink-0"
                          />
                        ))}
                      </div>
                    ) : (
                      <div
                        className="flex gap-2 overflow-x-auto scrollbar-hide py-1 min-w-0"
                        style={{
                          scrollbarWidth: "none",
                          msOverflowStyle: "none",
                        }}
                      >
                        <button
                          className={cn(
                            "px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium cursor-pointer rounded-md transition-all whitespace-nowrap flex-shrink-0",
                            selectedDepartmentId === null
                              ? "bg-green-500 text-white shadow-sm"
                              : "text-gray-600 hover:text-green-500 hover:bg-green-50 border border-gray-200",
                          )}
                          onClick={handleAllDepartmentsClick}
                        >
                          All Departments
                        </button>
                        {DepartmentData?.data?.map((department: Department) => (
                          <button
                            key={department.id}
                            className={cn(
                              "px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm cursor-pointer font-medium rounded-md transition-all whitespace-nowrap flex-shrink-0 capitalize",
                              selectedDepartmentId === department.id
                                ? "bg-green-500 text-white shadow-sm"
                                : "text-gray-600 hover:text-green-500 hover:bg-green-50 border border-gray-200",
                            )}
                            onClick={() => handleDepartmentClick(department.id)}
                          >
                            {department.name}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Categories Filter */}
                  <div className="w-full overflow-hidden">
                    <h3 className="text-sm font-medium text-gray-700 mb-2">
                      Category
                    </h3>
                    <div className="flex items-center gap-1 sm:gap-2">
                      {canScrollLeft && (
                        <button
                          onClick={() => scrollCategories("left")}
                          className="p-1 sm:p-2 rounded-md flex-shrink-0 text-gray-600 hover:text-green-500 hover:bg-green-50 transition-all"
                        >
                          <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                        </button>
                      )}
                      <div
                        ref={categoriesContainerRef}
                        className="flex gap-1 sm:gap-2 py-1 overflow-x-auto w-0 flex-1"
                        style={{
                          scrollbarWidth: "none",
                          msOverflowStyle: "none",
                          WebkitOverflowScrolling: "touch",
                        }}
                      >
                        <button
                          className={cn(
                            "px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium cursor-pointer rounded-md transition-all whitespace-nowrap flex-shrink-0",
                            selectedCategoryId === null
                              ? "bg-[#52b661] text-white shadow-sm"
                              : "text-gray-600 hover:text-green-500 hover:bg-green-50 border border-gray-200",
                          )}
                          onClick={handleAllClick}
                        >
                          All Categories
                        </button>
                        {CategoriesData.data.map((category: Category) => (
                          <button
                            key={category.id}
                            className={cn(
                              "px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm cursor-pointer font-medium rounded-md transition-all whitespace-nowrap flex-shrink-0",
                              selectedCategoryId === category.id
                                ? "bg-[#52b661] text-white shadow-sm"
                                : "text-gray-600 hover:text-green-500 hover:bg-green-50 border border-gray-200",
                            )}
                            onClick={() => handleCategoryClick(category.id)}
                          >
                            {category.name}
                          </button>
                        ))}
                      </div>
                      {canScrollRight && (
                        <button
                          onClick={() => scrollCategories("right")}
                          className="p-1 sm:p-2 rounded-md flex-shrink-0 text-gray-600 hover:text-green-500 hover:bg-green-50 transition-all"
                        >
                          <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {searchInput.length > 0 && searchInput.length < 3 && (
            <div className="mt-2 text-xs sm:text-sm text-gray-500">
              Type at least 3 characters to search
            </div>
          )}
        </div>

        <div className="p-6">
          {activeTab === "COMBO" ? (
            InventoryDataLoading || !InventoryData ? (
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
              <ComboTable
                setPage={setPage}
                page={page}
                response={InventoryData}
                loading={false}
              />
            )
          ) : activeTab === "PRODUCT" ? (
            InventoryDataLoading || !InventoryData ? (
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
                    role={role}
                    can={can}
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
            )
          ) : InventoryDataLoading || !InventoryData ? (
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
                <ServiceTable
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

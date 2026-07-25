"use client";

import { CustomCard } from "@/components/app/CustomCard";
import { CustomModal } from "@/components/app/CustomModal";
// Generate Report temporarily disabled — re-enable when ready.
// import GenerateReportButton from "@/components/app/GenerateReportButton";
import { SearchInput } from "@/components/app/SearchInput";
import { StatCardSkeletonRow } from "@/components/app/StatCardSkeleton";
import { TableSkeleton } from "@/components/app/TableSkeleton";
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
import { ReactNode, useEffect, useRef, useState } from "react";
import AddService from "./AddService";
// Download Report temporarily disabled — re-enable when ready.
// import { DownloadInventoryButton } from "./DownloadInventoryReportsButton";
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

const INVENTORY_CARD_STYLES: Record<
  CustomInventoryCardProps["type"],
  { bg: string; iconColor: string; icon: ReactNode }
> = {
  value: {
    bg: "bg-[#e0e7ff]",
    iconColor: "text-info-1",
    icon: <TrendingUp className="w-4 h-4" />,
  },
  profit: {
    bg: "bg-success-2",
    iconColor: "text-success-1",
    icon: <DollarSign className="w-4 h-4" />,
  },
  other: {
    bg: "bg-warning-2",
    iconColor: "text-warning-1",
    icon: <Tag className="w-4 h-4" />,
  },
};

const CustomInventoryCard = ({
  title,
  amount,
  type,
  className,
}: CustomInventoryCardProps) => {
  const variant = INVENTORY_CARD_STYLES[type] ?? INVENTORY_CARD_STYLES.other;

  return (
    <CustomCard
      className={cn(
        variant.bg,
        "w-full rounded-2xl border-none transition-all p-0",
        className,
      )}
      contentClassName="p-4 sm:p-5 flex flex-col gap-3"
    >
      <div className="flex items-center gap-2">
        <span className={variant.iconColor}>{variant.icon}</span>
        <span className={cn("text-xs font-bold", variant.iconColor)}>
          {title}
        </span>
      </div>
      <span className="text-2xl font-extrabold text-grey-1">{amount}</span>
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

// Table-shaped skeleton (header row + thumbnail/name/category/price/status/action
// columns) so loading state resembles the real InventoryTable/ComboTable/ServiceTable
// instead of generic flat bars. This is the canonical shape TableSkeleton was
// modeled on — every table-loading screen in the app should render the same one.
const InventoryTableSkeleton = () => (
  <div className="mt-4">
    <TableSkeleton
      rows={6}
      columns={[
        { width: "w-6", hiddenOnMobile: true },
        { flex: true, thumbnail: true },
        { width: "w-16", hiddenOnMobile: true },
        { width: "w-14", hiddenOnMobile: true },
        { pill: true },
        { width: "w-4", hiddenOnMobile: true },
      ]}
    />
  </div>
);

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
      <div className="w-full">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between w-full mb-4 sm:mb-6 gap-3 sm:gap-0">
          <p className="text-2xl md:text-3xl text-grey-1 font-extrabold">
            Inventory
          </p>

          {canManageInventory && (
            <div className="flex items-center gap-2 w-full sm:w-auto">
              {/* Generate Report temporarily disabled — re-enable when ready.
              <GenerateReportButton
                reportType="inventory"
                className="w-full sm:w-auto"
              />
              */}
              {/* Add New dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button className="flex-1 sm:flex-none bg-primary-green-300 hover:bg-primary-green-300/90 text-white px-4 py-2 text-sm gap-1.5">
                    <Plus className="w-4 h-4" />
                    Add New
                    <ChevronDown className="w-4 h-4 ml-0.5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="min-w-[200px]">
                  <DropdownMenuItem
                    asChild
                    className="cursor-pointer px-4 py-2.5 hover:bg-secondary-6 hover:text-primary-green-300 transition-colors"
                  >
                    <Link href={"/new-add-product"}>
                      <Package className="w-4 h-4 mr-2" />
                      New Product
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={openddServiceModal}
                    className="cursor-pointer px-4 py-2.5 hover:bg-secondary-6 hover:text-primary-green-300 transition-colors"
                  >
                    <Wrench className="w-4 h-4 mr-2" />
                    New Service
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    asChild
                    className="cursor-pointer px-4 py-2.5 hover:bg-secondary-6 hover:text-primary-green-300 transition-colors"
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
                    className="border-grey-5 text-grey-2 hover:bg-grey-6 px-3 py-2 text-sm gap-1.5"
                  >
                    <MoreHorizontal className="w-4 h-4" />
                    <span className="hidden sm:inline">More</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="min-w-[200px] p-0"
                >
                  {/* Download Report temporarily disabled — re-enable when ready.
                  <div className="px-2 py-1.5">
                    <DownloadInventoryButton business_id={business_id} />
                  </div>
                  */}
                  <DropdownMenuItem
                    asChild
                    className="cursor-pointer px-4 py-2.5 hover:bg-grey-6 transition-colors"
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
        <div>
          <p className="text-sm font-bold text-primary-green-300 border-b border-border-tint pb-2 mb-3 sm:mb-4">
            Overview
          </p>

          {InventoryDataLoading || !InventoryData ? (
            <StatCardSkeletonRow
              count={3}
              gridClassName="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4"
            />
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
      <div className="w-full  overflow-hidden">
        {/* Tabs Header */}
        <div className="border-b border-border-tint">
          <div className="flex items-center gap-6">
            <button
              onClick={() => handleTabChange("PRODUCT")}
              className={cn(
                "py-4 text-sm cursor-pointer font-bold border-b-2 transition-colors",
                activeTab === "PRODUCT"
                  ? "border-primary-green-300 text-primary-green-300"
                  : "border-transparent text-grey-3 hover:text-grey-2",
              )}
            >
              Products
              {activeTab === "PRODUCT" && (
                <span className="ml-2 text-[10px] bg-secondary-6 px-2 py-1 rounded-full text-primary-green-300 font-extrabold">
                  {totalItems.toLocaleString()}
                </span>
              )}
            </button>
            <button
              onClick={() => handleTabChange("SERVICE")}
              className={cn(
                "py-4 text-sm font-bold cursor-pointer border-b-2 transition-colors",
                activeTab === "SERVICE"
                  ? "border-primary-green-300 text-primary-green-300"
                  : "border-transparent text-grey-3 hover:text-grey-2",
              )}
            >
              Services
              {activeTab === "SERVICE" && (
                <span className="ml-2 text-[10px] bg-secondary-6 px-2 py-1 rounded-full text-primary-green-300 font-extrabold">
                  {totalItems.toLocaleString()}
                </span>
              )}
            </button>
            <button
              onClick={() => handleTabChange("COMBO")}
              className={cn(
                "py-4 text-sm font-bold cursor-pointer border-b-2 transition-colors",
                activeTab === "COMBO"
                  ? "border-primary-green-300 text-primary-green-300"
                  : "border-transparent text-grey-3 hover:text-grey-2",
              )}
            >
              Combos
              {activeTab === "COMBO" && (
                <span className="ml-2 text-[10px] bg-secondary-6 px-2 py-1 rounded-full text-primary-green-300 font-extrabold">
                  {totalItems.toLocaleString()}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Categories and Search Header */}
        <div className="py-4 sm:py-6 border-b border-border-tint w-full overflow-hidden">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 mb-4">
            <h2 className="text-base sm:text-lg font-extrabold text-grey-1">
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
                      className="text-grey-2 border-grey-5 hover:bg-grey-6 hover:text-grey-2 rounded-xl text-sm w-full sm:w-auto relative"
                    >
                      <Filter className="w-4 h-4 mr-2" />
                      <span className="whitespace-nowrap">Filters</span>
                      {getActiveFiltersCount() > 0 && (
                        <span className="absolute -top-2 -right-2 bg-primary-green-300 text-white text-[10px] rounded-full w-5 h-5 flex items-center justify-center">
                          {getActiveFiltersCount()}
                        </span>
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
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
                            className="w-full text-xs text-error-1 hover:text-error-1 hover:bg-error-2"
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
                      className="text-grey-2 border-grey-5 hover:bg-grey-6 hover:text-grey-2 w-full sm:w-auto"
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
                    <Skeleton className="h-4 w-24 mb-2 bg-grey-5" />
                    <div className="flex gap-2">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Skeleton
                          key={i}
                          className="h-8 w-24 rounded-full bg-grey-5 flex-shrink-0"
                        />
                      ))}
                    </div>
                  </div>
                  <div>
                    <Skeleton className="h-4 w-20 mb-2 bg-grey-5" />
                    <div className="flex gap-2">
                      {Array.from({ length: 6 }).map((_, i) => (
                        <Skeleton
                          key={i}
                          className="h-8 w-20 rounded-full bg-grey-5 flex-shrink-0"
                        />
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="w-full min-w-0 space-y-4">
                  {/* Departments Filter */}
                  <div className="min-w-0 w-full">
                    <h3 className="text-xs font-bold text-grey-3 uppercase tracking-wide mb-2">
                      Department
                    </h3>
                    {DepartmentDataLoading ? (
                      <div className="flex gap-2 py-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Skeleton
                            key={i}
                            className="h-8 w-24 rounded-full bg-grey-5 flex-shrink-0"
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
                            "px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-bold cursor-pointer rounded-full transition-all whitespace-nowrap flex-shrink-0",
                            selectedDepartmentId === null
                              ? "bg-primary-green-300 text-white shadow-sm"
                              : "bg-white border border-grey-5 text-grey-2 hover:bg-grey-6",
                          )}
                          onClick={handleAllDepartmentsClick}
                        >
                          All Departments
                        </button>
                        {DepartmentData?.data?.map((department: Department) => (
                          <button
                            key={department.id}
                            className={cn(
                              "px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm cursor-pointer font-bold rounded-full transition-all whitespace-nowrap flex-shrink-0 capitalize",
                              selectedDepartmentId === department.id
                                ? "bg-primary-green-300 text-white shadow-sm"
                                : "bg-white border border-grey-5 text-grey-2 hover:bg-grey-6",
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
                    <h3 className="text-xs font-bold text-grey-3 uppercase tracking-wide mb-2">
                      Category
                    </h3>
                    <div className="flex items-center gap-1 sm:gap-2">
                      {canScrollLeft && (
                        <button
                          onClick={() => scrollCategories("left")}
                          className="p-1 sm:p-2 rounded-full flex-shrink-0 text-grey-3 hover:text-primary-green-300 hover:bg-secondary-6 transition-all"
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
                            "px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-bold cursor-pointer rounded-full transition-all whitespace-nowrap flex-shrink-0",
                            selectedCategoryId === null
                              ? "bg-primary-green-300 text-white shadow-sm"
                              : "bg-white border border-grey-5 text-grey-2 hover:bg-grey-6",
                          )}
                          onClick={handleAllClick}
                        >
                          All Categories
                        </button>
                        {CategoriesData.data.map((category: Category) => (
                          <button
                            key={category.id}
                            className={cn(
                              "px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm cursor-pointer font-bold rounded-full transition-all whitespace-nowrap flex-shrink-0 capitalize",
                              selectedCategoryId === category.id
                                ? "bg-primary-green-300 text-white shadow-sm"
                                : "bg-white border border-grey-5 text-grey-2 hover:bg-grey-6",
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
                          className="p-1 sm:p-2 rounded-full flex-shrink-0 text-grey-3 hover:text-primary-green-300 hover:bg-secondary-6 transition-all"
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
            <div className="mt-2 text-xs sm:text-sm text-grey-4">
              Type at least 3 characters to search
            </div>
          )}
        </div>

        <div className="pb-6">
          {activeTab === "COMBO" ? (
            InventoryDataLoading || !InventoryData ? (
              <InventoryTableSkeleton />
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
              <InventoryTableSkeleton />
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
            <InventoryTableSkeleton />
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

"use client";
import { CustomCard } from "@/components/app/CustomCard";
import { CustomModal } from "@/components/app/CustomModal";
import { SearchInput } from "@/components/app/SearchInput";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useOrdersHook } from "@/hooks/useOrdersHook";
import { cn } from "@/lib/utils";
import { formatToNaira } from "@/utils/formatMoney";
import {
  ArrowDownLeft,
  CheckCircle,
  Copy,
  ExternalLink,
  Filter as FilterIcon,
  ShoppingCart,
  TrendingUp,
  X,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import AllOrdersTable from "./AllOrdersTable";
import NoOrders from "./NoOrders";
import CreateOrders from "./create/CreateOrders";

interface CustomOrderCardProps {
  title: string;
  amount: number | string;
  type: "total" | "completed" | "revenue" | "visits";
  className?: string;
  subtitle?: string;
  loading?: boolean;
}

interface FilterState {
  order_type: string;
  shipping_status: string;
  payment_status: string;
}

const CustomOrderCard = ({
  title,
  amount,
  type,
  className,
  subtitle,
  loading = false,
}: CustomOrderCardProps) => {
  const variants = {
    total: {
      bg: "bg-gradient-to-br from-blue-50 to-blue-100",
      border: "border-blue-200",
      iconBg: "bg-blue-100",
      icon: <ShoppingCart className="w-5 h-5 text-blue-600" />,
      text: "text-gray-600",
      amountText: "text-gray-900",
      subtitleColor: "text-blue-500",
    },
    completed: {
      bg: "bg-gradient-to-br from-green-50 to-green-100",
      border: "border-green-200",
      iconBg: "bg-green-100",
      icon: <CheckCircle className="w-5 h-5 text-green-600" />,
      text: "text-gray-600",
      amountText: "text-gray-900",
      subtitleColor: "text-green-500",
    },
    revenue: {
      bg: "bg-gradient-to-br from-purple-50 to-purple-100",
      border: "border-purple-200",
      iconBg: "bg-purple-100",
      icon: <TrendingUp className="w-5 h-5 text-purple-600" />,
      text: "text-gray-600",
      amountText: "text-gray-900",
      subtitleColor: "text-purple-500",
    },
    visits: {
      bg: "bg-gradient-to-br from-orange-50 to-orange-100",
      border: "border-orange-200",
      iconBg: "bg-orange-100",
      icon: <ArrowDownLeft className="w-5 h-5 text-orange-600" />,
      text: "text-gray-600",
      amountText: "text-gray-900",
      subtitleColor: "text-orange-500",
    },
  };

  const variant = variants[type];

  if (loading) {
    return (
      <CustomCard className={cn("p-4 w-full border-gray-200", className)}>
        <div className="flex flex-col gap-4 sm:gap-6 items-start">
          <Skeleton className="h-4 w-[80px] sm:w-[100px] bg-gray-200" />
          <Skeleton className="h-5 sm:h-6 w-[60px] sm:w-[70px] bg-gray-200" />
        </div>
      </CustomCard>
    );
  }

  return (
    <CustomCard
      className={cn(
        variant.bg,
        variant.border,
        "p-3 sm:p-4 w-full rounded-lg border transition-all hover:shadow-md",
        className
      )}
    >
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className={cn("p-1.5 sm:p-2 rounded-full", variant.iconBg)}>
            {variant.icon}
          </div>
          <span className={cn("text-xs sm:text-sm font-medium", variant.text)}>
            {title}
          </span>
        </div>
      </div>
      <div className="mt-3 sm:mt-4">
        <span
          className={cn("text-xl sm:text-2xl font-bold", variant.amountText)}
        >
          {amount}
        </span>
      </div>
    </CustomCard>
  );
};

const Orders = () => {
  const [searchInput, setSearchInput] = useState("");
  const [openCreateOrderModal, setOpenCreateOrderModal] = useState(false);
  const [openFilterModal, setOpenFilterModal] = useState(false);
  const [activeTab, setActiveTab] = useState<"INSTORE" | "OUTSTORE">(
    "OUTSTORE"
  );
  const [page, setPage] = useState(1);
  const [copiedUrl, setCopiedUrl] = useState(false);

  // Filter states
  const [filters, setFilters] = useState<FilterState>({
    order_type: "",
    shipping_status: "",
    payment_status: "",
  });

  const [tempFilters, setTempFilters] = useState<FilterState>({
    order_type: "",
    shipping_status: "",
    payment_status: "",
  });

  const handleSearchChange = (value: string) => {
    setSearchInput(value);
    setPage(1);
  };

  const handleTabChange = (tab: "INSTORE" | "OUTSTORE") => {
    setActiveTab(tab);
    setPage(1);
    setSearchInput("");
    // Update order_type filter when tab changes
    setFilters((prev) => ({ ...prev, order_type: tab }));
  };

  const handleApplyFilters = () => {
    setFilters(tempFilters);
    setPage(1);
    setOpenFilterModal(false);
  };

  const handleResetFilters = () => {
    const resetFilters = {
      order_type: activeTab, // Keep the current tab selection
      shipping_status: "",
      payment_status: "",
    };
    setTempFilters(resetFilters);
    setFilters(resetFilters);
    setPage(1);
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (filters.shipping_status) count++;
    if (filters.payment_status) count++;
    return count;
  };

  // Get store URL based on active tab
  const getStoreUrl = () => {
    const slug = findBusiness?.store_url || "";
    const baseUrl = "https://store.sync360.africa";

    if (activeTab === "INSTORE") {
      return `${baseUrl}/in-store/?slug=${slug}`;
    } else {
      return `${baseUrl}/out-store/?slug=${slug}`;
    }
  };

  // Copy store URL to clipboard
  const handleCopyUrl = async () => {
    const url = getStoreUrl();
    try {
      await navigator.clipboard.writeText(url);
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  // Fetch orders data with filters
  const { OrderData, OrderDataLoading, findBusiness } = useOrdersHook({
    page,
    searchInput: searchInput.length >= 3 ? searchInput : "",
    order_type: activeTab, // Use active tab for order_type
    shipping_status: filters.shipping_status,
    payment_status: filters.payment_status,
  });

  console.log("findBusiness", findBusiness);

  // Extract data safely from API response
  const ordersResults = OrderData?.data?.results || {};
  const ordersData = ordersResults.data || [];

  // Use backend-provided stats
  const totalOrders = ordersResults.order_count || 0;
  const completedOrders = ordersResults.completed_orders || 0;
  const totalRevenue = ordersResults.revenue || 0;

  // Calculate counts for each tab

  console.log("ordersResults", ordersResults);
  const instoreCount = ordersResults?.data?.length || 0;
  const outstoreCount = ordersResults?.data?.length || 0;

  // Calculate success rate
  const successRate =
    totalOrders > 0 ? Math.round((completedOrders / totalOrders) * 100) : 0;

  // Calculate total link visits
  const totalLinkVisits = Math.floor(totalOrders * 2.6);

  return (
    <div className="w-full h-full flex flex-col justify-start gap-5 items-start">
      {/* Header Section */}
      <div className="w-full bg-white px-2 sm:px-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between w-full mb-4 sm:mb-6 gap-3 sm:gap-0">
          <p className="text-2xl md:text-3xl text-primary-black-100 font-[500]">
            Orders
          </p>

          <div className="flex gap-2 items-center flex-wrap w-full sm:w-auto">
            <Link href="/orders/create" className="w-full sm:w-auto">
              <Button className="w-full sm:w-auto">Create Order</Button>
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="mb-4 sm:mb-6">
          {OrderDataLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <CustomOrderCard
                  key={index}
                  title=""
                  amount=""
                  type="total"
                  loading={true}
                />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <CustomOrderCard
                title={`Total Orders`}
                amount={totalOrders}
                type="total"
                subtitle="+12% from last month"
              />
              <CustomOrderCard
                title="Completed Orders"
                amount={completedOrders}
                type="completed"
                subtitle={`${successRate}% success rate`}
              />
              <CustomOrderCard
                title="Total Revenue"
                amount={formatToNaira(totalRevenue)}
                type="revenue"
                subtitle="+8% from last month"
              />
              <CustomOrderCard
                title="Total Link Visits"
                amount={totalLinkVisits}
                type="visits"
                subtitle="+5% from last month"
              />
            </div>
          )}
        </div>
      </div>

      {/* Main Content Section */}
      <div className="w-full rounded-lg shadow-sm border border-gray-200 bg-white">
        {/* Tabs Header */}
        <div className="border-b border-gray-200">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
            <div className="flex">
              <button
                onClick={() => handleTabChange("INSTORE")}
                className={cn(
                  "px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm cursor-pointer font-medium border-b-2 transition-all",
                  activeTab === "INSTORE"
                    ? "border-blue-500 text-blue-600 bg-blue-50"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                )}
              >
                In-store Orders
                <span
                  className={cn(
                    "ml-2 text-[10px] px-2 py-1 rounded-full font-medium",
                    activeTab === "INSTORE"
                      ? "bg-blue-100 text-blue-600"
                      : "bg-gray-100 text-gray-600"
                  )}
                >
                  {activeTab === "INSTORE" && instoreCount}
                </span>
              </button>
              <button
                onClick={() => handleTabChange("OUTSTORE")}
                className={cn(
                  "px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-medium cursor-pointer border-b-2 transition-all",
                  activeTab === "OUTSTORE"
                    ? "border-blue-500 text-blue-600 bg-blue-50"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                )}
              >
                Out-store Orders
                <span
                  className={cn(
                    "ml-2 text-[10px] px-2 py-1 rounded-full font-medium",
                    activeTab === "OUTSTORE"
                      ? "bg-blue-100 text-blue-600"
                      : "bg-gray-100 text-gray-600"
                  )}
                >
                  {activeTab === "OUTSTORE" && outstoreCount}
                </span>
              </button>
            </div>

            {/* Store URL Copy Section */}
            {findBusiness?.store_url && (
              <div className="flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 w-full sm:w-auto border-t sm:border-t-0 sm:border-l border-gray-200">
                <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2 flex-1 sm:flex-none">
                  <ExternalLink className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  <span className="text-xs text-gray-600 truncate max-w-[200px] sm:max-w-[250px]">
                    {activeTab === "INSTORE" ? "In-store" : "Out-store"} Link
                  </span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopyUrl}
                  className={cn(
                    "text-xs transition-all flex-shrink-0",
                    copiedUrl
                      ? "bg-green-50 border-green-200 text-green-700 hover:bg-green-100"
                      : "hover:bg-blue-50 hover:border-blue-200"
                  )}
                >
                  {copiedUrl ? (
                    <>
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3 mr-1" />
                      Copy URL
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Search and Actions Header */}
        <div className="p-4 sm:p-6 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
            <div className="w-full sm:w-1/2">
              <SearchInput
                placeholder="Search by customer name, order ID..."
                value={searchInput}
                onValueChange={handleSearchChange}
              />
              {searchInput.length > 0 && searchInput.length < 3 && (
                <div className="mt-1 text-xs sm:text-sm text-gray-500">
                  Type at least 3 characters to search
                </div>
              )}
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <Button
                variant="outline"
                className="flex-1 sm:flex-none text-xs sm:text-sm relative"
                onClick={() => setOpenFilterModal(true)}
              >
                <FilterIcon className="w-4 h-4 mr-2" />
                Filter
                {getActiveFilterCount() > 0 && (
                  <span className="absolute -top-2 -right-2 bg-blue-500 text-white text-[10px] rounded-full w-5 h-5 flex items-center justify-center">
                    {getActiveFilterCount()}
                  </span>
                )}
              </Button>
              <Button
                variant="outline"
                className="flex-1 sm:flex-none text-xs sm:text-sm"
              >
                Export
              </Button>
            </div>
          </div>

          {/* Active Filters Display */}
          {(filters.shipping_status || filters.payment_status) && (
            <div className="flex flex-wrap gap-2 mt-3">
              {filters.shipping_status && (
                <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 text-blue-700 px-3 py-1 rounded-full text-xs">
                  <span>Shipping: {filters.shipping_status}</span>
                  <button
                    onClick={() =>
                      setFilters((prev) => ({ ...prev, shipping_status: "" }))
                    }
                    className="hover:bg-blue-100 rounded-full p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}
              {filters.payment_status && (
                <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 text-blue-700 px-3 py-1 rounded-full text-xs">
                  <span>Payment: {filters.payment_status}</span>
                  <button
                    onClick={() =>
                      setFilters((prev) => ({ ...prev, payment_status: "" }))
                    }
                    className="hover:bg-blue-100 rounded-full p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}
              <button
                onClick={handleResetFilters}
                className="text-xs text-blue-600 hover:text-blue-800 underline"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>

        {/* Table Content */}
        <div className="p-4 sm:p-6">
          {OrderDataLoading ? (
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
              {ordersData.length > 0 ? (
                <AllOrdersTable
                  setPage={setPage}
                  page={page}
                  response={OrderData}
                  loading={false}
                />
              ) : (
                <div className="w-full h-64 flex flex-col justify-center items-center">
                  <NoOrders />
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Filter Modal */}
      <CustomModal
        isOpen={openFilterModal}
        onClose={() => {
          setOpenFilterModal(false);
          setTempFilters(filters); // Reset temp filters to current filters
        }}
        title="Filter Orders"
      >
        <div className="space-y-6">
          {/* Shipping Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Shipping Status
            </label>
            <select
              value={tempFilters.shipping_status}
              onChange={(e) =>
                setTempFilters((prev) => ({
                  ...prev,
                  shipping_status: e.target.value,
                }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Shipping Status</option>
              <option value="PENDING">Pending</option>
              <option value="SHIPPED">Shipped</option>
              <option value="DELIVERED">Delivered</option>
              <option value="RETURNED">Returned</option>
            </select>
          </div>

          {/* Payment Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Payment Status
            </label>
            <select
              value={tempFilters.payment_status}
              onChange={(e) =>
                setTempFilters((prev) => ({
                  ...prev,
                  payment_status: e.target.value,
                }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Payment Status</option>
              <option value="UNPAID">Unpaid</option>
              <option value="PAID">Paid</option>
              <option value="PARTIAL">Partial</option>
            </select>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => {
                setTempFilters({
                  order_type: activeTab,
                  shipping_status: "",
                  payment_status: "",
                });
              }}
            >
              Reset
            </Button>
            <Button className="flex-1" onClick={handleApplyFilters}>
              Apply Filters
            </Button>
          </div>
        </div>
      </CustomModal>

      {/* Create Order Modal */}
      <CustomModal
        isOpen={openCreateOrderModal}
        onClose={() => setOpenCreateOrderModal(false)}
        title="Create Order"
      >
        <CreateOrders />
      </CustomModal>
    </div>
  );
};

export default Orders;

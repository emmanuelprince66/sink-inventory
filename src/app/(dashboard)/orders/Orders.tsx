"use client";
import { CardGridSkeleton } from "@/components/app/CardGridSkeleton";
import { CustomCard } from "@/components/app/CustomCard";
import { CustomModal } from "@/components/app/CustomModal";
import CustomPagination from "@/components/app/CustomPagination";
import { DatePickerWithRange } from "@/components/app/DateRangePicker";
import { SearchInput } from "@/components/app/SearchInput";
import { StatCardSkeletonRow } from "@/components/app/StatCardSkeleton";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useOrdersHook } from "@/hooks/useOrdersHook";
import { cn } from "@/lib/utils";
import { formatToNaira } from "@/utils/formatMoney";
import {
  ArrowDownLeft,
  CheckCircle,
  ChevronDown,
  Copy,
  ExternalLink,
  FileText,
  Filter as FilterIcon,
  ShoppingCart,
  TrendingUp,
  Truck,
  X,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { DateRange } from "react-day-picker";
import AssignDeliveryModal from "./AssignDeliveryModal";
import CreateOrders from "./create/CreateOrders";
import NoOrders from "./NoOrders";
import OrderCard from "./OrderCard";
import Payment from "./PaymentModal";

interface CustomOrderCardProps {
  title: string;
  amount: number | string;
  type: "total" | "completed" | "revenue" | "visits" | "cost";
  className?: string;
  subtitle?: string;
}

interface FilterState {
  order_type: string;
  shipping_status: string;
  payment_status: string;
  sales_staff: string;
  delivery_company: string;
}

type OrderStatusTab =
  | "ALL"
  | "PENDING"
  | "PROCESSING"
  | "OUT_FOR_DELIVERY"
  | "COMPLETED"
  | "DELIVERED"
  | "CANCELLED";

const INSTORE_STATUS_TABS: { key: OrderStatusTab; label: string }[] = [
  { key: "ALL", label: "All" },
  { key: "PENDING", label: "Pending" },
  { key: "PROCESSING", label: "Processing" },
  { key: "OUT_FOR_DELIVERY", label: "Out for Delivery" },
  { key: "COMPLETED", label: "Completed" },
  { key: "CANCELLED", label: "Cancelled" },
];

const OUTSTORE_STATUS_TABS: { key: OrderStatusTab; label: string }[] = [
  { key: "ALL", label: "All" },
  { key: "PENDING", label: "Pending" },
  { key: "PROCESSING", label: "Processing" },
  { key: "OUT_FOR_DELIVERY", label: "Out for Delivery" },
  { key: "DELIVERED", label: "Delivered" },
  { key: "CANCELLED", label: "Cancelled" },
];

// Placeholders until the backend returns sales staff / delivery companies.
const MOCK_SALES_STAFF = [
  "Adaeze Okoye",
  "Tunde Bello",
  "Chiamaka Ibe",
  "Samuel Ade",
];
const MOCK_DELIVERY_COMPANIES = [
  "Shipbubble",
  "Kwik Delivery",
  "GIG Logistics",
  "DHL Express",
  "In-house Riders",
];

// Matches Figma reference: Convert Mobile Screens to Desktop/src/app/App.tsx, OrdersScreen
// (KPI card grid, ~line 1176) — rounded-2xl, p-4, gap-3, label 12px/700, value 24px/800 #111827,
// icon 18px. See sink/docs/FIGMA_VS_CODE_COMPARISON.md for the full checked breakdown.
const CustomOrderCard = ({
  title,
  amount,
  type,
  className,
  subtitle,
}: CustomOrderCardProps) => {
  const variants = {
    total: {
      bg: "bg-[#eff6ff]",
      icon: <ShoppingCart className="w-[18px] h-[18px] text-info-1" />,
      text: "text-info-1",
      amountText: "text-grey-1",
    },
    completed: {
      bg: "bg-success-2",
      icon: <CheckCircle className="w-[18px] h-[18px] text-success-1" />,
      text: "text-success-1",
      amountText: "text-grey-1",
    },
    revenue: {
      bg: "bg-pink-50",
      icon: <TrendingUp className="w-[18px] h-[18px] text-pink-600" />,
      text: "text-pink-600",
      amountText: "text-grey-1",
    },
    visits: {
      bg: "bg-orange-50",
      icon: <ArrowDownLeft className="w-[18px] h-[18px] text-orange-500" />,
      text: "text-orange-500",
      amountText: "text-grey-1",
    },
    cost: {
      bg: "bg-warning-2",
      icon: <Truck className="w-[18px] h-[18px] text-warning-1" />,
      text: "text-warning-1",
      amountText: "text-grey-1",
    },
  };

  const variant = variants[type];

  return (
    <CustomCard
      className={cn(
        variant.bg,
        "w-full rounded-2xl border-none transition-all p-0",
        className,
      )}
      contentClassName="p-4 flex flex-col gap-3"
    >
      <div className="flex items-center justify-between">
        <p className={cn("text-xs font-bold", variant.text)}>{title}</p>
        {variant.icon}
      </div>
      <p className={cn("text-2xl font-extrabold", variant.amountText)}>
        {amount}
      </p>
    </CustomCard>
  );
};

const Orders = () => {
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(),
    to: new Date(),
  });
  const [datePreset, setDatePreset] = useState<
    "today" | "week" | "month" | null
  >("today");
  const [searchInput, setSearchInput] = useState("");
  const [openCreateOrderModal, setOpenCreateOrderModal] = useState(false);
  const [openSubscriptionModal, setOpenSubscriptionModal] = useState(false);
  const [openFilterModal, setOpenFilterModal] = useState(false);
  const [activeTab, setActiveTab] = useState<"INSTORE" | "OUTSTORE">(
    "OUTSTORE",
  );
  const [activeStatusTab, setActiveStatusTab] = useState<OrderStatusTab>("ALL");
  const [page, setPage] = useState(1);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [openAssignDelivery, setOpenAssignDelivery] = useState(false);
  const [assignTargetOrderId, setAssignTargetOrderId] = useState<
    string | undefined
  >();

  // Filter states
  const [filters, setFilters] = useState<FilterState>({
    order_type: "",
    shipping_status: "",
    payment_status: "",
    sales_staff: "",
    delivery_company: "",
  });

  const [tempFilters, setTempFilters] = useState<FilterState>({
    order_type: "",
    shipping_status: "",
    payment_status: "",
    sales_staff: "",
    delivery_company: "",
  });

  const handleSearchChange = (value: string) => {
    setSearchInput(value);
    setPage(1);
  };

  const handleTabChange = (tab: "INSTORE" | "OUTSTORE") => {
    setActiveTab(tab);
    setActiveStatusTab("ALL");
    setPage(1);
    setSearchInput("");
    setFilters((prev) => ({ ...prev, order_type: tab, shipping_status: "" }));
  };

  // UI-only for now — don't drive the backend filter until status sub-stages are supported.
  const handleStatusTabChange = (status: OrderStatusTab) => {
    setActiveStatusTab(status);
  };

  const handleDatePreset = (preset: "today" | "week" | "month") => {
    const now = new Date();
    const start = new Date();
    if (preset === "week") start.setDate(now.getDate() - 7);
    if (preset === "month") start.setMonth(now.getMonth() - 1);
    setDateRange({ from: start, to: now });
    setDatePreset(preset);
    setPage(1);
  };

  const handleApplyFilters = () => {
    setFilters(tempFilters);
    setPage(1);
    setOpenFilterModal(false);
  };

  const handleResetFilters = () => {
    const resetFilters = {
      order_type: activeTab,
      shipping_status: "",
      payment_status: "",
      sales_staff: "",
      delivery_company: "",
    };
    setTempFilters(resetFilters);
    setFilters(resetFilters);
    setActiveStatusTab("ALL");
    setPage(1);
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (filters.shipping_status) count++;
    if (filters.payment_status) count++;
    if (filters.sales_staff) count++;
    if (filters.delivery_company) count++;
    return count;
  };

  const statusTabs =
    activeTab === "INSTORE" ? INSTORE_STATUS_TABS : OUTSTORE_STATUS_TABS;

  // Get store URL based on active tab
  const getStoreUrl = () => {
    const slug = findBusiness?.store_url || "";
    const baseUrl = "https://store.sync360.africa";

    if (activeTab === "INSTORE") {
      return `${baseUrl}/i/${slug}`;
    } else {
      return `${baseUrl}/o/${slug}`;
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
    dateRange,
  });

  console.log("findBusiness", findBusiness);

  // Extract data safely from API response
  const ordersData = OrderData?.data || {};
  console.log("ordersData", ordersData);

  // Use backend-provided stats
  const totalOrders = ordersData?.results?.total_orders || 0;
  const completedOrders = ordersData?.results?.completed_orders || 0;
  const totalRevenue = ordersData?.results?.total_revenue || 0;

  // Calculate counts for each tab
  const instoreCount = ordersData?.results?.data?.length || 0;
  const outstoreCount = ordersData?.results?.data?.length || 0;

  // Calculate success rate
  const successRate =
    totalOrders > 0 ? Math.round((completedOrders / totalOrders) * 100) : 0;

  // "Total Link Visits" had no real backing field from the API — it was a
  // fabricated `totalOrders * 2.6` guess. Removed until the backend
  // actually returns a link-visits stat, rather than show a fake number.
  // const totalLinkVisits = Math.floor(totalOrders * 2.6);

  // Paid/Unpaid breakdown removed — the endpoint's `results` only returns
  // total_orders/completed_orders/total_revenue/data, no paid_orders field,
  // so this was always reading undefined and showing a fake "0 paid".
  // const paidInvoices = ordersData?.results?.paid_orders || 0;
  // const unpaidInvoices = totalOrders - paidInvoices;

  // Sum shipping fees across the visible orders (until backend returns a dedicated stat).
  const totalDeliveryCost = (ordersData?.results?.data || []).reduce(
    (sum: number, o: any) => sum + Number(o?.shipping_fee || 0),
    0,
  );

  return (
    <div className="w-full h-full flex flex-col justify-start gap-3 items-start">
      {/* Header Section */}
      <div className="w-full">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between w-full mb-4 sm:mb-6 gap-3 sm:gap-0">
          <p className="text-2xl md:text-3xl text-grey-1 font-extrabold">
            Invoices and Orders
          </p>

          <div className="flex flex-col sm:flex-row gap-2  w-full sm:w-auto items-center ">
            <div className="w-full">
              <DatePickerWithRange
                date={dateRange}
                onDateChange={(range) => {
                  setDateRange(range);
                  setDatePreset(null);
                }}
                className="w-full sm:w-auto mx-auto sm:mx-auto"
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button className="w-full sm:w-auto">
                  Create
                  <ChevronDown className="w-4 h-4 ml-1" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52 p-1.5">
                <DropdownMenuItem asChild className="py-1.5">
                  <Link
                    href="/orders/create"
                    className="flex items-center gap-2"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    {activeTab === "INSTORE"
                      ? "Create Invoice"
                      : "Create Order"}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="py-1.5">
                  <Link
                    href="/orders/create"
                    className="flex items-center gap-2"
                  >
                    <Truck className="w-3.5 h-3.5" />
                    Create Shipping
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="mb-1 sm:mb-2">
          {OrderDataLoading ? (
            <StatCardSkeletonRow
              count={activeTab === "INSTORE" ? 3 : 4}
              gridClassName={cn(
                "grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4",
                activeTab === "INSTORE" ? "lg:grid-cols-3" : "lg:grid-cols-4",
              )}
            />
          ) : activeTab === "INSTORE" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              <CustomOrderCard title="Total Orders" amount={totalOrders} type="total" />
              {/* "Paid"/"Unpaid" removed — the endpoint has no paid_orders
                  field, so these always showed a fake "0 paid". */}
              <CustomOrderCard
                title="Total Revenue"
                amount={formatToNaira(totalRevenue)}
                type="revenue"
              />
              <CustomOrderCard
                title="Completed Orders"
                amount={completedOrders}
                type="completed"
                subtitle={`${successRate}% success rate`}
              />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <CustomOrderCard title="Total Orders" amount={totalOrders} type="total" />
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
              />
              <CustomOrderCard
                title="Delivery Cost"
                amount={formatToNaira(totalDeliveryCost)}
                type="cost"
                subtitle="across active deliveries"
              />
              {/* "Total Link Visits" removed — its number was fabricated
                  (totalOrders * 2.6), not a real backend stat. */}
            </div>
          )}
        </div>
      </div>

      {/* Main Content Section */}
      <div className="w-full flex flex-col gap-5">
        {/* Tabs Header — standalone segmented control, not part of the table */}
        <div className="w-full flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-white rounded-xl border border-border-tint px-3 py-2.5">
          <div className="flex items-center gap-1">
            <button
              onClick={() => handleTabChange("INSTORE")}
              className={cn(
                "flex items-center px-4 py-2 rounded-lg text-xs sm:text-sm cursor-pointer font-bold transition-all",
                activeTab === "INSTORE"
                  ? "bg-secondary-6 text-primary-green-300"
                  : "text-grey-3 hover:text-grey-2",
              )}
            >
              Instore order
              {activeTab === "INSTORE" && (
                <span className="ml-2 text-[10px] px-2 py-1 rounded-full font-extrabold bg-primary-green-300 text-white">
                  {instoreCount}
                </span>
              )}
            </button>
            <button
              onClick={() => handleTabChange("OUTSTORE")}
              className={cn(
                "flex items-center px-4 py-2 rounded-lg text-xs sm:text-sm font-bold cursor-pointer transition-all",
                activeTab === "OUTSTORE"
                  ? "bg-secondary-6 text-primary-green-300"
                  : "text-grey-3 hover:text-grey-2",
              )}
            >
              Out-store Orders
              {activeTab === "OUTSTORE" && (
                <span className="ml-2 text-[10px] px-2 py-1 rounded-full font-extrabold bg-primary-green-300 text-white">
                  {outstoreCount}
                </span>
              )}
            </button>
          </div>

          {/* Store URL Copy Section */}
          {findBusiness?.store_url && (
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="flex items-center gap-2 bg-grey-6 rounded-lg px-3 py-2 flex-1 sm:flex-none">
                <ExternalLink className="w-4 h-4 text-grey-4 flex-shrink-0" />
                <span className="text-xs font-medium text-grey-3 truncate max-w-[200px] sm:max-w-[250px]">
                  {getStoreUrl()}
                </span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyUrl}
                className={cn(
                  "text-xs transition-all flex-shrink-0",
                  copiedUrl
                    ? "bg-success-2 border-success-1/30 text-success-1 hover:bg-success-2"
                    : "border-primary-green-300 text-primary-green-300 hover:bg-primary-green-300/10 hover:text-primary-green-300",
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

        {/* Status sub-tabs (per spec) */}
        <div className="w-full border-b border-border-tint overflow-x-auto">
          <div className="flex min-w-max">
            {statusTabs.map((tab) => {
              const isActive = activeStatusTab === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => handleStatusTabChange(tab.key)}
                  className={cn(
                    "px-4 py-2.5 text-xs sm:text-sm font-bold cursor-pointer border-b-2 transition-all whitespace-nowrap",
                    isActive
                      ? "border-primary-green-300 text-primary-green-300"
                      : "border-transparent text-grey-3 hover:text-grey-2 hover:border-grey-5",
                  )}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Search and Actions Header */}
        <div className="w-full">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
            {/* Quick date presets */}
            <div className="flex flex-wrap gap-2">
              {(
                [
                  { key: "today", label: "Today" },
                  { key: "week", label: "This Week" },
                  { key: "month", label: "This Month" },
                ] as const
              ).map((preset) => (
                <button
                  key={preset.key}
                  onClick={() => handleDatePreset(preset.key)}
                  className={cn(
                    "text-sm font-bold px-4 py-1.5 rounded-full border transition-colors cursor-pointer",
                    datePreset === preset.key
                      ? "bg-primary-green-300 border-primary-green-300 text-white"
                      : "border-grey-5 text-grey-2 hover:bg-secondary-6",
                  )}
                >
                  {preset.label}
                </button>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full lg:w-auto">
              <div className="w-full sm:w-72">
                <SearchInput
                  placeholder="Search by customer name, order ID..."
                  value={searchInput}
                  onValueChange={handleSearchChange}
                />
                {searchInput.length > 0 && searchInput.length < 3 && (
                  <div className="mt-1 text-xs sm:text-sm font-medium text-grey-3">
                    Type at least 3 characters to search
                  </div>
                )}
              </div>
              <div className="flex gap-2 w-full sm:w-auto shrink-0">
                <Button
                  variant="outline"
                  className="flex-1 sm:flex-none text-sm rounded-xl relative border-grey-5 text-grey-2 hover:bg-grey-6 hover:text-grey-2"
                  onClick={() => setOpenFilterModal(true)}
                >
                  <FilterIcon className="w-4 h-4 mr-2" />
                  Filter
                  {getActiveFilterCount() > 0 && (
                    <span className="absolute -top-2 -right-2 bg-primary-green-300 text-white text-[10px] rounded-full w-5 h-5 flex items-center justify-center">
                      {getActiveFilterCount()}
                    </span>
                  )}
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 sm:flex-none text-sm rounded-xl border-grey-5 text-grey-2 hover:bg-grey-6 hover:text-grey-2"
                >
                  Export
                </Button>
              </div>
            </div>
          </div>

          {/* Active Filters Display */}
          {(filters.shipping_status ||
            filters.payment_status ||
            filters.sales_staff ||
            filters.delivery_company) && (
            <div className="flex flex-wrap gap-2 mt-3">
              {filters.shipping_status && (
                <div className="flex items-center gap-2 bg-secondary-6 border border-secondary-3 text-primary-green-100 px-3 py-1 rounded-full text-xs font-bold">
                  <span>Shipping: {filters.shipping_status}</span>
                  <button
                    onClick={() => {
                      setFilters((prev) => ({ ...prev, shipping_status: "" }));
                      setActiveStatusTab("ALL");
                    }}
                    className="hover:bg-secondary-5 rounded-full p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}
              {filters.payment_status && (
                <div className="flex items-center gap-2 bg-secondary-6 border border-secondary-3 text-primary-green-100 px-3 py-1 rounded-full text-xs font-bold">
                  <span>Payment: {filters.payment_status}</span>
                  <button
                    onClick={() =>
                      setFilters((prev) => ({ ...prev, payment_status: "" }))
                    }
                    className="hover:bg-secondary-5 rounded-full p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}
              {filters.sales_staff && (
                <div className="flex items-center gap-2 bg-secondary-6 border border-secondary-3 text-primary-green-100 px-3 py-1 rounded-full text-xs font-bold">
                  <span>Staff: {filters.sales_staff}</span>
                  <button
                    onClick={() =>
                      setFilters((prev) => ({ ...prev, sales_staff: "" }))
                    }
                    className="hover:bg-secondary-5 rounded-full p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}
              {filters.delivery_company && (
                <div className="flex items-center gap-2 bg-secondary-6 border border-secondary-3 text-primary-green-100 px-3 py-1 rounded-full text-xs font-bold">
                  <span>Delivery: {filters.delivery_company}</span>
                  <button
                    onClick={() =>
                      setFilters((prev) => ({ ...prev, delivery_company: "" }))
                    }
                    className="hover:bg-secondary-5 rounded-full p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}
              <button
                onClick={handleResetFilters}
                className="text-xs font-bold text-primary-green-300 hover:text-primary-green-100 underline"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>

        {/* Card grid (replaces the previous table layout) */}
        <div className="w-full">
          {OrderDataLoading ? (
            <CardGridSkeleton count={6} cardHeight="h-40" />
          ) : ordersData?.results?.data?.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
                {ordersData.results.data.map((order: any) => (
                  <OrderCard
                    key={order.id}
                    order={order}
                    type={activeTab}
                    onAssignDelivery={(id) => {
                      setAssignTargetOrderId(id);
                      setOpenAssignDelivery(true);
                    }}
                  />
                ))}
              </div>
              <CustomPagination
                currentPage={page}
                totalPages={ordersData?.pages || 1}
                total={ordersData?.total}
                pageSize={ordersData?.limit}
                onPageChange={setPage}
                className="mt-4 border-t border-grey-6"
              />
            </>
          ) : (
            <div className="w-full h-64 flex flex-col justify-center items-center">
              <NoOrders />
            </div>
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
            <label className="block text-sm font-bold text-grey-2 mb-2">
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
              className="w-full px-3 py-2 border border-grey-5 rounded-lg focus:outline-none focus:ring-2 focus:ring-grey-4"
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
            <label className="block text-sm font-bold text-grey-2 mb-2">
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
              className="w-full px-3 py-2 border border-grey-5 rounded-lg focus:outline-none focus:ring-2 focus:ring-grey-4"
            >
              <option value="">All Payment Status</option>
              <option value="UNPAID">Unpaid</option>
              <option value="PAID">Paid</option>
              <option value="PARTIAL">Partial</option>
            </select>
          </div>

          {/* Sales Staff Filter (mock list) */}
          <div>
            <label className="block text-sm font-bold text-grey-2 mb-2">
              Sales Staff
            </label>
            <select
              value={tempFilters.sales_staff}
              onChange={(e) =>
                setTempFilters((prev) => ({
                  ...prev,
                  sales_staff: e.target.value,
                }))
              }
              className="w-full px-3 py-2 border border-grey-5 rounded-lg focus:outline-none focus:ring-2 focus:ring-grey-4"
            >
              <option value="">All Sales Staff</option>
              {MOCK_SALES_STAFF.map((staff) => (
                <option key={staff} value={staff}>
                  {staff}
                </option>
              ))}
            </select>
          </div>

          {/* Delivery Company Filter (mock list) */}
          <div>
            <label className="block text-sm font-bold text-grey-2 mb-2">
              Delivery Company
            </label>
            <select
              value={tempFilters.delivery_company}
              onChange={(e) =>
                setTempFilters((prev) => ({
                  ...prev,
                  delivery_company: e.target.value,
                }))
              }
              className="w-full px-3 py-2 border border-grey-5 rounded-lg focus:outline-none focus:ring-2 focus:ring-grey-4"
            >
              <option value="">All Delivery Companies</option>
              {MOCK_DELIVERY_COMPANIES.map((company) => (
                <option key={company} value={company}>
                  {company}
                </option>
              ))}
            </select>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              className="flex-1 border-grey-5 text-grey-2 hover:bg-grey-6 hover:text-grey-2"
              onClick={() => {
                setTempFilters({
                  order_type: activeTab,
                  shipping_status: "",
                  payment_status: "",
                  sales_staff: "",
                  delivery_company: "",
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
      {/* open subscription  Modal */}
      <CustomModal
        isOpen={openSubscriptionModal}
        onClose={() => setOpenSubscriptionModal(false)}
        title="Create an online payment"
      >
        <Payment />
      </CustomModal>

      <AssignDeliveryModal
        isOpen={openAssignDelivery}
        onClose={() => setOpenAssignDelivery(false)}
        orderId={assignTargetOrderId}
      />
    </div>
  );
};

export default Orders;

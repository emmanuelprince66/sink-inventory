"use client";

import { CustomTable } from "@/components/app/CutomTable";
import { DatePickerWithRange } from "@/components/app/DateRangePicker";
import { SummaryCardSkeleton } from "@/components/app/SummaryCardSkeleton";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  PRODUCT_HISTORY_TABS,
  useProductHistoryHook,
} from "@/hooks/useProductHistoryHook";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import {
  AlertTriangle,
  Banknote,
  Package,
  RotateCcw,
  Trash2,
} from "lucide-react";
import { formatToNaira } from "@/utils/formatMoney";
import { createProductHistoryColumns } from "./ProductHistoryColumns";

const tabIcons = {
  WASTE: Trash2,
  RETURN: RotateCcw,
  DAMAGE: AlertTriangle,
};

const tabColors = {
  WASTE: {
    bg: "bg-error-2",
    icon: "text-error-1",
    value: "text-error-1",
  },
  RETURN: {
    bg: "bg-info-2",
    icon: "text-info-1",
    value: "text-info-1",
  },
  DAMAGE: {
    bg: "bg-warning-2",
    icon: "text-warning-1",
    value: "text-warning-1",
  },
};

const ProductHistory = () => {
  const {
    activeTab,
    setActiveTab,
    results,
    total,
    totalPages,
    totalValue,
    isLoading,
    isFetching,
    page,
    pageSize,
    handlePageChange,
    handlePageSizeChange,
    dateRange,
    setDateRange,
    appliedDateRange,
    departmentFilter,
    setDepartmentFilter,
    DepartmentData,
    handleApplyFilters,
    handleResetFilters,
  } = useProductHistoryHook();

  const columns = createProductHistoryColumns();

  const colors = tabColors[activeTab];
  const activeTabLabel =
    PRODUCT_HISTORY_TABS.find((t) => t.value === activeTab)?.label || "Records";
  const ActiveIcon = tabIcons[activeTab];

  const hasActiveFilters = !!(dateRange?.from || departmentFilter);

  const formatCurrency = (value: number) => formatToNaira(value);

  return (
    <div className="w-full flex flex-col gap-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-grey-1">
          Product History
        </h1>
        <p className="text-grey-3 mt-1 text-sm">
          Track waste, returns, and damaged product records
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl">
        {isLoading || isFetching ? (
          <>
            <SummaryCardSkeleton />
            <SummaryCardSkeleton />
          </>
        ) : (
          <>
            <div className={cn("rounded-2xl p-4 sm:p-5 flex items-center gap-4", colors.bg)}>
              <div className="p-2.5 rounded-full bg-white/60">
                <ActiveIcon className={cn("h-5 w-5", colors.icon)} />
              </div>
              <div>
                <p className="text-sm font-medium text-grey-3">Total Records</p>
                <p className={cn("text-2xl font-extrabold", colors.value)}>
                  {total}
                </p>
              </div>
            </div>

            <div className={cn("rounded-2xl p-4 sm:p-5 flex items-center gap-4", colors.bg)}>
              <div className="p-2.5 rounded-full bg-white/60">
                <Banknote className={cn("h-5 w-5", colors.icon)} />
              </div>
              <div>
                <p className="text-sm font-medium text-grey-3">Total Value</p>
                <p className={cn("text-2xl font-extrabold", colors.value)}>
                  {formatCurrency(totalValue)}
                </p>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Main Content Card */}
      <div className="w-full rounded-2xl border border-grey-5 bg-white overflow-hidden">
        {/* Tabs */}
        <div className="border-b border-grey-5 px-4 sm:px-6">
          <div className="flex items-center gap-6">
            {PRODUCT_HISTORY_TABS.map((tab) => {
              const Icon = tabIcons[tab.value];
              const isActive = activeTab === tab.value;
              return (
                <button
                  key={tab.value}
                  onClick={() => setActiveTab(tab.value)}
                  className={cn(
                    "flex items-center gap-1.5 py-4 text-sm cursor-pointer font-bold border-b-2 transition-colors",
                    isActive
                      ? "border-primary-green-300 text-primary-green-300"
                      : "border-transparent text-grey-3 hover:text-grey-2",
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Toolbar */}
        <div className="p-4 sm:p-6 border-b border-grey-5">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <h2 className="text-base font-extrabold text-grey-1">
                {activeTabLabel}
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-grey-6 text-grey-3">
                {total}
              </span>
              {isFetching && (
                <div className="flex items-center gap-2 text-xs text-grey-3">
                  <div className="w-1.5 h-1.5 bg-primary-green-300 rounded-full animate-pulse" />
                  Updating...
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full lg:w-auto">
              <div className="w-full sm:w-48">
                <DatePickerWithRange
                  date={dateRange}
                  onDateChange={setDateRange}
                  className="w-full"
                />
              </div>
              <div className="w-full sm:w-40">
                <Select
                  value={departmentFilter}
                  onValueChange={setDepartmentFilter}
                >
                  <SelectTrigger className="w-full h-9 min-h-9">
                    <SelectValue placeholder="All Departments" />
                  </SelectTrigger>
                  <SelectContent className="w-full">
                    <SelectItem value="all" className="w-full">
                      All Departments
                    </SelectItem>
                    {DepartmentData?.data?.map((dept: any) => (
                      <SelectItem key={dept.id} value={dept.id}>
                        {dept.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button
                onClick={handleApplyFilters}
                className="h-9 px-4 shrink-0"
                disabled={isFetching}
              >
                {isFetching ? "Applying..." : "Apply"}
              </Button>
              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleResetFilters}
                  title="Reset filters"
                  className="text-grey-3 hover:text-error-1 shrink-0"
                >
                  <RotateCcw className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>

          {/* Active Filters Pills */}
          {hasActiveFilters && (
            <div className="flex flex-wrap gap-2 items-center mt-3">
              {dateRange?.from && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-success-2 text-success-1">
                  {format(dateRange.from, "MMM dd")}
                  {dateRange.to && ` - ${format(dateRange.to, "MMM dd")}`}
                </span>
              )}

              {departmentFilter && departmentFilter !== "all" && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-secondary-1 text-white">
                  {DepartmentData?.data?.find(
                    (d: any) => d.id === departmentFilter,
                  )?.name || departmentFilter}
                </span>
              )}
            </div>
          )}
        </div>

        <CustomTable
          bordered={false}
          columns={columns}
          data={results}
          loading={isLoading || isFetching}
          noDataText={
            <div className="py-12 text-center">
              <div className="w-16 h-16 bg-grey-6 rounded-full flex items-center justify-center mx-auto mb-4">
                <Package className="h-8 w-8 text-grey-4" />
              </div>
              <h3 className="text-lg font-bold text-grey-1 mb-1">
                No records found
              </h3>
              <p className="text-grey-3">
                No {activeTab.toLowerCase()} history records available
              </p>
            </div>
          }
          pagination={{
            currentPage: page,
            totalPages,
            pageSize,
            onPageChange: handlePageChange,
            onPageSizeChange: handlePageSizeChange,
          }}
        />
      </div>
    </div>
  );
};

export default ProductHistory;

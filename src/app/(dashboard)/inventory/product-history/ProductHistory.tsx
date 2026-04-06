"use client";

import { CustomTable } from "@/components/app/CutomTable";
import { DatePickerWithRange } from "@/components/app/DateRangePicker";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  CalendarDays,
  Banknote,
  Package,
  RotateCcw,
  SlidersHorizontal,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import { formatToNaira } from "@/utils/formatMoney";
import { createProductHistoryColumns } from "./ProductHistoryColumns";
import { ProductHistorySkeleton } from "./ProductHistorySkeleton";

const tabIcons = {
  WASTE: Trash2,
  RETURN: RotateCcw,
  DAMAGE: AlertTriangle,
};

const tabColors = {
  WASTE: {
    bg: "bg-red-50",
    border: "border-red-100",
    icon: "text-red-500",
    value: "text-red-700",
  },
  RETURN: {
    bg: "bg-blue-50",
    border: "border-blue-100",
    icon: "text-blue-500",
    value: "text-blue-700",
  },
  DAMAGE: {
    bg: "bg-amber-50",
    border: "border-amber-100",
    icon: "text-amber-500",
    value: "text-amber-700",
  },
};

const ProductHistory = () => {
  const [isFiltersExpanded, setIsFiltersExpanded] = useState(false);

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

  if (isLoading) {
    return <ProductHistorySkeleton />;
  }

  const colors = tabColors[activeTab];
  const activeTabLabel =
    PRODUCT_HISTORY_TABS.find((t) => t.value === activeTab)?.label || "Records";
  const ActiveIcon = tabIcons[activeTab];

  const hasActiveFilters = !!(dateRange?.from || departmentFilter);

  const formatCurrency = (value: number) => formatToNaira(value);

  return (
    <div className="min-h-screen bg-slate-50/50 pb-12">
      {/* Header Section */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                Product History
              </h1>
              <p className="text-slate-500 mt-1 text-sm sm:text-base">
                Track waste, returns, and damaged product records
              </p>
            </div>
            <div className="flex items-center gap-3" />
          </div>
        </div>
      </div>

      <div className="max-w-full mx-auto px-4 sm:px-6 py-8 space-y-6">
        {/* Tabs */}
        <div className="flex gap-2 flex-wrap">
          {PRODUCT_HISTORY_TABS.map((tab) => {
            const Icon = tabIcons[tab.value];
            return (
              <button
                key={tab.value}
                onClick={() => setActiveTab(tab.value)}
                className={cn(
                  "inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all cursor-pointer",
                  activeTab === tab.value
                    ? "bg-green-600 text-white shadow-sm shadow-green-500/20"
                    : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 hover:text-slate-900",
                )}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl">
          <Card className={cn("shadow-sm border", colors.border, colors.bg)}>
            <CardContent className="p-4 sm:p-5 flex items-center gap-4">
              <div className={cn("p-2.5 rounded-full bg-white/80")}>
                <ActiveIcon className={cn("h-5 w-5", colors.icon)} />
              </div>
              <div>
                <p className="text-sm text-slate-500">Total Records</p>
                <p className={cn("text-2xl font-bold", colors.value)}>
                  {total}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className={cn("shadow-sm border", colors.border, colors.bg)}>
            <CardContent className="p-4 sm:p-5 flex items-center gap-4">
              <div className={cn("p-2.5 rounded-full bg-white/80")}>
                <Banknote className={cn("h-5 w-5", colors.icon)} />
              </div>
              <div>
                <p className="text-sm text-slate-500">Total Value</p>
                <p className={cn("text-2xl font-bold", colors.value)}>
                  {formatCurrency(totalValue)}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters Section */}
        <Card className="shadow-sm border-0 ring-1 ring-slate-200/60 overflow-hidden max-w-full">
          <CardHeader className="bg-gradient-to-r from-slate-50/80 to-white border-b border-slate-100 py-4 px-5">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold text-slate-800 flex items-center gap-2">
                <div className="p-1.5 bg-green-50 rounded-lg">
                  <SlidersHorizontal className="h-4 w-4 text-green-600" />
                </div>
                <span>Filters</span>
              </CardTitle>

              <Button
                variant="ghost"
                size="sm"
                className="sm:hidden text-slate-600"
                onClick={() => setIsFiltersExpanded(!isFiltersExpanded)}
              >
                {isFiltersExpanded ? "Hide" : "Show"}
              </Button>
            </div>
          </CardHeader>

          <CardContent
            className={cn(
              "p-5 transition-all duration-300 ease-in-out max-w-4xl",
              !isFiltersExpanded && "hidden sm:block",
            )}
          >
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* Date Range Picker */}
                <div className="relative">
                  <DatePickerWithRange
                    date={dateRange}
                    onDateChange={setDateRange}
                    className="w-full"
                  />
                </div>

                {/* Department Filter */}
                <div>
                  <Select
                    value={departmentFilter}
                    onValueChange={setDepartmentFilter}
                  >
                    <SelectTrigger className="min-h-[14px] w-full bg-slate-50/50 border-slate-200 focus:bg-white focus:border-green-500 focus:ring-2 focus:ring-green-500/20 rounded-lg">
                      <SelectValue placeholder="All Departments" />
                    </SelectTrigger>
                    <SelectContent className="rounded-lg w-full border-slate-200 shadow-lg">
                      <SelectItem value="all" className="rounded-md w-full">
                        All Departments
                      </SelectItem>
                      {DepartmentData?.data?.map((dept: any) => (
                        <SelectItem
                          key={dept.id}
                          value={dept.id}
                          className="rounded-md"
                        >
                          {dept.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-2 border-t border-slate-100">
                <div className="flex gap-2 flex-1">
                  <Button
                    onClick={handleApplyFilters}
                    className="flex-1 sm:flex-none h-10 px-6 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium shadow-sm shadow-green-500/20 transition-all active:scale-[0.98]"
                    disabled={isFetching}
                  >
                    {isFetching ? "Applying..." : "Apply Filters"}
                  </Button>

                  <Button
                    onClick={handleResetFilters}
                    variant="outline"
                    className={cn(
                      "h-10 px-4 rounded-lg border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-all",
                      !hasActiveFilters && "opacity-50 cursor-not-allowed",
                    )}
                    disabled={!hasActiveFilters}
                  >
                    Reset
                  </Button>
                </div>

                {/* Active Filters Pills */}
                {hasActiveFilters && (
                  <div className="flex flex-wrap gap-2 items-center sm:justify-end">
                    <span className="text-xs text-slate-500 font-medium uppercase tracking-wider hidden sm:inline">
                      Active:
                    </span>

                    {dateRange?.from && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700">
                        <CalendarDays className="h-3 w-3" />
                        {format(dateRange.from, "MMM dd")}
                        {dateRange.to && ` - ${format(dateRange.to, "MMM dd")}`}
                      </span>
                    )}

                    {departmentFilter && departmentFilter !== "all" && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-purple-50 text-purple-700">
                        {DepartmentData?.data?.find(
                          (d: any) => d.id === departmentFilter,
                        )?.name || departmentFilter}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Table Card */}
        <Card className="shadow-sm border-0 ring-1 ring-slate-200/60 overflow-hidden">
          <CardHeader className="bg-white border-b border-slate-100 py-4 px-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CardTitle className="text-base font-semibold text-slate-800">
                  {activeTabLabel}
                </CardTitle>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                  {total}
                </span>
              </div>

              {isFetching && (
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  Updating...
                </div>
              )}
            </div>
          </CardHeader>

          <div className="overflow-x-auto">
            <CustomTable
              columns={columns}
              data={results}
              loading={isFetching}
              noDataText={
                <div className="py-12 text-center">
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Package className="h-8 w-8 text-slate-400" />
                  </div>
                  <h3 className="text-lg font-medium text-slate-900 mb-1">
                    No records found
                  </h3>
                  <p className="text-slate-500">
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
        </Card>
      </div>
    </div>
  );
};

export default ProductHistory;

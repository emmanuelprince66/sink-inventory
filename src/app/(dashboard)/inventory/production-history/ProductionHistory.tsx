// app/production-history/page.tsx
"use client";

import { CustomTable } from "@/components/app/CutomTable";
import { DatePickerWithRange } from "@/components/app/DateRangePicker";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useProductionHistory } from "@/hooks/useProductionHistory";
import { useUserRole } from "@/lib/store/user-store";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import {
  CalendarDays,
  Package,
  PackageMinus,
  RotateCcw,
  Search,
  SlidersHorizontal,
  TrendingUp,
  X,
} from "lucide-react";
import { useState } from "react";
import { createProductionHistoryColumns } from "./ProductionHistoryColunm";
import { ProductionHistorySkeleton } from "./ProductionHistorySkeleton";

const ProductionHistoryPage = () => {
  const { role } = useUserRole();

  // Check if user can manage production (OWNER, ADMIN-ATTENDANT, or PRODUCTION-MANAGER)
  const allowedRoles = ["OWNER", "ADMIN-ATTENDANT", "PRODUCTION-MANAGER"];
  const canManageProduction = role ? allowedRoles.includes(role) : false;

  const [isFiltersExpanded, setIsFiltersExpanded] = useState(false);

  const {
    data,
    isLoading,
    isFetching,
    searchInput,
    setSearchInput,
    dateRange,
    setDateRange,
    statusFilter,
    setStatusFilter,
    page,
    setPage,
    pageSize,
    setPageSize,
    handleApplyFilters,
    handleResetFilters,
    removeFilter,
    activeFiltersCount,
    hasActiveFilters,
    handleReceiveProduct,
    isAccepting,
  } = useProductionHistory();

  console.log("Production History Data:", data);

  const productionStats = {
    total: data?.data?.results?.total || 0,
    received: data?.data?.results?.received || 0,
    moved: data?.data?.results?.moved || 0,
  };

  console.log("Production Stats:", productionStats);

  const formatNumber = (value: number) =>
    new Intl.NumberFormat("en-NG").format(value);

  const columns = createProductionHistoryColumns({
    canManageProduction,
    onReceive: handleReceiveProduct,
    isAccepting,
  });

  if (isLoading) {
    return <ProductionHistorySkeleton />;
  }

  return (
    <div className="min-h-screen bg-slate-50/50 pb-12">
      {/* Header Section */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                Production History
              </h1>
              <p className="text-slate-500 mt-1 text-sm sm:text-base">
                {canManageProduction
                  ? "Manage and receive production units"
                  : "Track production movement and status"}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-slate-100 rounded-full text-sm text-slate-600">
                <Package className="h-4 w-4" />
                <span>{data?.total || 0} records</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-full mx-auto px-4 sm:px-6 py-8 space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl">
          <Card className="shadow-sm border border-emerald-100 bg-emerald-50">
            <CardContent className="p-4 sm:p-5 flex items-center gap-4">
              <div className="p-2.5 rounded-full bg-white/80">
                <TrendingUp className="h-5 w-5 text-emerald-500" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Total Production</p>
                <p className="text-2xl font-bold text-emerald-700">
                  {formatNumber(productionStats.total)}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm border border-amber-100 bg-amber-50">
            <CardContent className="p-4 sm:p-5 flex items-center gap-4">
              <div className="p-2.5 rounded-full bg-white/80">
                <PackageMinus className="h-5 w-5 text-amber-500" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Moved</p>
                <p className="text-2xl font-bold text-amber-700">
                  {formatNumber(productionStats.moved)}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters Section */}
        <Card className="shadow-sm border-0 ring-1 ring-slate-200/60 overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-slate-50/80 to-white border-b border-slate-100 py-4 px-5">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold text-slate-800 flex items-center gap-2">
                <div className="p-1.5 bg-green-50 rounded-lg">
                  <SlidersHorizontal className="h-4 w-4 text-green-600" />
                </div>
                <span>Filters</span>
                {activeFiltersCount > 0 && (
                  <span className="ml-2 inline-flex items-center justify-center w-5 h-5 text-xs font-medium text-white bg-green-600 rounded-full">
                    {activeFiltersCount}
                  </span>
                )}
              </CardTitle>

              {/* Mobile Filter Toggle */}
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
              "p-5 transition-all duration-300 ease-in-out",
              !isFiltersExpanded && "hidden sm:block",
            )}
          >
            <div className="flex flex-col gap-4">
              {/* Search and Date Row */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                {/* Search Input */}
                <div className="md:col-span-4 relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-4 w-4 text-slate-400 group-focus-within:text-green-500 transition-colors" />
                  </div>
                  <Input
                    type="text"
                    placeholder="Search by product name..."
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    className="pl-10 max-h-[35px] bg-slate-50/50 border-slate-200 focus:bg-white focus:border-green-500 focus:ring-2 focus:ring-green-500/20 rounded-lg transition-all"
                    onKeyDown={(e) => e.key === "Enter" && handleApplyFilters()}
                  />
                </div>

                {/* Date Range Picker */}
                <div className="md:col-span-4 relative">
                  <DatePickerWithRange
                    date={dateRange}
                    onDateChange={setDateRange}
                    className="w-full"
                  />
                </div>

                {/* Status Filter */}
                <div className="md:col-span-4">
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="min-h-[14px] w-full bg-slate-50/50 border-slate-200 focus:bg-white focus:border-green-500 focus:ring-2 focus:ring-green-500/20 rounded-lg">
                      <SelectValue placeholder="All Status" />
                    </SelectTrigger>
                    <SelectContent className="rounded-lg w-full border-slate-200 shadow-lg">
                      <SelectItem value="all" className="rounded-md w-full">
                        All Status
                      </SelectItem>
                      <SelectItem value="MOVED" className="rounded-md">
                        Moved
                      </SelectItem>
                      <SelectItem value="RECEIVED" className="rounded-md">
                        Received
                      </SelectItem>
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
                    {isFetching ? (
                      <span className="flex items-center gap-2">
                        <svg
                          className="animate-spin h-4 w-4"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                            fill="none"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          />
                        </svg>
                        Applying...
                      </span>
                    ) : (
                      "Apply Filters"
                    )}
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
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Reset
                  </Button>
                </div>

                {/* Active Filters Pills */}
                {hasActiveFilters && (
                  <div className="flex flex-wrap gap-2 items-center sm:justify-end">
                    <span className="text-xs text-slate-500 font-medium uppercase tracking-wider hidden sm:inline">
                      Active:
                    </span>

                    {searchInput && (
                      <button
                        onClick={() => removeFilter("search")}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-green-50 text-green-700 hover:bg-green-100 transition-colors group"
                      >
                        Search:{" "}
                        {searchInput.length > 15
                          ? searchInput.slice(0, 15) + "..."
                          : searchInput}
                        <X className="h-3 w-3 group-hover:scale-110 transition-transform" />
                      </button>
                    )}

                    {dateRange?.from && (
                      <button
                        onClick={() => removeFilter("date")}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors group"
                      >
                        <CalendarDays className="h-3 w-3" />
                        {format(dateRange.from, "MMM dd")}
                        {dateRange.to && ` - ${format(dateRange.to, "MMM dd")}`}
                        <X className="h-3 w-3 group-hover:scale-110 transition-transform" />
                      </button>
                    )}

                    {statusFilter && statusFilter !== "all" && (
                      <button
                        onClick={() => removeFilter("status")}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-purple-50 text-purple-700 hover:bg-purple-100 transition-colors group"
                      >
                        {statusFilter}
                        <X className="h-3 w-3 group-hover:scale-110 transition-transform" />
                      </button>
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
                  Production Records
                </CardTitle>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                  {data?.total || 0}
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
              data={data?.data?.results || []}
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
                    Try adjusting your filters or search query
                  </p>
                </div>
              }
              pagination={{
                currentPage: page,
                totalPages: data?.pages || 1,
                pageSize,
                onPageChange: setPage,
                onPageSizeChange: (newSize) => {
                  setPageSize(newSize);
                  setPage(1);
                },
              }}
            />
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ProductionHistoryPage;

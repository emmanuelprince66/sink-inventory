// app/production-history/page.tsx
"use client";

import { CustomTable } from "@/components/app/CutomTable";
import { DatePickerWithRange } from "@/components/app/DateRangePicker";
import { SearchInput } from "@/components/app/SearchInput";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useProductionHistory } from "@/hooks/useProductionHistory";
import { useUserRole } from "@/lib/store/user-store";
import { formatToNaira } from "@/utils/formatMoney";
import { format } from "date-fns";
import {
  Package,
  PackageMinus,
  RotateCcw,
  TrendingUp,
} from "lucide-react";
import { createProductionHistoryColumns } from "./ProductionHistoryColunm";
import { ProductionHistorySkeleton } from "./ProductionHistorySkeleton";

const ProductionHistoryPage = () => {
  const { role } = useUserRole();

  // Check if user can manage production (OWNER, ADMIN-ATTENDANT, or PRODUCTION-MANAGER)
  const allowedRoles = ["OWNER", "ADMIN-ATTENDANT", "PRODUCTION-MANAGER"];
  const canManageProduction = role ? allowedRoles.includes(role) : false;

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
    hasActiveFilters,
    handleReceiveProduct,
    isAccepting,
  } = useProductionHistory();

  const productionStats = {
    total: data?.data?.results?.total || 0,
    received: data?.data?.results?.received || 0,
    moved: data?.data?.results?.moved || 0,
  };

  const formatNumber = (value: number) => formatToNaira(value);

  const columns = createProductionHistoryColumns({
    canManageProduction,
    onReceive: handleReceiveProduct,
    isAccepting,
  });

  if (isLoading) {
    return <ProductionHistorySkeleton />;
  }

  return (
    <div className="px-4 py-6 w-full flex flex-col gap-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-grey-1">
          Production History
        </h1>
        <p className="text-grey-3 mt-1 text-sm">
          {canManageProduction
            ? "Manage and receive production units"
            : "Track production movement and status"}
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl">
        <div className="bg-success-2 rounded-2xl p-4 sm:p-5 flex items-center gap-4">
          <div className="p-2.5 rounded-full bg-white/60">
            <TrendingUp className="h-5 w-5 text-success-1" />
          </div>
          <div>
            <p className="text-sm font-medium text-grey-3">Total Production Cost</p>
            <p className="text-2xl font-extrabold text-success-1">
              {formatNumber(productionStats.total)}
            </p>
          </div>
        </div>

        <div className="bg-warning-2 rounded-2xl p-4 sm:p-5 flex items-center gap-4">
          <div className="p-2.5 rounded-full bg-white/60">
            <PackageMinus className="h-5 w-5 text-warning-1" />
          </div>
          <div>
            <p className="text-sm font-medium text-grey-3">Moved</p>
            <p className="text-2xl font-extrabold text-warning-1">
              {new Intl.NumberFormat("en-NG").format(productionStats.moved)}
            </p>
          </div>
        </div>
      </div>

      {/* Main Content Card */}
      <div className="w-full rounded-2xl border border-grey-5 bg-white overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 sm:p-6 border-b border-grey-5">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <h2 className="text-base font-extrabold text-grey-1">
                Production Records
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-grey-6 text-grey-3">
                {data?.total || 0}
              </span>
              {isFetching && (
                <div className="flex items-center gap-2 text-xs text-grey-3">
                  <div className="w-1.5 h-1.5 bg-primary-green-300 rounded-full animate-pulse" />
                  Updating...
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full lg:w-auto">
              <div className="w-full sm:w-52">
                <SearchInput
                  placeholder="Search by product name..."
                  value={searchInput}
                  onValueChange={setSearchInput}
                  className="h-9"
                />
              </div>
              <div className="w-full sm:w-40">
                <DatePickerWithRange
                  date={dateRange}
                  onDateChange={setDateRange}
                  className="w-full"
                />
              </div>
              <div className="w-full sm:w-32">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full h-9 min-h-9">
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent className="w-full">
                    <SelectItem value="all" className="w-full">
                      All Status
                    </SelectItem>
                    <SelectItem value="MOVED">Moved</SelectItem>
                    <SelectItem value="RECEIVED">Received</SelectItem>
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
              {searchInput && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-primary-green-300/10 text-primary-green-300">
                  Search:{" "}
                  {searchInput.length > 15
                    ? searchInput.slice(0, 15) + "..."
                    : searchInput}
                </span>
              )}

              {dateRange?.from && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-success-2 text-success-1">
                  {format(dateRange.from, "MMM dd")}
                  {dateRange.to && ` - ${format(dateRange.to, "MMM dd")}`}
                </span>
              )}

              {statusFilter && statusFilter !== "all" && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-secondary-1 text-white">
                  {statusFilter}
                </span>
              )}
            </div>
          )}
        </div>

        <CustomTable
          bordered={false}
          columns={columns}
          data={data?.data?.results?.data || []}
          loading={isFetching}
          noDataText={
            <div className="py-12 text-center">
              <div className="w-16 h-16 bg-grey-6 rounded-full flex items-center justify-center mx-auto mb-4">
                <Package className="h-8 w-8 text-grey-4" />
              </div>
              <h3 className="text-lg font-bold text-grey-1 mb-1">
                No records found
              </h3>
              <p className="text-grey-3">
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
    </div>
  );
};

export default ProductionHistoryPage;

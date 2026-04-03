"use client";

import { useFetchAllRestockHistoryQuery } from "@/api/restock/fetch-all-restock-history";
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
import { useBusinessStore } from "@/lib/store/useBusinessStore";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import {
  CalendarDays,
  Package,
  RotateCcw,
  Search,
  SlidersHorizontal,
  Users,
  X,
} from "lucide-react";
import { useState } from "react";
import { DateRange } from "react-day-picker";
import { allRestockHistoryColumns } from "./AllRestockColunm";
import { RestockHistorySkeleton } from "./AllRestockSkeleton";

const RestockHistoryPage = () => {
  const business_id = useBusinessStore((state) => state.business_id);

  // Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [userFilter, setUserFilter] = useState("");
  const [isFiltersExpanded, setIsFiltersExpanded] = useState(false);
  const [appliedFilters, setAppliedFilters] = useState({
    search: "",
    dateRange: undefined as DateRange | undefined,
    user: "",
  });

  // Pagination state
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Fetch data
  const { data, isLoading, isFetching } = useFetchAllRestockHistoryQuery({
    params: {
      id: business_id || "",
      search: appliedFilters.search,
      dateRange: appliedFilters.dateRange,
      user: appliedFilters.user,
      page,
      limit: pageSize,
    },
    enabled: !!business_id,
  });

  // Extract unique users from results for filter dropdown
  const uniqueUsers = data?.results
    ? Array.from(
        new Map(data.results.map((item) => [item.user.id, item.user])).values(),
      )
    : [];

  // Apply filters
  const handleApplyFilters = () => {
    setAppliedFilters({
      search: searchQuery,
      dateRange,
      user: userFilter === "all" ? "" : userFilter,
    });
    setPage(1);
  };

  // Reset filters
  const handleResetFilters = () => {
    setSearchQuery("");
    setDateRange(undefined);
    setUserFilter("");
    setAppliedFilters({
      search: "",
      dateRange: undefined,
      user: "",
    });
    setPage(1);
  };

  // Quick remove individual filter
  const removeFilter = (type: "search" | "date" | "user") => {
    if (type === "search") setSearchQuery("");
    if (type === "date") setDateRange(undefined);
    if (type === "user") setUserFilter("");

    setTimeout(handleApplyFilters, 0);
  };

  // Check if any filters are active
  const activeFiltersCount = [
    searchQuery,
    dateRange?.from,
    userFilter && userFilter !== "all",
  ].filter(Boolean).length;

  const hasActiveFilters = activeFiltersCount > 0;

  if (isLoading) {
    return <RestockHistorySkeleton />;
  }

  return (
    <div className="min-h-screen bg-slate-50/50 pb-12">
      {/* Header Section */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                Restock History
              </h1>
              <p className="text-slate-500 mt-1 text-sm sm:text-base">
                Track and manage all inventory restock activities
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
        {/* Quick Stats Row - Mobile Only */}
        <div className="sm:hidden grid grid-cols-2 gap-3">
          <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100">
            <div className="flex items-center gap-2 text-slate-500 text-xs font-medium uppercase tracking-wider mb-1">
              <Package className="h-3.5 w-3.5" />
              Total Records
            </div>
            <div className="text-2xl font-bold text-slate-900">
              {data?.total || 0}
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100">
            <div className="flex items-center gap-2 text-slate-500 text-xs font-medium uppercase tracking-wider mb-1">
              <Users className="h-3.5 w-3.5" />
              Unique Users
            </div>
            <div className="text-2xl font-bold text-slate-900">
              {uniqueUsers.length}
            </div>
          </div>
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
                <div className="md:col-span-5 relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-4 w-4 text-slate-400 group-focus-within:text-green-500 transition-colors" />
                  </div>
                  <Input
                    type="text"
                    placeholder="Search by product name or SKU..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10   max-h-[35px] bg-slate-50/50 border-slate-200 focus:bg-white focus:border-green-500 focus:ring-2 focus:ring-green-500/20 rounded-lg transition-all"
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

                {/* User Filter */}
                <div className="md:col-span-3">
                  <Select value={userFilter} onValueChange={setUserFilter}>
                    <SelectTrigger className=" min-h-[14px] w-full bg-slate-50/50 border-slate-200 focus:bg-white focus:border-green-500 focus:ring-2 focus:ring-green-500/20 rounded-lg">
                      <div className="flex items-center gap-2 text-slate-600">
                        <Users className="h-4 w-4 text-slate-400" />
                        <SelectValue placeholder="All Users" />
                      </div>
                    </SelectTrigger>
                    <SelectContent className="rounded-lg w-full border-slate-200 shadow-lg">
                      <SelectItem value="all" className="rounded-md w-full">
                        All Users
                      </SelectItem>
                      {uniqueUsers.map((user) => (
                        <SelectItem
                          key={user.id}
                          value={user.id}
                          className="rounded-md"
                        >
                          {user.name}
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

                    {searchQuery && (
                      <button
                        onClick={() => removeFilter("search")}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-green-50 text-green-700 hover:bg-green-100 transition-colors group"
                      >
                        Search:{" "}
                        {searchQuery.length > 15
                          ? searchQuery.slice(0, 15) + "..."
                          : searchQuery}
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

                    {userFilter && userFilter !== "all" && (
                      <button
                        onClick={() => removeFilter("user")}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-purple-50 text-purple-700 hover:bg-purple-100 transition-colors group"
                      >
                        <Users className="h-3 w-3" />
                        {
                          uniqueUsers
                            .find((u) => u.id === userFilter)
                            ?.name?.split(" ")[0]
                        }
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
                  Restock Records
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

          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <CustomTable
                columns={allRestockHistoryColumns}
                data={data?.results || []}
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
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RestockHistoryPage;

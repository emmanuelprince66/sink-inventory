"use client";

import { useFetchAllRestockHistoryQuery } from "@/api/restock/fetch-all-restock-history";
import { useFetchDepartmentsQuery } from "@/api/products/fetch-departments";
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
import { useBusinessStore } from "@/lib/store/useBusinessStore";
import { format } from "date-fns";
import { Banknote, Package, RotateCcw, Users, X } from "lucide-react";
import { useState } from "react";
import { DateRange } from "react-day-picker";
import { formatToNaira } from "@/utils/formatMoney";
import { allRestockHistoryColumns } from "./AllRestockColunm";
import { RestockHistorySkeleton } from "./AllRestockSkeleton";

const RestockHistoryPage = () => {
  const business_id = useBusinessStore((state) => state.business_id);

  // Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [userFilter, setUserFilter] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("");
  const [appliedFilters, setAppliedFilters] = useState({
    search: "",
    dateRange: undefined as DateRange | undefined,
    user: "",
    department: "",
  });

  const { data: DepartmentData } = useFetchDepartmentsQuery(business_id, {
    enabled: !!business_id,
    staleTime: 1000 * 60 * 5,
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
      department: appliedFilters.department,
      page,
      limit: pageSize,
    },
    enabled: !!business_id,
  });

  // Extract unique users from results for filter dropdown
  const restockResults = data?.results?.data || [];
  const uniqueUsers: { id: string; name: string }[] = restockResults.length > 0
    ? Array.from(
        new Map(restockResults.map((item: any) => [item.user.id, item.user])).values(),
      ) as { id: string; name: string }[]
    : [];

  // Apply search + date live via effect-free helper: on change, re-apply immediately
  const applyFilters = (next: Partial<typeof appliedFilters>) => {
    setAppliedFilters((prev) => ({ ...prev, ...next }));
    setPage(1);
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    applyFilters({ search: value });
  };

  const handleDateChange = (range: DateRange | undefined) => {
    setDateRange(range);
    applyFilters({ dateRange: range });
  };

  const handleUserChange = (value: string) => {
    setUserFilter(value);
    applyFilters({ user: value === "all" ? "" : value });
  };

  const handleDepartmentChange = (value: string) => {
    setDepartmentFilter(value);
    applyFilters({ department: value === "all" ? "" : value });
  };

  const handleResetFilters = () => {
    setSearchQuery("");
    setDateRange(undefined);
    setUserFilter("");
    setDepartmentFilter("");
    setAppliedFilters({
      search: "",
      dateRange: undefined,
      user: "",
      department: "",
    });
    setPage(1);
  };

  const removeFilter = (type: "search" | "date" | "user" | "department") => {
    if (type === "search") handleSearchChange("");
    if (type === "date") handleDateChange(undefined);
    if (type === "user") handleUserChange("all");
    if (type === "department") handleDepartmentChange("all");
  };

  const hasActiveFilters = !!(
    searchQuery ||
    dateRange?.from ||
    (userFilter && userFilter !== "all") ||
    (departmentFilter && departmentFilter !== "all")
  );

  if (isLoading) {
    return <RestockHistorySkeleton />;
  }

  return (
    <div className="w-full flex flex-col gap-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-grey-1">
          Restock History
        </h1>
        <p className="text-grey-3 mt-1 text-sm">
          Track and manage all inventory restock activities
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl">
        <div className="bg-success-2 rounded-2xl p-4 sm:p-5 flex items-center gap-4">
          <div className="p-2.5 rounded-full bg-white/60">
            <Package className="h-5 w-5 text-success-1" />
          </div>
          <div>
            <p className="text-sm font-medium text-grey-3">Total Records</p>
            <p className="text-2xl font-extrabold text-success-1">
              {data?.results?.count || 0}
            </p>
          </div>
        </div>

        <div className="bg-info-2 rounded-2xl p-4 sm:p-5 flex items-center gap-4">
          <div className="p-2.5 rounded-full bg-white/60">
            <Banknote className="h-5 w-5 text-info-1" />
          </div>
          <div>
            <p className="text-sm font-medium text-grey-3">Total Value</p>
            <p className="text-2xl font-extrabold text-info-1">
              {formatToNaira(data?.results?.value || 0)}
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
                Restock Records
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-grey-6 text-grey-3">
                {data?.results?.count || 0}
              </span>
              {isFetching && (
                <div className="flex items-center gap-2 text-xs text-grey-3">
                  <div className="w-1.5 h-1.5 bg-primary-green-300 rounded-full animate-pulse" />
                  Updating...
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full lg:w-auto">
              <div className="w-full sm:w-56">
                <SearchInput
                  placeholder="Search product or SKU..."
                  value={searchQuery}
                  onValueChange={handleSearchChange}
                  className="h-9"
                />
              </div>
              <div className="w-full sm:w-40">
                <DatePickerWithRange
                  date={dateRange}
                  onDateChange={handleDateChange}
                  className="w-full"
                />
              </div>
              <div className="w-full sm:w-36">
                <Select value={userFilter} onValueChange={handleUserChange}>
                  <SelectTrigger className="w-full h-9 min-h-9">
                    <SelectValue placeholder="All Users" />
                  </SelectTrigger>
                  <SelectContent className="w-full">
                    <SelectItem value="all" className="w-full">
                      All Users
                    </SelectItem>
                    {uniqueUsers.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="w-full sm:w-36">
                <Select
                  value={departmentFilter}
                  onValueChange={handleDepartmentChange}
                >
                  <SelectTrigger className="w-full h-9 min-h-9">
                    <SelectValue placeholder="All Depts" />
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
              {searchQuery && (
                <button
                  onClick={() => removeFilter("search")}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-primary-green-300/10 text-primary-green-300 hover:bg-primary-green-300/20 transition-colors group cursor-pointer"
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
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-success-2 text-success-1 hover:bg-success-2/70 transition-colors group cursor-pointer"
                >
                  {format(dateRange.from, "MMM dd")}
                  {dateRange.to && ` - ${format(dateRange.to, "MMM dd")}`}
                  <X className="h-3 w-3 group-hover:scale-110 transition-transform" />
                </button>
              )}

              {userFilter && userFilter !== "all" && (
                <button
                  onClick={() => removeFilter("user")}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-secondary-1 text-white hover:opacity-90 transition-colors group cursor-pointer"
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

              {departmentFilter && departmentFilter !== "all" && (
                <button
                  onClick={() => removeFilter("department")}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-warning-2 text-warning-1 hover:bg-warning-2/70 transition-colors group cursor-pointer"
                >
                  {DepartmentData?.data?.find(
                    (d: any) => d.id === departmentFilter,
                  )?.name || departmentFilter}
                  <X className="h-3 w-3 group-hover:scale-110 transition-transform" />
                </button>
              )}
            </div>
          )}
        </div>

        <CustomTable
          bordered={false}
          columns={allRestockHistoryColumns}
          data={restockResults}
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

export default RestockHistoryPage;

"use client";

import { CustomCard } from "@/components/app/CustomCard";
import { CustomTable } from "@/components/app/CutomTable";
import { DatePickerWithRange } from "@/components/app/DateRangePicker";
import { SearchInput } from "@/components/app/SearchInput";
import { TableSkeleton } from "@/components/app/TableSkeleton";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { BookingStatusFilter, useBookings } from "@/hooks/useBookings";
import { Booking } from "@/types/booking";
import { format } from "date-fns";
import {
  CalendarCheck2,
  CalendarDays,
  ChevronRight,
  CircleAlert,
  Clock3,
  Banknote,
  ExternalLink,
  Plus,
  RotateCcw,
  ShieldBan,
  WalletCards,
} from "lucide-react";
import { Row } from "@tanstack/react-table";
import { useRouter } from "next/navigation";
import { createBookingColumns } from "./BookingColumns";
import BookingLinkCard from "./BookingLinkCard";

const STATUS_FILTERS: { label: string; value: BookingStatusFilter }[] = [
  { label: "All", value: "all" },
  { label: "Confirmed", value: "confirmed" },
  { label: "In progress", value: "in_progress" },
  { label: "Completed", value: "completed" },
  { label: "Cancelled", value: "cancelled" },
  { label: "No show", value: "no_show" },
];

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(amount);

const MetricCard = ({
  label,
  value,
  icon: Icon,
  tone,
}: {
  label: string;
  value: string | number;
  icon: typeof CalendarDays;
  tone: "blue" | "purple" | "green" | "amber";
}) => {
  const toneStyles = {
    blue: "bg-info-2 text-info-1",
    purple: "bg-[#f0eaff] text-[#7c3aed]",
    green: "bg-success-2 text-success-1",
    amber: "bg-warning-2 text-warning-1",
  }[tone];

  return (
    <CustomCard className="rounded-2xl border border-grey-5 p-0">
      <div className="flex min-h-[92px] items-center gap-3 p-4 sm:gap-4 sm:p-5">
        <span
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${toneStyles}`}
        >
          <Icon className="h-5 w-5" />
        </span>
        <div className="min-w-0">
          <p className="truncate text-xs font-semibold text-grey-3">{label}</p>
          <p className="mt-1 text-xl font-extrabold text-grey-1 sm:text-2xl">
            {value}
          </p>
        </div>
      </div>
    </CustomCard>
  );
};

// Same shell as MetricCard (icon tile + label + value) so the overview row
// doesn't resize when bookings finish loading.
const MetricCardSkeleton = () => (
  <CustomCard className="rounded-2xl border border-grey-5 p-0">
    <div className="flex min-h-[92px] items-center gap-3 p-4 sm:gap-4 sm:p-5">
      <Skeleton className="h-10 w-10 shrink-0 rounded-xl bg-grey-5" />
      <div className="min-w-0 flex-1 space-y-2">
        <Skeleton className="h-3 w-24 bg-grey-5" />
        <Skeleton className="h-6 w-16 bg-grey-5" />
      </div>
    </div>
  </CustomCard>
);

// Matches the booking columns: time, customer, service, source, amount,
// payment pill, status pill.
const BookingsTableSkeleton = () => (
  <TableSkeleton
    className="p-4 sm:p-5"
    rows={6}
    columns={[
      { width: "w-14" },
      { flex: true },
      { width: "w-28", hiddenOnMobile: true },
      { pill: true, hiddenOnMobile: true },
      { width: "w-16", hiddenOnMobile: true },
      { pill: true, hiddenOnMobile: true },
      { pill: true },
    ]}
  />
);

const Bookings = () => {
  const router = useRouter();
  const {
    dateRange,
    bookings,
    totalBookings,
    totalPages,
    page,
    pageSize,
    setPage,
    setPageSize,
    stats,
    isLoading,
    error,
    refetch,
    hasBusiness,
    statusCounts,
    statusFilter,
    setStatusFilter,
    searchTerm,
    setSearchTerm,
    setDates,
  } = useBookings();
  const columns = createBookingColumns();

  const handleRowClick = (row: Row<Booking>) => {
    router.push(`/bookings/${encodeURIComponent(row.original.id)}`);
  };

  return (
    <div className="w-full min-w-0 space-y-5 sm:space-y-6">
      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div className="min-w-0">
          <h1 className="text-2xl font-extrabold text-grey-1 sm:text-3xl">
            Bookings
          </h1>
          <p className="mt-1.5 text-sm text-grey-3">
            Manage customer appointments from your storefront and bookings
            created by your team.
          </p>
        </div>
        <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
          <Button
            onClick={() => router.push("/bookings/new")}
            className="h-10 w-full shrink-0 sm:w-auto"
          >
            <Plus className="h-4 w-4" />
            Create booking
          </Button>
          <span className="w-full sm:w-64">
            <DatePickerWithRange
              date={dateRange}
              onDateChange={setDates}
              triggerClassName="h-10"
            />
          </span>
        </div>
      </header>

      {error ? (
        <div className="flex flex-col gap-3 rounded-xl border border-error-1/20 bg-error-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="flex items-start gap-2 text-sm text-error-1">
            <CircleAlert className="mt-0.5 h-4 w-4 shrink-0" />
            Could not load bookings from the server.
          </p>
          <Button type="button" variant="outline" size="sm" onClick={() => refetch()}>
            Try again
          </Button>
        </div>
      ) : !hasBusiness ? (
        <div className="flex items-start gap-3 rounded-xl border border-warning-1/20 bg-warning-2 px-4 py-3">
          <CircleAlert className="mt-0.5 h-4 w-4 shrink-0 text-warning-1" />
          <p className="text-sm text-grey-2">
            Select a business to view its bookings.
          </p>
        </div>
      ) : null}

      <BookingLinkCard />

      <section
        aria-label="Booking overview"
        className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-3"
      >
        {isLoading ? (
          Array.from({ length: 6 }).map((_, index) => (
            <MetricCardSkeleton key={index} />
          ))
        ) : (
          <>
            <MetricCard
              label="Bookings in range"
              value={stats.total}
              icon={CalendarDays}
              tone="blue"
            />
            <MetricCard
              label="Upcoming"
              value={stats.upcoming}
              icon={CalendarCheck2}
              tone="purple"
            />
            <MetricCard
              label="Collected in range"
              value={formatCurrency(stats.revenue)}
              icon={WalletCards}
              tone="green"
            />
            <MetricCard
              label="Unearned revenue"
              value={formatCurrency(stats.unearnedRevenue)}
              icon={Banknote}
              tone="purple"
            />
            <MetricCard
              label="Pending bookings"
              value={stats.pending}
              icon={Clock3}
              tone="amber"
            />
            <MetricCard
              label={`Pending refunds (${stats.pendingRefunds})`}
              value={formatCurrency(stats.pendingRefundAmount)}
              icon={CircleAlert}
              tone="amber"
            />
          </>
        )}
      </section>

      <section className="overflow-hidden rounded-2xl border border-grey-5 bg-white">
        <div className="flex flex-col gap-4 border-b border-grey-5 p-4 sm:p-5">
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-[1fr_auto] lg:items-center">
            <div className="w-full lg:w-72">
              <SearchInput
                value={searchTerm}
                onValueChange={setSearchTerm}
                placeholder="Search customer or service..."
              />
            </div>
          </div>

          <div className="flex items-end justify-between gap-3">
            <div className="min-w-0">
              <h2 className="mt-1 truncate text-base font-extrabold text-grey-1 sm:text-lg">
                {dateRange?.from && dateRange?.to
                  ? format(dateRange.from, "MMM d, yyyy") ===
                    format(dateRange.to, "MMM d, yyyy")
                    ? format(dateRange.from, "EEEE, MMM d, yyyy")
                    : `${format(dateRange.from, "MMM d, yyyy")} – ${format(dateRange.to, "MMM d, yyyy")}`
                  : "All dates"}
              </h2>
            </div>
            {isLoading ? (
              <Skeleton className="h-3.5 w-16 shrink-0 bg-grey-5" />
            ) : (
              <p className="shrink-0 text-xs font-semibold text-grey-3">
                {totalBookings} {totalBookings === 1 ? "booking" : "bookings"}
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-2 border-b border-grey-5 px-4 py-3 sm:px-5">
            {STATUS_FILTERS.map((filter) => {
              const isActive = statusFilter === filter.value;
              return (
                <button
                  key={filter.value}
                  type="button"
                  onClick={() => setStatusFilter(filter.value)}
                  className={`flex shrink-0 cursor-pointer items-center gap-2 rounded-full px-3 py-1.5 text-xs font-bold transition-colors sm:px-4 sm:text-sm ${
                    isActive
                      ? "bg-primary-green-300 text-white"
                      : "border border-grey-5 bg-white text-grey-2 hover:bg-grey-6"
                  }`}
                >
                  {filter.label}
                  <span
                    className={`rounded-full px-1.5 py-0.5 text-[10px] ${
                      isActive
                        ? "bg-white/20 text-white"
                        : "bg-grey-6 text-grey-3"
                    }`}
                  >
                    {statusCounts[filter.value]}
                  </span>
                </button>
              );
            })}
        </div>

        <div className="flex items-center justify-between gap-3 border-b border-grey-5 px-4 py-3 sm:px-5">
          <span className="text-sm font-semibold text-grey-2">
            Appointments
          </span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => router.push("/bookings/refunds")}
            className="shrink-0"
          >
            <RotateCcw className="h-4 w-4" />
            Refunds
            {stats.pendingRefunds > 0 && (
              <span className="rounded-full bg-warning-2 px-1.5 py-0.5 text-[10px] font-extrabold text-warning-1">
                {stats.pendingRefunds}
              </span>
            )}
          </Button>
        </div>

        {isLoading ? (
          <BookingsTableSkeleton />
        ) : (
          <CustomTable
            columns={columns}
            data={bookings}
            noDataText={
              <div className="flex flex-col items-center px-5 py-8 text-center">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary-6 text-primary-green-300">
                  <CalendarDays className="h-5 w-5" />
                </span>
                <h3 className="mt-4 text-base font-extrabold text-grey-1">
                  No bookings found
                </h3>
                <p className="mt-1 max-w-sm text-sm leading-6 text-grey-3">
                  {searchTerm
                    ? "Try a different search or clear the filters."
                    : "There are no bookings for this date and status."}
                </p>
                {searchTerm && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="mt-4"
                    onClick={() => setSearchTerm("")}
                  >
                    Clear search
                  </Button>
                )}
              </div>
            }
            onRowClick={handleRowClick}
            bordered={false}
            showSerialNumber={false}
            pagination={{
              currentPage: page,
              totalPages,
              pageSize,
              onPageChange: setPage,
              onPageSizeChange: setPageSize,
            }}
          />
        )}
      </section>

      <section
        aria-label="Booking management"
        className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-4"
      >
        <ManagementLink
          onClick={() => router.push("/inventory?tab=services")}
          icon={ExternalLink}
          title="Services & setup"
          description="Manage services customers can book"
        />
        <ManagementLink
          onClick={() => router.push("/bookings/availability")}
          icon={CalendarDays}
          title="Payment & availability"
          description="Set your weekly hours and booking rules"
        />
        <ManagementLink
          onClick={() => router.push("/bookings/blocked-times")}
          icon={ShieldBan}
          title="Block time"
          description="Prevent bookings during selected periods"
        />
        <ManagementLink
          onClick={() => router.push("/bookings/refunds")}
          icon={RotateCcw}
          title="Refunds"
          description="Track and record refunds to customers"
        />
      </section>
    </div>
  );
};

const ManagementLink = ({
  icon: Icon,
  onClick,
  title,
  description,
}: {
  icon: typeof CalendarDays;
  onClick: () => void;
  title: string;
  description: string;
}) => (
  <button
    type="button"
    onClick={onClick}
    className="flex min-w-0 cursor-pointer items-center gap-3 rounded-2xl border border-grey-5 bg-white p-4 text-left transition-colors hover:border-primary-green-300/40 hover:bg-secondary-6"
  >
    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-success-2 text-success-1">
      <Icon className="h-4 w-4" />
    </span>
    <span className="min-w-0 flex-1">
      <span className="block truncate text-sm font-extrabold text-grey-1">
        {title}
      </span>
      <span className="mt-1 block truncate text-xs text-grey-3">
        {description}
      </span>
    </span>
    <ChevronRight className="h-4 w-4 shrink-0 text-grey-4" />
  </button>
);

export default Bookings;

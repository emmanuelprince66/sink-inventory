"use client";

import {
  MerchantBooking,
  useMerchantRefundsQuery,
} from "@/api/bookings/service-bookings";
import { CustomCard } from "@/components/app/CustomCard";
import { CustomTable } from "@/components/app/CutomTable";
import { DatePickerWithRange } from "@/components/app/DateRangePicker";
import { SearchInput } from "@/components/app/SearchInput";
import { TableSkeleton } from "@/components/app/TableSkeleton";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useBusinessStore } from "@/lib/store/useBusinessStore";
import { useUserRole } from "@/lib/store/user-store";
import { cn } from "@/lib/utils";
import { ColumnDef, Row } from "@tanstack/react-table";
import { format, parseISO } from "date-fns";
import {
  CheckCircle2,
  CircleAlert,
  Clock3,
  Info,
  RotateCcw,
  WalletCards,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { DateRange } from "react-day-picker";
import BookingPageHeader from "../BookingPageHeader";
import DisburseRefundModal, {
  formatNaira,
  refundAmountOf,
} from "./DisburseRefundModal";

type RefundTab = "pending" | "refunded" | "all";

const TABS: { value: RefundTab; label: string }[] = [
  { value: "pending", label: "Pending" },
  { value: "refunded", label: "Refunded" },
  { value: "all", label: "All" },
];

const isPending = (booking: MerchantBooking) =>
  booking.payment_status === "REFUND_PENDING";

const formatBookingWhen = (booking: MerchantBooking) => {
  const date = parseISO(booking.booking_date);
  if (Number.isNaN(date.getTime())) return booking.booking_date;
  const time = booking.start_time ? ` · ${booking.start_time.slice(0, 5)}` : "";
  return `${format(date, "EEE, MMM d, yyyy")}${time}`;
};

const SummaryCard = ({
  label,
  value,
  hint,
  icon: Icon,
  tone,
  loading,
}: {
  label: string;
  value: string;
  hint?: string;
  icon: typeof WalletCards;
  tone: "amber" | "green" | "purple";
  loading: boolean;
}) => (
  <CustomCard className="rounded-2xl border border-grey-5 p-0">
    <div className="flex min-h-[92px] items-center gap-3 p-4 sm:gap-4 sm:p-5">
      {loading ? (
        <>
          <Skeleton className="h-10 w-10 shrink-0 rounded-xl bg-grey-5" />
          <div className="min-w-0 flex-1 space-y-2">
            <Skeleton className="h-3 w-24 bg-grey-5" />
            <Skeleton className="h-6 w-20 bg-grey-5" />
          </div>
        </>
      ) : (
        <>
          <span
            className={cn(
              "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
              tone === "amber" && "bg-warning-2 text-warning-1",
              tone === "green" && "bg-success-2 text-success-1",
              tone === "purple" && "bg-[#f0eaff] text-[#7c3aed]",
            )}
          >
            <Icon className="h-5 w-5" />
          </span>
          <div className="min-w-0">
            <p className="truncate text-xs font-semibold text-grey-3">{label}</p>
            <p className="mt-1 text-xl font-extrabold text-grey-1 sm:text-2xl">
              {value}
            </p>
            {hint && <p className="mt-0.5 text-[11px] text-grey-3">{hint}</p>}
          </div>
        </>
      )}
    </div>
  </CustomCard>
);

const RefundsPage = () => {
  const router = useRouter();
  const businessId = useBusinessStore((state) => state.business_id);
  // Same rule as the booking details page: only owners/admins disburse.
  const { isOwner, isAdminAttendant } = useUserRole();
  const canDisburse = isOwner || isAdminAttendant;
  const [tab, setTab] = useState<RefundTab>("pending");
  const [search, setSearch] = useState("");
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [disbursing, setDisbursing] = useState<MerchantBooking | null>(null);

  const startDate = dateRange?.from ? format(dateRange.from, "yyyy-MM-dd") : undefined;
  const endDate = dateRange?.from
    ? format(dateRange.to ?? dateRange.from, "yyyy-MM-dd")
    : undefined;

  // One REFUND query (pending + refunded) so tab counts and totals come from
  // the same data; tabs just filter it.
  const { data, isLoading, isFetching, error, refetch } =
    useMerchantRefundsQuery(businessId ?? "", "REFUND", startDate, endDate);
  const loading = isLoading || (isFetching && !data);

  const refunds = useMemo(
    () =>
      [...(data?.data?.schedule ?? [])].sort((a, b) =>
        // Oldest pending first (most overdue), then newest refunded.
        isPending(a) !== isPending(b)
          ? isPending(a)
            ? -1
            : 1
          : isPending(a)
            ? a.booking_date.localeCompare(b.booking_date)
            : b.booking_date.localeCompare(a.booking_date),
      ),
    [data],
  );

  const pendingRefunds = refunds.filter(isPending);
  const completedRefunds = refunds.filter(
    (booking) => booking.payment_status === "REFUNDED",
  );
  const summary = data?.data?.summary;
  // The summary isn't date-filtered, so only trust it with no range applied.
  const pendingCount =
    !dateRange && summary?.pending_refunds != null
      ? summary.pending_refunds
      : pendingRefunds.length;
  const pendingAmount =
    !dateRange && summary?.pending_refunds_amount != null
      ? Number(summary.pending_refunds_amount)
      : pendingRefunds.reduce((sum, booking) => sum + refundAmountOf(booking), 0);
  const refundedAmount = completedRefunds.reduce(
    (sum, booking) => sum + refundAmountOf(booking),
    0,
  );

  const counts: Record<RefundTab, number> = {
    pending: pendingRefunds.length,
    refunded: completedRefunds.length,
    all: refunds.length,
  };

  const visible = useMemo(() => {
    const term = search.trim().toLowerCase();
    return refunds.filter((booking) => {
      if (tab === "pending" && !isPending(booking)) return false;
      if (tab === "refunded" && booking.payment_status !== "REFUNDED") return false;
      if (!term) return true;
      return [
        booking.customer_name,
        booking.customer_phone,
        booking.reference,
        booking.service_name,
      ].some((value) => value?.toLowerCase().includes(term));
    });
  }, [refunds, search, tab]);

  const totalPages = Math.max(1, Math.ceil(visible.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pageRows = visible.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  const columns: ColumnDef<MerchantBooking>[] = [
    {
      accessorKey: "customer_name",
      header: "Customer",
      cell: ({ row }) => (
        <div className="min-w-40">
          <p className="font-bold text-grey-1">{row.original.customer_name}</p>
          <p className="mt-0.5 text-xs text-grey-3">
            {row.original.customer_phone || "—"}
          </p>
        </div>
      ),
    },
    {
      accessorKey: "service_name",
      header: "Booking",
      cell: ({ row }) => (
        <div className="min-w-44">
          <p className="font-semibold text-grey-1">{row.original.service_name}</p>
          <p className="mt-0.5 text-xs text-grey-3">
            {formatBookingWhen(row.original)} · {row.original.reference}
          </p>
        </div>
      ),
    },
    {
      accessorKey: "cancellation_reason",
      header: "Reason",
      cell: ({ row }) => (
        <p
          className="line-clamp-2 max-w-52 text-xs text-grey-2"
          title={row.original.cancellation_reason ?? undefined}
        >
          {row.original.cancellation_reason || "—"}
        </p>
      ),
    },
    {
      accessorKey: "refundable_amount",
      header: "Refund",
      cell: ({ row }) => (
        <div className="whitespace-nowrap">
          <p className="font-extrabold text-grey-1">
            {formatNaira(refundAmountOf(row.original))}
          </p>
          <p className="mt-0.5 text-[11px] text-grey-3">
            of {formatNaira(Number(row.original.amount_paid ?? 0))} paid
          </p>
        </div>
      ),
    },
    {
      accessorKey: "payment_status",
      header: "Status",
      cell: ({ row }) =>
        isPending(row.original) ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-warning-2 px-2.5 py-1 text-[10px] font-extrabold text-warning-1">
            <Clock3 className="h-3 w-3" />
            Pending
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 rounded-full bg-success-2 px-2.5 py-1 text-[10px] font-extrabold text-success-1">
            <CheckCircle2 className="h-3 w-3" />
            Refunded
          </span>
        ),
    },
    {
      id: "actions",
      header: "",
      enableSorting: false,
      cell: ({ row }) =>
        isPending(row.original) && canDisburse ? (
          <Button
            type="button"
            size="sm"
            onClick={(event) => {
              event.stopPropagation();
              setDisbursing(row.original);
            }}
          >
            Record refund
          </Button>
        ) : null,
    },
  ];

  const emptyCopy = {
    pending: {
      title: "No pending refunds",
      body: "You're all caught up. Refunds from cancelled bookings will show here.",
    },
    refunded: {
      title: "No refunds recorded yet",
      body: "Refunds you mark as disbursed will show here.",
    },
    all: {
      title: "No refunds yet",
      body: "Refunds appear when a paid booking is cancelled.",
    },
  }[tab];

  return (
    <div className="mx-auto w-full max-w-6xl space-y-5 sm:space-y-6">
      <BookingPageHeader title="Refunds" />

      <div className="flex items-start gap-3 rounded-xl border border-info-1/20 bg-info-2 px-4 py-3 text-xs leading-5 text-grey-2 sm:text-sm">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-info-1" />
        You pay refunds to customers directly. After sending the money, record
        it here so the booking and your records stay accurate.
      </div>

      {error && (
        <div className="flex flex-col gap-3 rounded-xl border border-error-1/20 bg-error-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="flex items-start gap-2 text-sm text-error-1">
            <CircleAlert className="mt-0.5 h-4 w-4 shrink-0" />
            Could not load refunds.
          </p>
          <Button type="button" variant="outline" size="sm" onClick={() => refetch()}>
            Try again
          </Button>
        </div>
      )}

      <section
        aria-label="Refund summary"
        className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4"
      >
        <SummaryCard
          label="Awaiting refund"
          value={formatNaira(pendingAmount)}
          hint={`${pendingCount} ${pendingCount === 1 ? "booking" : "bookings"}`}
          icon={WalletCards}
          tone="amber"
          loading={loading}
        />
        <SummaryCard
          label="Refunded"
          value={formatNaira(refundedAmount)}
          hint={`${completedRefunds.length} ${completedRefunds.length === 1 ? "booking" : "bookings"}${dateRange ? " in range" : ""}`}
          icon={CheckCircle2}
          tone="green"
          loading={loading}
        />
        <SummaryCard
          label="Total refund requests"
          value={String(refunds.length)}
          hint={dateRange ? "In selected range" : "All time"}
          icon={RotateCcw}
          tone="purple"
          loading={loading}
        />
      </section>

      <section className="overflow-hidden rounded-2xl border border-grey-5 bg-white">
        <div className="flex flex-col gap-3 border-b border-grey-5 p-4 sm:p-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="w-full lg:w-72">
            <SearchInput
              value={search}
              onValueChange={(value) => {
                setSearch(value);
                setPage(1);
              }}
              placeholder="Search customer, phone or reference..."
            />
          </div>
          <div className="flex w-full items-center gap-2 sm:w-auto">
            <span className="w-full sm:w-64">
              <DatePickerWithRange
                date={dateRange}
                onDateChange={(range) => {
                  setDateRange(range?.from ? range : undefined);
                  setPage(1);
                }}
                triggerClassName="h-10"
              />
            </span>
            {dateRange && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-10 shrink-0 text-grey-3"
                onClick={() => {
                  setDateRange(undefined);
                  setPage(1);
                }}
              >
                Clear
              </Button>
            )}
          </div>
        </div>

        <div
          role="tablist"
          aria-label="Refund status"
          className="flex flex-wrap gap-2 border-b border-grey-5 px-4 py-3 sm:px-5"
        >
          {TABS.map(({ value, label }) => {
            const active = tab === value;
            return (
              <button
                key={value}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => {
                  setTab(value);
                  setPage(1);
                }}
                className={cn(
                  "flex shrink-0 cursor-pointer items-center gap-2 rounded-full px-3 py-1.5 text-xs font-bold transition-colors sm:px-4 sm:text-sm",
                  active
                    ? "bg-primary-green-300 text-white"
                    : "border border-grey-5 bg-white text-grey-2 hover:bg-grey-6",
                )}
              >
                {label}
                <span
                  className={cn(
                    "rounded-full px-1.5 py-0.5 text-[10px]",
                    active ? "bg-white/20 text-white" : "bg-grey-6 text-grey-3",
                  )}
                >
                  {loading ? "–" : counts[value]}
                </span>
              </button>
            );
          })}
        </div>

        {loading ? (
          <TableSkeleton
            className="p-4 sm:p-5"
            rows={5}
            columns={[
              { flex: true },
              { width: "w-36", hiddenOnMobile: true },
              { width: "w-28", hiddenOnMobile: true },
              { width: "w-20" },
              { pill: true, hiddenOnMobile: true },
              { width: "w-24", hiddenOnMobile: true },
            ]}
          />
        ) : (
          <CustomTable
            columns={columns}
            data={pageRows}
            onRowClick={(row: Row<MerchantBooking>) =>
              router.push(`/bookings/${encodeURIComponent(row.original.id)}`)
            }
            bordered={false}
            showSerialNumber={false}
            noDataText={
              <div className="flex flex-col items-center px-5 py-8 text-center">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary-6 text-primary-green-300">
                  <RotateCcw className="h-5 w-5" />
                </span>
                <h3 className="mt-4 text-base font-extrabold text-grey-1">
                  {search ? "No refunds match your search" : emptyCopy.title}
                </h3>
                <p className="mt-1 max-w-sm text-sm leading-6 text-grey-3">
                  {search ? "Try a different name, phone or reference." : emptyCopy.body}
                </p>
              </div>
            }
            pagination={{
              currentPage,
              totalPages,
              pageSize,
              onPageChange: setPage,
              onPageSizeChange: (size) => {
                setPageSize(size);
                setPage(1);
              },
            }}
          />
        )}
      </section>

      <DisburseRefundModal
        booking={disbursing}
        onClose={() => setDisbursing(null)}
      />
    </div>
  );
};

export default RefundsPage;

"use client";

import { Booking, BookingStatus } from "@/types/booking";
import {
  MerchantBooking,
  useMerchantBookingsQuery,
} from "@/api/bookings/service-bookings";
import { useBusinessStore } from "@/lib/store/useBusinessStore";
import {
  endOfDay,
  format,
  parseISO,
  startOfDay,
} from "date-fns";
import { useMemo, useState } from "react";
import { DateRange } from "react-day-picker";

export type BookingStatusFilter = "all" | BookingStatus;

const parseBookingDateTime = (date: string, time: string) => {
  const match = time.match(/^(\d{1,2}):(\d{2})(?:\s*(AM|PM))?$/i);
  if (!match) return parseISO(`${date}T00:00:00`);
  let hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (match[3]?.toUpperCase() === "PM" && hours < 12) hours += 12;
  if (match[3]?.toUpperCase() === "AM" && hours === 12) hours = 0;
  return new Date(
    Number(date.slice(0, 4)),
    Number(date.slice(5, 7)) - 1,
    Number(date.slice(8, 10)),
    hours,
    minutes,
  );
};

const asNumber = (value: string | number | null | undefined) =>
  Number(value ?? 0);

const mapBooking = (record: MerchantBooking): Booking => {
  const startsAt = parseBookingDateTime(
    record.booking_date,
    record.start_time ?? record.time ?? "00:00",
  );
  const status = record.booking_status.toLowerCase() as BookingStatus;
  const paymentStatus = record.payment_status.toLowerCase() as Booking["paymentStatus"];
  const durationMinutes =
    typeof record.duration === "number"
      ? record.duration
      : Number.parseInt(record.duration ?? "0", 10) || 0;

  return {
    id: record.id,
    reference: record.reference,
    customerId: record.customer_id ?? undefined,
    customerName: record.customer_name,
    customerPhone: record.customer_phone,
    customerEmail: record.customer_email ?? "",
    serviceId: record.service_id,
    serviceName: record.service_name,
    durationMinutes,
    staffId: record.staff_id,
    staffName: record.staff_name,
    startsAt: startsAt.toISOString(),
    amount: asNumber(record.amount),
    amountPaid: asNumber(record.amount_paid),
    balanceDue: asNumber(record.balance_due),
    refundableAmount: asNumber(record.refundable_amount),
    paymentStatus,
    status,
    source: record.source === "storefront" ? "storefront" : "staff",
    notes: record.notes,
  };
};

export const useBookings = () => {
  const businessId = useBusinessStore((state) => state.business_id);
  const [dateRange, setDateRange] = useState<DateRange | undefined>(() => {
    const today = new Date();
    return { from: startOfDay(today), to: startOfDay(today) };
  });
  const rangeStart = startOfDay(dateRange?.from ?? new Date());
  const rangeEnd = startOfDay(dateRange?.to ?? rangeStart);
  const startDate = format(rangeStart, "yyyy-MM-dd");
  const endDate = dateRange?.to
    ? format(rangeEnd, "yyyy-MM-dd")
    : "";
  const [refundQueueActive, setRefundQueueActive] = useState(false);
  const {
    data: response,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useMerchantBookingsQuery(
    businessId ?? "",
    startDate,
    endDate,
    refundQueueActive ? "REFUND_PENDING" : undefined,
  );
  const payload = response?.data;
  const allBookings = useMemo(
    () => (payload?.schedule ?? []).map(mapBooking),
    [payload?.schedule],
  );
  const [statusFilter, setStatusFilter] = useState<BookingStatusFilter>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const bookingsForRange = useMemo(
    () =>
      allBookings.filter((booking) => {
        const bookingDate = parseISO(booking.startsAt);
        if (bookingDate < rangeStart) return false;
        if (bookingDate > endOfDay(rangeEnd)) return false;
        return true;
      }).sort(
        (first, second) =>
          parseISO(first.startsAt).getTime() -
          parseISO(second.startsAt).getTime(),
      ),
    [allBookings, rangeStart, rangeEnd],
  );

  const visibleBookings = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();
    return bookingsForRange.filter((booking) => {
      const matchesStatus =
        statusFilter === "all" || booking.status === statusFilter;
      const matchesSearch =
        !search ||
        [
          booking.customerName,
          booking.customerPhone,
          booking.serviceName,
          booking.staffName,
          booking.id,
        ].some((value) => value.toLowerCase().includes(search));
      return matchesStatus && matchesSearch;
    });
  }, [bookingsForRange, searchTerm, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(visibleBookings.length / pageSize));
  const paginatedBookings = useMemo(
    () => visibleBookings.slice((page - 1) * pageSize, page * pageSize),
    [page, pageSize, visibleBookings],
  );

  const stats = useMemo(() => {
    const now = new Date();
    const revenue = bookingsForRange.reduce(
      (sum, booking) => sum + (booking.amountPaid ?? 0),
      0,
    );
    const upcoming = bookingsForRange.filter(
      (booking) =>
        booking.status !== "cancelled" &&
        booking.status !== "completed" &&
        parseISO(booking.startsAt) >= now,
    ).length;
    const pendingRefunds = bookingsForRange.filter(
      (booking) => booking.paymentStatus === "refund_pending",
    );
    return {
      total: bookingsForRange.length,
      upcoming,
      revenue,
      pending: bookingsForRange.filter((booking) => booking.status === "pending").length,
      pendingRefunds: pendingRefunds.length,
      pendingRefundAmount: pendingRefunds.reduce(
        (sum, booking) =>
          sum + (booking.refundableAmount ?? booking.amountPaid ?? 0),
        0,
      ),
    };
  }, [bookingsForRange]);

  const statusCounts = useMemo(() => {
    const counts: Record<BookingStatusFilter, number> = {
      all: bookingsForRange.length,
      confirmed: 0,
      in_progress: 0,
      completed: 0,
      cancelled: 0,
      no_show: 0,
      pending: 0,
    };
    bookingsForRange.forEach((booking) => {
      counts[booking.status] += 1;
    });
    return counts;
  }, [bookingsForRange]);

  const setDates = (range: DateRange | undefined) => {
    setDateRange(
      range?.from
        ? {
            from: startOfDay(range.from),
            to: range.to ? startOfDay(range.to) : undefined,
          }
        : undefined,
    );
    setStatusFilter("all");
    setPage(1);
  };

  return {
    dateRange: dateRange
      ? { from: rangeStart, to: dateRange.to ? rangeEnd : undefined }
      : undefined,
    bookings: paginatedBookings,
    totalBookings: visibleBookings.length,
    totalPages,
    page,
    pageSize,
    setPage: (nextPage: number) => setPage(Math.max(1, Math.min(nextPage, totalPages))),
    setPageSize: (nextPageSize: number) => {
      setPageSize(nextPageSize);
      setPage(1);
    },
    stats: {
      ...stats,
      // Only the backend knows which paid bookings are still unserved.
      unearnedRevenue: Number(payload?.summary?.unearned_revenue ?? 0),
      // Prefer the backend's business-wide refund figures; the local ones only
      // cover bookings in the selected range.
      pendingRefunds:
        payload?.summary?.pending_refunds ?? stats.pendingRefunds,
      pendingRefundAmount: Number(
        payload?.summary?.pending_refunds_amount ?? stats.pendingRefundAmount,
      ),
    },
    isLoading: isLoading || isFetching,
    error,
    refetch,
    hasBusiness: Boolean(businessId),
    refundQueueActive,
    toggleRefundQueue: () => {
      setRefundQueueActive((current) => !current);
      setPage(1);
    },
    statusCounts,
    statusFilter,
    setStatusFilter: (filter: BookingStatusFilter) => {
      setStatusFilter(filter);
      setPage(1);
    },
    searchTerm,
    setSearchTerm: (value: string) => {
      setSearchTerm(value);
      setPage(1);
    },
    setDates,
  };
};

export type { Booking };

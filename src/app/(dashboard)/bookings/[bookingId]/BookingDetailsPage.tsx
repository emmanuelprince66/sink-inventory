"use client";

import { useFetchBankQuery } from "@/api/bank/fetch-bank";
import {
  normalizeMerchantBooking,
  useCancelMerchantBookingMutation,
  useCheckoutMerchantBookingMutation,
  useDisburseBookingRefundMutation,
  useMerchantBookingDetailQuery,
  useUpdateMerchantBookingMutation,
} from "@/api/bookings/service-bookings";
import { CustomModal } from "@/components/app/CustomModal";
import { InitialsAvatar } from "@/components/app/InitialsAvatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/toast/useToast";
import { useBusinessStore } from "@/lib/store/useBusinessStore";
import { useUserRole } from "@/lib/store/user-store";
import { Booking } from "@/types/booking";
import { format, parseISO } from "date-fns";
import {
  ArrowLeft,
  CalendarClock,
  Check,
  CreditCard,
  Mail,
  MoreHorizontal,
  Phone,
  RotateCcw,
  UserRound,
  X,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import BookingPageHeader from "../BookingPageHeader";

/* -------------------------------------------------------------------------- */
/*  Helpers                                                                   */
/* -------------------------------------------------------------------------- */

const currency = (amount: number) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(amount);

const formatLocalDateTime = (date: Date) => {
  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return localDate.toISOString().slice(0, 16);
};

const humanize = (value: string) => value.replaceAll("_", " ");

/* -------------------------------------------------------------------------- */
/*  Status colour system                                                      */
/*                                                                            */
/*  Booking lifecycle: amber = waiting, blue = upcoming, green + pulse = live, */
/*  grey = finished, red = cancelled.                                         */
/*  Payment: red = nothing paid, amber = partial / needs action, green =      */
/*  settled, blue = refunded.                                                 */
/*  Completed is grey (not green) so it never looks identical to "paid".      */
/* -------------------------------------------------------------------------- */

type StatusTone = {
  badge: string; // pill background + text
  dot: string; // indicator dot
  bar: string; // progress bar fill
  panel: string; // callout border + background
  pulse?: boolean;
};

const FALLBACK_TONE: StatusTone = {
  badge: "bg-grey-6 text-grey-2",
  dot: "bg-grey-3",
  bar: "bg-grey-3",
  panel: "border-grey-5 bg-grey-6",
};

const BOOKING_STATUS_STYLES: Record<Booking["status"], StatusTone> = {
  pending: {
    badge: "bg-warning-2 text-warning-1",
    dot: "bg-warning-1",
    bar: "bg-warning-1",
    panel: "border-warning-1/20 bg-warning-2",
  },
  confirmed: {
    badge: "bg-info-2 text-info-1",
    dot: "bg-info-1",
    bar: "bg-info-1",
    panel: "border-info-1/20 bg-info-2",
  },
  in_progress: {
    badge: "bg-success-2 text-success-1",
    dot: "bg-success-1",
    bar: "bg-success-1",
    panel: "border-success-1/20 bg-success-2",
    pulse: true,
  },
  completed: {
    badge: "bg-grey-6 text-grey-1",
    dot: "bg-grey-2",
    bar: "bg-grey-2",
    panel: "border-grey-5 bg-grey-6",
  },
  cancelled: {
    badge: "bg-error-2 text-error-1",
    dot: "bg-error-1",
    bar: "bg-error-1",
    panel: "border-error-1/20 bg-error-2",
  },
  no_show: {
    badge: "bg-grey-6 text-grey-2",
    dot: "bg-error-1",
    bar: "bg-grey-3",
    panel: "border-grey-5 bg-grey-6",
  },
};

// Exhaustive: adding a payment status to the union forces a colour here.
// FALLBACK_TONE still guards against unexpected backend values at runtime.
const PAYMENT_STATUS_STYLES: Record<Booking["paymentStatus"], StatusTone> = {
  unpaid: {
    badge: "bg-error-2 text-error-1",
    dot: "bg-error-1",
    bar: "bg-error-1",
    panel: "border-error-1/20 bg-error-2",
  },
  pending: {
    badge: "bg-warning-2 text-warning-1",
    dot: "bg-warning-1",
    bar: "bg-warning-1",
    panel: "border-warning-1/20 bg-warning-2",
  },
  deposit_paid: {
    badge: "bg-warning-2 text-warning-1",
    dot: "bg-warning-1",
    bar: "bg-warning-1",
    panel: "border-warning-1/20 bg-warning-2",
  },
  paid: {
    badge: "bg-success-2 text-success-1",
    dot: "bg-success-1",
    bar: "bg-success-1",
    panel: "border-success-1/20 bg-success-2",
  },
  refund_pending: {
    badge: "bg-warning-2 text-warning-1",
    dot: "bg-warning-1",
    bar: "bg-warning-1",
    panel: "border-warning-1/20 bg-warning-2",
    pulse: true,
  },
  refunded: {
    badge: "bg-info-2 text-info-1",
    dot: "bg-info-1",
    bar: "bg-info-1",
    panel: "border-info-1/20 bg-info-2",
  },
  deposit_forfeited: {
    badge: "bg-grey-6 text-grey-2",
    dot: "bg-error-1",
    bar: "bg-grey-3",
    panel: "border-grey-5 bg-grey-6",
  },
};

const getBookingTone = (status: Booking["status"]): StatusTone =>
  BOOKING_STATUS_STYLES[status] ?? FALLBACK_TONE;

const getPaymentTone = (status: Booking["paymentStatus"]): StatusTone =>
  PAYMENT_STATUS_STYLES[status] ?? FALLBACK_TONE;

/* -------------------------------------------------------------------------- */
/*  Small presentational components                                           */
/* -------------------------------------------------------------------------- */

const StatusBadge = ({ tone, label }: { tone: StatusTone; label: string }) => (
  <span
    className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-extrabold capitalize ${tone.badge}`}
  >
    <span
      className={`h-1.5 w-1.5 rounded-full ${tone.dot} ${
        tone.pulse ? "motion-safe:animate-pulse" : ""
      }`}
    />
    {label}
  </span>
);

const DetailRow = ({ label, value }: { label: string; value: string }) => (
  <div className="flex items-start justify-between gap-4 border-b border-grey-6 py-3 last:border-0">
    <span className="text-sm text-grey-3">{label}</span>
    <span className="text-right text-sm font-semibold text-grey-1">
      {value}
    </span>
  </div>
);

interface PaymentSummaryProps {
  booking: Booking;
  canRecordPayment: boolean;
  canDisburseRefund: boolean;
  onRecordPayment: () => void;
  onDisburseRefund: () => void;
}

const PaymentSummary = ({
  booking,
  canRecordPayment,
  canDisburseRefund,
  onRecordPayment,
  onDisburseRefund,
}: PaymentSummaryProps) => {
  const tone = getPaymentTone(booking.paymentStatus);
  const amountPaid = booking.amountPaid ?? 0;
  const balanceDue = booking.balanceDue ?? 0;
  const percentPaid =
    booking.amount > 0
      ? Math.min(100, Math.round((amountPaid / booking.amount) * 100))
      : 0;

  const isRefundPending = booking.paymentStatus === "refund_pending";
  const isRefunded = booking.paymentStatus === "refunded";
  const isForfeited = booking.paymentStatus === "deposit_forfeited";
  const hasBalance = balanceDue > 0;

  return (
    <section className="rounded-2xl border border-grey-5 bg-white p-4 sm:p-6">
      <div className="mb-4 flex items-center justify-between gap-3">
        <p className="text-[10px] font-extrabold uppercase tracking-widest text-grey-3">
          Payment
        </p>
        <StatusBadge tone={tone} label={humanize(booking.paymentStatus)} />
      </div>

      {/* Primary callout: the one thing the user should do next */}
      <div
        className={`flex flex-col gap-4 rounded-xl border p-4 sm:flex-row sm:items-center sm:justify-between ${tone.panel}`}
      >
        <div className="min-w-0">
          {isRefundPending ? (
            <>
              <p className="text-xs font-semibold text-grey-2">
                Refund owed to customer
              </p>
              <p className="text-2xl font-extrabold text-grey-1">
                {currency(booking.refundableAmount ?? 0)}
              </p>
            </>
          ) : isForfeited ? (
            <>
              <p className="text-xs font-semibold text-grey-2">
                Deposit forfeited
              </p>
              <p className="text-2xl font-extrabold text-grey-1">
                {currency(amountPaid)}
              </p>
            </>
          ) : isRefunded ? (
            <div className="flex items-center gap-2 text-info-1">
              <RotateCcw className="h-5 w-5" />
              <p className="text-sm font-extrabold">Refund completed</p>
            </div>
          ) : hasBalance ? (
            <>
              <p className="text-xs font-semibold text-grey-2">Balance due</p>
              <p className="text-2xl font-extrabold text-grey-1">
                {currency(balanceDue)}
              </p>
            </>
          ) : (
            <div className="flex items-center gap-2 text-success-1">
              <Check className="h-5 w-5" />
              <p className="text-sm font-extrabold">Fully paid</p>
            </div>
          )}
        </div>

        {isRefundPending && canDisburseRefund && (
          <Button
            type="button"
            onClick={onDisburseRefund}
            className="w-full sm:w-auto"
          >
            <RotateCcw className="h-4 w-4" />
            Disburse refund
          </Button>
        )}

        {!isRefundPending &&
          !isRefunded &&
          !isForfeited &&
          hasBalance &&
          canRecordPayment && (
            <Button
              type="button"
              onClick={onRecordPayment}
              className="w-full sm:w-auto"
            >
              <CreditCard className="h-4 w-4" />
              Record payment
            </Button>
          )}
      </div>

      {/* Progress */}
      <div className="mt-5">
        <div className="mb-2 flex items-center justify-between text-xs font-semibold text-grey-3">
          <span>{percentPaid}% paid</span>
          <span>
            {currency(amountPaid)} of {currency(booking.amount)}
          </span>
        </div>
        <div
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={percentPaid}
          aria-label="Payment progress"
          className="h-2 w-full overflow-hidden rounded-full bg-grey-6"
        >
          <div
            className={`h-full rounded-full transition-[width] duration-500 ${tone.bar}`}
            style={{ width: `${percentPaid}%` }}
          />
        </div>
      </div>

      <div className="mt-3">
        <DetailRow label="Total amount" value={currency(booking.amount)} />
        <DetailRow label="Amount paid" value={currency(amountPaid)} />
        <DetailRow label="Balance due" value={currency(balanceDue)} />
      </div>
    </section>
  );
};

/* -------------------------------------------------------------------------- */
/*  Loading skeleton (same shape as the loaded page so nothing jumps)         */
/* -------------------------------------------------------------------------- */

const DETAIL_ROW_WIDTHS = [
  "w-28",
  "w-36",
  "w-40",
  "w-32",
  "w-20",
  "w-24",
  "w-20",
];

const BookingDetailsSkeleton = () => (
  <div className="w-full min-w-0 space-y-5 sm:space-y-6">
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-4">
        <Skeleton className="h-9 w-20 rounded-lg bg-grey-6" />
        <Skeleton className="h-6 w-36 bg-grey-6" />
      </div>
      <Skeleton className="h-7 w-24 rounded-full bg-grey-6" />
    </div>

    <div className="mx-auto grid w-full max-w-5xl gap-5 lg:grid-cols-[minmax(0,1.35fr)_minmax(280px,0.9fr)]">
      <div className="space-y-5">
        {/* Payment card */}
        <section className="rounded-2xl border border-grey-5 bg-white p-4 sm:p-6">
          <div className="mb-4 flex items-center justify-between">
            <Skeleton className="h-3 w-16 bg-grey-6" />
            <Skeleton className="h-7 w-24 rounded-full bg-grey-6" />
          </div>
          <Skeleton className="h-20 w-full rounded-xl bg-grey-6" />
          <Skeleton className="mt-5 h-2 w-full rounded-full bg-grey-6" />
          {[0, 1, 2].map((index) => (
            <div
              key={index}
              className="flex items-center justify-between gap-4 border-b border-grey-6 py-3.5 last:border-0"
            >
              <Skeleton className="h-3.5 w-24 bg-grey-6" />
              <Skeleton className="h-3.5 w-20 bg-grey-6" />
            </div>
          ))}
        </section>

        {/* Appointment card */}
        <section className="rounded-2xl border border-grey-5 bg-white p-4 sm:p-6">
          <Skeleton className="mb-4 h-3 w-24 bg-grey-6" />
          {DETAIL_ROW_WIDTHS.map((width, index) => (
            <div
              key={index}
              className="flex items-center justify-between gap-4 border-b border-grey-6 py-3.5 last:border-0"
            >
              <Skeleton className="h-3.5 w-24 bg-grey-6" />
              <Skeleton className={`h-3.5 ${width} bg-grey-6`} />
            </div>
          ))}
        </section>
      </div>

      {/* Customer card */}
      <section className="h-fit rounded-2xl border border-grey-5 bg-white p-4 sm:p-5">
        <div className="flex items-center gap-3 border-b border-grey-6 pb-4">
          <Skeleton className="h-10 w-10 shrink-0 rounded-full bg-grey-6" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-32 bg-grey-6" />
            <Skeleton className="h-3 w-16 bg-grey-6" />
          </div>
        </div>
        {["w-32", "w-44", "w-36"].map((width, index) => (
          <div
            key={index}
            className="flex items-center gap-2 border-b border-grey-6 py-4 last:border-0"
          >
            <Skeleton className="h-4 w-4 shrink-0 rounded bg-grey-6" />
            <Skeleton className={`h-3.5 ${width} bg-grey-6`} />
          </div>
        ))}
        <div className="mt-1 flex items-center gap-2">
          <Skeleton className="h-9 flex-1 rounded-lg bg-grey-6" />
          <Skeleton className="h-9 w-9 shrink-0 rounded-lg bg-grey-6" />
        </div>
      </section>
    </div>
  </div>
);

/* -------------------------------------------------------------------------- */
/*  Page                                                                      */
/* -------------------------------------------------------------------------- */

const BookingDetailsPage = ({ bookingId }: { bookingId: string }) => {
  const router = useRouter();
  const { showToast } = useToast();
  const businessId = useBusinessStore((state) => state.business_id);
  const { isOwner, isAdminAttendant, isAttendant } = useUserRole();
  const {
    data: bookingResponse,
    isLoading,
    error,
    refetch,
  } = useMerchantBookingDetailQuery(bookingId);
  const bookingRecord = normalizeMerchantBooking(bookingResponse);
  const booking: Booking | undefined = bookingRecord
    ? {
        id: bookingRecord.id,
        reference: bookingRecord.reference,
        customerId: bookingRecord.customer_id ?? undefined,
        customerName: bookingRecord.customer_name,
        customerPhone: bookingRecord.customer_phone,
        customerEmail: bookingRecord.customer_email ?? "",
        serviceName: bookingRecord.service_name,
        durationMinutes: Number(bookingRecord.duration) || 0,
        staffName: bookingRecord.staff_name,
        startsAt: `${bookingRecord.booking_date}T${bookingRecord.start_time}`,
        amount: Number(bookingRecord.amount) || 0,
        amountPaid: Number(bookingRecord.amount_paid) || 0,
        balanceDue: Number(bookingRecord.balance_due) || 0,
        refundableAmount: Number(bookingRecord.refundable_amount) || 0,
        paymentStatus:
          bookingRecord.payment_status.toLowerCase() as Booking["paymentStatus"],
        status: bookingRecord.booking_status.toLowerCase() as Booking["status"],
        source: bookingRecord.source === "storefront" ? "storefront" : "staff",
        serviceId: bookingRecord.service_id,
        staffId: bookingRecord.staff_id,
        notes: bookingRecord.notes,
      }
    : undefined;
  const { mutateAsync: updateBooking, isPending: isUpdating } =
    useUpdateMerchantBookingMutation();
  const { mutateAsync: cancelBooking, isPending: isCancelling } =
    useCancelMerchantBookingMutation();
  const { mutateAsync: checkoutBooking, isPending: isCheckingOut } =
    useCheckoutMerchantBookingMutation();
  const { mutateAsync: disburseRefund, isPending: isDisbursing } =
    useDisburseBookingRefundMutation();
  const { data: bankResponse } = useFetchBankQuery(businessId ?? "", {
    enabled: Boolean(businessId),
  });
  const banks: { id: string; bank_name: string; account_number: string }[] =
    Array.isArray(bankResponse?.data) ? bankResponse.data : [];
  const [isRescheduling, setIsRescheduling] = useState(false);
  const [rescheduledTime, setRescheduledTime] = useState("");
  const [showCancelConfirmation, setShowCancelConfirmation] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [showCheckout, setShowCheckout] = useState(false);
  const [checkoutAmount, setCheckoutAmount] = useState("");
  const [checkoutMethod, setCheckoutMethod] = useState<
    "CASH" | "CARD" | "TRANSFER"
  >("CASH");
  const [checkoutBankId, setCheckoutBankId] = useState("");
  const [showRefund, setShowRefund] = useState(false);
  const [refundMethod, setRefundMethod] = useState<"BANK_TRANSFER" | "CASH">(
    "BANK_TRANSFER",
  );
  const [refundReference, setRefundReference] = useState("");
  const [refundNotes, setRefundNotes] = useState("");

  useEffect(() => {
    if (booking) {
      setRescheduledTime(formatLocalDateTime(parseISO(booking.startsAt)));
      setCheckoutAmount(String(booking.balanceDue ?? 0));
    }
  }, [booking?.startsAt, booking?.balanceDue]);

  if (isLoading) {
    return <BookingDetailsSkeleton />;
  }

  if (error) {
    return (
      <div className="mx-auto max-w-2xl rounded-2xl border border-error-1/20 bg-error-2 p-8 text-center">
        <h1 className="text-xl font-extrabold text-grey-1">
          Could not load booking
        </h1>
        <p className="mt-2 text-sm text-grey-3">
          The booking details could not be retrieved from the server.
        </p>
        <Button className="mt-5" variant="outline" onClick={() => refetch()}>
          Try again
        </Button>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="mx-auto max-w-2xl rounded-2xl border border-grey-5 bg-white p-8 text-center">
        <h1 className="text-xl font-extrabold text-grey-1">
          Booking not found
        </h1>
        <p className="mt-2 text-sm text-grey-3">
          This booking may have been removed or is not available to your
          account.
        </p>
        <Button className="mt-5" onClick={() => router.push("/bookings")}>
          <ArrowLeft className="h-4 w-4" />
          Back to bookings
        </Button>
      </div>
    );
  }

  const canManage =
    booking.status !== "cancelled" && booking.status !== "completed";
  const canManageSettings = isOwner || isAdminAttendant;
  const canUpdateProgress = isAttendant || canManageSettings;

  const bookingTone = getBookingTone(booking.status);
  const startsAt = parseISO(booking.startsAt);
  const endsAt = new Date(startsAt.getTime() + booking.durationMinutes * 60000);

  const canRecordPayment =
    canUpdateProgress &&
    canManage &&
    (booking.balanceDue ?? 0) > 0 &&
    booking.paymentStatus !== "refunded" &&
    booking.paymentStatus !== "deposit_forfeited";
  const canDisburseRefund =
    canManageSettings && booking.paymentStatus === "refund_pending";
  const hasMenuActions = canManage && (canUpdateProgress || canManageSettings);

  const handleReschedule = async () => {
    const nextDate = new Date(rescheduledTime);
    if (!rescheduledTime || Number.isNaN(nextDate.getTime())) {
      showToast("Choose a valid appointment date and time.", "error");
      return;
    }
    try {
      await updateBooking({
        bookingId: booking.id,
        payload: {
          new_date: format(nextDate, "yyyy-MM-dd"),
          new_start_time: format(nextDate, "HH:mm"),
        },
      });
      setIsRescheduling(false);
      showToast("Booking rescheduled.", "success");
    } catch (error) {
      showToast(
        error instanceof Error
          ? error.message
          : "Could not reschedule booking.",
        "error",
      );
    }
  };

  const handleUpdateStatus = async (status: "IN_PROGRESS" | "COMPLETED") => {
    try {
      await updateBooking({ bookingId: booking.id, payload: { status } });
      showToast(
        status === "COMPLETED"
          ? "Booking marked completed."
          : "Booking marked in progress.",
        "success",
      );
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : "Could not update booking.",
        "error",
      );
    }
  };

  const handleCancel = async () => {
    try {
      await cancelBooking({
        bookingId: booking.id,
        reason: cancelReason.trim(),
      });
      setShowCancelConfirmation(false);
      showToast("Booking cancelled.", "success");
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : "Could not cancel booking.",
        "error",
      );
    }
  };

  const handleCheckout = async () => {
    const amount = Number(checkoutAmount);
    if (
      !Number.isFinite(amount) ||
      amount <= 0 ||
      amount > (booking.balanceDue ?? 0)
    ) {
      showToast(
        "Enter an amount greater than zero and no more than the balance due.",
        "error",
      );
      return;
    }
    if (checkoutMethod === "TRANSFER" && !checkoutBankId) {
      showToast("Select the receiving bank account for a transfer.", "error");
      return;
    }
    try {
      await checkoutBooking({
        bookingId: booking.id,
        payload: {
          amount_received: amount.toFixed(2),
          method: checkoutMethod,
          bank_id: checkoutMethod === "TRANSFER" ? checkoutBankId : null,
        },
      });
      setShowCheckout(false);
      showToast("Balance payment recorded.", "success");
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : "Could not record payment.",
        "error",
      );
    }
  };

  const handleDisburseRefund = async () => {
    try {
      await disburseRefund({
        bookingId: booking.id,
        payload: {
          disbursement_method: refundMethod,
          reference: refundReference.trim() || undefined,
          notes: refundNotes.trim() || undefined,
        },
      });
      setShowRefund(false);
      showToast("Refund marked as disbursed.", "success");
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : "Could not disburse refund.",
        "error",
      );
    }
  };

  return (
    <div className="w-full min-w-0 space-y-5 sm:space-y-6">
      <BookingPageHeader
        title="Booking details"
        trailing={
          <StatusBadge tone={bookingTone} label={humanize(booking.status)} />
        }
      />

      <div className="mx-auto grid w-full max-w-5xl gap-5 lg:grid-cols-[minmax(0,1.35fr)_minmax(280px,0.9fr)]">
        <div className="min-w-0 space-y-5">
          {/* Payment comes first: it holds the main action */}
          <PaymentSummary
            booking={booking}
            canRecordPayment={canRecordPayment}
            canDisburseRefund={canDisburseRefund}
            onRecordPayment={() => setShowCheckout(true)}
            onDisburseRefund={() => setShowRefund(true)}
          />

          <section className="rounded-2xl border border-grey-5 bg-white p-4 sm:p-6">
            <p className="mb-2 text-[10px] font-extrabold uppercase tracking-widest text-grey-3">
              Appointment
            </p>
            <DetailRow
              label="Reference"
              value={booking.reference || booking.id}
            />
            <DetailRow label="Service" value={booking.serviceName} />
            <DetailRow
              label="Date"
              value={format(startsAt, "EEEE, MMM d, yyyy")}
            />
            <DetailRow
              label="Time"
              value={`${format(startsAt, "h:mm a")} – ${format(endsAt, "h:mm a")}`}
            />
            <DetailRow
              label="Duration"
              value={`${booking.durationMinutes} minutes`}
            />
            <DetailRow
              label="Staff"
              value={booking.staffName || "Not assigned"}
            />
            <DetailRow
              label="Booking source"
              value={booking.source === "storefront" ? "Storefront" : "Staff"}
            />

            {isRescheduling && canManage && canManageSettings && (
              <div className="mt-5 rounded-xl border border-grey-5 bg-grey-6 p-4">
                <label className="block space-y-1.5 text-sm font-semibold text-grey-2">
                  New appointment date and time
                  <Input
                    type="datetime-local"
                    value={rescheduledTime}
                    onChange={(event) => setRescheduledTime(event.target.value)}
                    className="h-10 rounded-lg bg-white text-sm"
                  />
                </label>
                <div className="mt-3 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsRescheduling(false)}
                  >
                    Keep current time
                  </Button>
                  <Button
                    type="button"
                    onClick={handleReschedule}
                    disabled={isUpdating}
                  >
                    {isUpdating ? "Saving..." : "Save new time"}
                  </Button>
                </div>
              </div>
            )}

            {showCancelConfirmation && canManage && canManageSettings && (
              <div className="mt-5 flex flex-col gap-3 rounded-xl border border-error-1/20 bg-error-2 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex-1 space-y-2">
                  <p className="text-sm font-semibold text-grey-1">
                    Cancel this appointment? This action can’t be undone.
                  </p>
                  <Input
                    aria-label="Cancellation reason"
                    placeholder="Cancellation reason"
                    value={cancelReason}
                    onChange={(event) => setCancelReason(event.target.value)}
                    className="h-10 bg-white"
                  />
                </div>
                <div className="flex shrink-0 gap-2 sm:self-end">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowCancelConfirmation(false)}
                  >
                    Keep booking
                  </Button>
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={handleCancel}
                    disabled={isCancelling || !cancelReason.trim()}
                  >
                    {isCancelling ? "Cancelling..." : "Confirm cancel"}
                  </Button>
                </div>
              </div>
            )}
          </section>
        </div>

        <section className="h-fit rounded-2xl border border-grey-5 bg-white p-4 sm:p-5">
          <div className="flex items-center gap-3 border-b border-grey-6 pb-4">
            <InitialsAvatar name={booking.customerName} size="md" />
            <div className="min-w-0">
              <h2 className="truncate text-sm font-extrabold text-grey-1">
                {booking.customerName}
              </h2>
              <p className="text-xs text-grey-3">Customer</p>
            </div>
          </div>
          <div className="flex items-center gap-2 border-b border-grey-6 py-4 text-sm text-grey-2">
            <Phone className="h-4 w-4 shrink-0 text-grey-3" />
            <span className="break-all">{booking.customerPhone || "—"}</span>
          </div>
          <div className="flex items-center gap-2 border-b border-grey-6 py-4 text-sm text-grey-2">
            <Mail className="h-4 w-4 shrink-0 text-grey-3" />
            <span className="break-all">{booking.customerEmail || "—"}</span>
          </div>
          <div className="flex items-center gap-2 py-4 text-sm text-grey-2">
            <UserRound className="h-4 w-4 shrink-0 text-grey-3" />
            <span>
              {booking.source === "storefront"
                ? "Booked from storefront"
                : "Added by staff"}
            </span>
          </div>
          <div className="mt-1 flex items-center gap-2">
            {booking.customerId ? (
              <Button variant="outline" asChild className="min-w-0 flex-1">
                <Link
                  href={`/customers/${encodeURIComponent(booking.customerId)}`}
                >
                  View customer profile
                </Link>
              </Button>
            ) : (
              <Button
                type="button"
                variant="outline"
                disabled
                className="min-w-0 flex-1"
              >
                Customer profile unavailable
              </Button>
            )}
            {hasMenuActions && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="shrink-0"
                    aria-label="More booking actions"
                    title="More actions"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="min-w-[220px] border border-grey-5 bg-white shadow-lg"
                >
                  {canUpdateProgress && (
                    <DropdownMenuItem
                      disabled={isUpdating}
                      onSelect={() =>
                        void handleUpdateStatus(
                          booking.status === "in_progress"
                            ? "COMPLETED"
                            : "IN_PROGRESS",
                        )
                      }
                      className="cursor-pointer px-3 py-2"
                    >
                      <Check className="mr-2 h-4 w-4 text-primary-green-300" />
                      {booking.status === "in_progress"
                        ? "Mark completed"
                        : "Start appointment"}
                    </DropdownMenuItem>
                  )}
                  {canManageSettings && (
                    <>
                      <DropdownMenuItem
                        onSelect={() => {
                          setShowCancelConfirmation(false);
                          setRescheduledTime(formatLocalDateTime(startsAt));
                          setIsRescheduling(true);
                        }}
                        className="cursor-pointer px-3 py-2"
                      >
                        <CalendarClock className="mr-2 h-4 w-4" />
                        Reschedule
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onSelect={() => {
                          setIsRescheduling(false);
                          setShowCancelConfirmation(true);
                        }}
                        className="cursor-pointer px-3 py-2 text-error-1 focus:text-error-1"
                      >
                        <X className="mr-2 h-4 w-4" />
                        Cancel booking
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </section>
      </div>

      <CustomModal
        isOpen={showCheckout}
        onClose={() => setShowCheckout(false)}
        title="Record balance payment"
        description={`Balance due: ${currency(booking.balanceDue ?? 0)}. Record the amount collected at the business.`}
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowCheckout(false)}>
              Cancel
            </Button>
            <Button onClick={handleCheckout} disabled={isCheckingOut}>
              {isCheckingOut ? "Recording..." : "Record payment"}
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <label className="block space-y-1.5 text-sm font-medium text-grey-2">
            Amount received
            <Input
              type="number"
              min="0.01"
              max={booking.balanceDue}
              step="0.01"
              value={checkoutAmount}
              onChange={(event) => setCheckoutAmount(event.target.value)}
            />
          </label>
          <label className="block space-y-1.5 text-sm font-medium text-grey-2">
            Payment method
            <select
              className="h-10 w-full rounded-lg border border-grey-5 bg-white px-3 text-sm"
              value={checkoutMethod}
              onChange={(event) =>
                setCheckoutMethod(event.target.value as typeof checkoutMethod)
              }
            >
              <option value="CASH">Cash</option>
              <option value="CARD">Card</option>
              <option value="TRANSFER">Transfer</option>
            </select>
          </label>
          {checkoutMethod === "TRANSFER" && (
            <label className="block space-y-1.5 text-sm font-medium text-grey-2">
              Receiving bank account
              <select
                className="h-10 w-full rounded-lg border border-grey-5 bg-white px-3 text-sm"
                value={checkoutBankId}
                onChange={(event) => setCheckoutBankId(event.target.value)}
              >
                <option value="">Select an account</option>
                {banks.map((bank) => (
                  <option key={bank.id} value={bank.id}>
                    {bank.bank_name} · {bank.account_number}
                  </option>
                ))}
              </select>
            </label>
          )}
        </div>
      </CustomModal>

      <Dialog open={showRefund} onOpenChange={setShowRefund}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Disburse refund</DialogTitle>
            <DialogDescription>
              Record the manual refund disbursement for this cancelled booking.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <label className="block space-y-1.5 text-sm font-medium text-grey-2">
              Disbursement method
              <select
                className="h-10 w-full rounded-lg border border-grey-5 bg-white px-3 text-sm"
                value={refundMethod}
                onChange={(event) =>
                  setRefundMethod(event.target.value as typeof refundMethod)
                }
              >
                <option value="BANK_TRANSFER">Bank transfer</option>
                <option value="CASH">Cash</option>
              </select>
            </label>
            <label className="block space-y-1.5 text-sm font-medium text-grey-2">
              Reference (optional)
              <Input
                value={refundReference}
                onChange={(event) => setRefundReference(event.target.value)}
              />
            </label>
            <label className="block space-y-1.5 text-sm font-medium text-grey-2">
              Notes (optional)
              <Input
                value={refundNotes}
                onChange={(event) => setRefundNotes(event.target.value)}
              />
            </label>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRefund(false)}>
              Cancel
            </Button>
            <Button onClick={handleDisburseRefund} disabled={isDisbursing}>
              {isDisbursing ? "Submitting..." : "Mark as disbursed"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BookingDetailsPage;

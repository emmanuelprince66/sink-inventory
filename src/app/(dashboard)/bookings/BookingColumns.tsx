import { Booking } from "@/types/booking";
import { format, parseISO } from "date-fns";
import { ColumnDef } from "@tanstack/react-table";

const STATUS_STYLES: Record<Booking["status"], string> = {
  confirmed: "bg-success-2 text-success-1",
  in_progress: "bg-warning-2 text-warning-1",
  completed: "bg-info-2 text-info-1",
  cancelled: "bg-error-2 text-error-1",
  no_show: "bg-grey-6 text-grey-2",
  pending: "bg-warning-2 text-warning-1",
};

const PAYMENT_STYLES: Record<Booking["paymentStatus"], string> = {
  paid: "bg-success-2 text-success-1",
  unpaid: "bg-grey-6 text-grey-2",
  pending: "bg-warning-2 text-warning-1",
  deposit_paid: "bg-warning-2 text-warning-1",
  refund_pending: "bg-error-2 text-error-1",
  refunded: "bg-info-2 text-info-1",
  deposit_forfeited: "bg-grey-6 text-grey-2",
};

const Pill = ({ label, className }: { label: string; className: string }) => (
  <span
    className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-extrabold capitalize ${className}`}
  >
    {label}
  </span>
);

export const createBookingColumns = (): ColumnDef<Booking>[] => [
  {
    accessorKey: "startsAt",
    header: "Time",
    cell: ({ row }) => (
      <span className="font-bold text-grey-2">
        {format(parseISO(row.original.startsAt), "h:mm a")}
      </span>
    ),
  },
  {
    accessorKey: "customerName",
    header: "Customer",
    cell: ({ row }) => (
      <div className="min-w-40">
        <p className="font-bold text-grey-1">{row.original.customerName}</p>
        <p className="mt-0.5 text-xs text-grey-3">
          {row.original.customerPhone}
        </p>
      </div>
    ),
  },
  {
    accessorKey: "serviceName",
    header: "Service",
    cell: ({ row }) => (
      <div>
        <p className="font-semibold text-grey-1">{row.original.serviceName}</p>
        <p className="mt-0.5 text-xs text-grey-3">
          {row.original.durationMinutes} min · {row.original.staffName}
        </p>
      </div>
    ),
  },
  {
    accessorKey: "source",
    header: "Source",
    cell: ({ row }) => (
      <span
        className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold ${
          row.original.source === "storefront"
            ? "bg-info-2 text-info-1"
            : "bg-grey-6 text-grey-2"
        }`}
      >
        {row.original.source === "storefront" ? "Storefront" : "Staff"}
      </span>
    ),
  },
  {
    accessorKey: "amount",
    header: "Amount",
    cell: ({ row }) => (
      <span className="font-bold text-grey-1">
        {new Intl.NumberFormat("en-NG", {
          style: "currency",
          currency: "NGN",
          maximumFractionDigits: 0,
        }).format(row.original.amount)}
      </span>
    ),
  },
  {
    accessorKey: "paymentStatus",
    header: "Payment",
    cell: ({ row }) => (
      <Pill
        label={row.original.paymentStatus.replaceAll("_", " ")}
        className={PAYMENT_STYLES[row.original.paymentStatus]}
      />
    ),
  },
  {
    accessorKey: "status",
    header: "Booking status",
    cell: ({ row }) => (
      <Pill
        label={row.original.status.replaceAll("_", " ")}
        className={STATUS_STYLES[row.original.status]}
      />
    ),
  },
];

export const getBookingStatusClass = (status: Booking["status"]) =>
  STATUS_STYLES[status];

export const getBookingPaymentClass = (
  status: Booking["paymentStatus"],
) => PAYMENT_STYLES[status];

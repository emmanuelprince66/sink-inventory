import type { PendingBnplOrder } from "@/api/business/pending-bnpl";
import { cn } from "@/lib/utils";
import { formatToNaira } from "@/utils/formatMoney";
import { ColumnDef } from "@tanstack/react-table";
import moment from "moment";

/**
 * Columns for the pending BNPL settlements table.
 *
 * Gross, fee and net all get their own column rather than one "amount": the
 * whole point of the screen is the gap between what the customer was charged
 * and what reaches the wallet.
 */

const money = (value: unknown) => {
  const parsed = Number(value ?? 0);
  return formatToNaira(Number.isFinite(parsed) ? parsed : 0);
};

/**
 * Tone per stage. Settled is done and reads as such; a retry is the only one
 * that has actually gone wrong, so it is the one that has to stand out.
 */
const STAGE_TONES: Record<string, string> = {
  SETTLED: "bg-success-2 text-success-1",
  PROCESSING_PAYOUT: "bg-info-2 text-info-1",
  FAILED_RETRYING: "bg-error-2 text-error-1",
  AWAITING_SETTLEMENT: "bg-warning-2 text-warning-1",
};

const stageTone = (stage: string) =>
  STAGE_TONES[String(stage).toUpperCase()] ?? "bg-grey-6 text-grey-2";

export const pendingBnplColumns: ColumnDef<PendingBnplOrder>[] = [
  {
    accessorKey: "order_reference",
    header: "Order",
    cell: ({ row }) => (
      <p className="text-sm font-bold text-primary-green-300">
        {row.original.order_reference}
      </p>
    ),
  },
  {
    accessorKey: "customer",
    header: "Customer",
    cell: ({ row }) => {
      const customer = row.original.customer;
      return (
        <div className="min-w-0">
          {/* A walk-in was never tied to a customer record, so the reference is
              the only handle on the sale — say so rather than showing a dash. */}
          <p className="truncate text-sm text-grey-2">
            {customer?.name ?? "Walk-in customer"}
          </p>
          {customer?.phone && (
            <p className="truncate text-xs text-grey-3">{customer.phone}</p>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "order_date",
    header: "Date",
    cell: ({ row }) => {
      const date = moment(row.original.order_date);
      const settled = row.original.settled_at
        ? moment(row.original.settled_at)
        : null;
      return (
        <div>
          <p className="text-sm text-grey-2">
            {date.isValid() ? date.format("DD MMM YYYY") : "—"}
          </p>
          {/* Once it has been paid out, when it landed is the more useful of
              the two dates — the gap between them is the wait. */}
          {settled?.isValid() ? (
            <p className="text-xs text-success-1">
              Paid {settled.format("DD MMM YYYY")}
            </p>
          ) : (
            date.isValid() && (
              <p className="text-xs text-grey-3">{date.format("h:mm a")}</p>
            )
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "settlement_stage",
    header: "Stage",
    cell: ({ row }) => {
      const order = row.original;
      return (
        // The description is a whole sentence — too long for a cell, but worth
        // keeping within reach, so it rides on the badge as a tooltip.
        <span
          title={order.stage_description}
          className={cn(
            "inline-block whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-bold",
            stageTone(order.settlement_stage),
          )}
        >
          {order.stage_label}
        </span>
      );
    },
  },
  {
    accessorKey: "order_amount",
    header: "Order amount",
    cell: ({ row }) => (
      <p className="text-sm text-grey-2">{money(row.original.order_amount)}</p>
    ),
  },
  {
    accessorKey: "fee_deducted",
    header: "Fee",
    cell: ({ row }) => (
      <div>
        <p className="text-sm text-error-1">
          −{money(row.original.fee_deducted)}
        </p>
        <p className="text-xs text-grey-3">{row.original.fee_rate}</p>
      </div>
    ),
  },
  {
    accessorKey: "net_settlement_amount",
    header: "You receive",
    cell: ({ row }) => (
      <p className="text-sm font-extrabold text-grey-1">
        {money(row.original.net_settlement_amount)}
      </p>
    ),
  },
];

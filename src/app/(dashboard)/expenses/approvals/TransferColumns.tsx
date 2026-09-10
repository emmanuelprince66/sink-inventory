"use client";

import { Button } from "@/components/ui/button";
import {
  canCurrentUserApprove,
  type ExpenseTransfer,
  isPending,
} from "@/types/expense-governance";
import { formatToNaira } from "@/utils/formatMoney";
import type { ColumnDef } from "@tanstack/react-table";
import { Eye } from "lucide-react";
import moment from "moment";
import TransferStatusBadge from "./TransferStatusBadge";

/**
 * The approval queue as table rows.
 *
 * A row carries only what an approver triages on — who wants how much, out of
 * which category, and where it is going. Narration, the full reference and the
 * decision trail live in the details modal, so scanning twenty requests stays
 * possible and deciding one still happens against the whole picture.
 *
 * Built by a factory rather than declared at module scope because the action
 * column needs the parent's handler. Columns declared at module scope would
 * otherwise have to reach for state through a hook inside `cell`, which is how
 * the older expense table ended up calling `useState` in a render callback.
 */
export const buildTransferColumns = ({
  onView,
}: {
  onView: (transfer: ExpenseTransfer) => void;
}): ColumnDef<ExpenseTransfer>[] => [
  {
    accessorKey: "created_at",
    header: "Requested",
    cell: ({ row }) => {
      const transfer = row.original;
      return (
        <div className="min-w-0">
          <p
            className="text-sm font-medium text-grey-1"
            title={moment(transfer.created_at).format("MMM D, YYYY h:mm A")}
          >
            {moment(transfer.created_at).format("MMM D, YYYY")}
          </p>
          <p className="mt-0.5 text-xs text-grey-4">
            {moment(transfer.created_at).fromNow()}
          </p>
        </div>
      );
    },
  },
  {
    accessorKey: "beneficiary_account_name",
    header: "Beneficiary",
    cell: ({ row }) => {
      const transfer = row.original;
      return (
        <div className="min-w-0 max-w-[220px]">
          <p className="truncate text-sm font-bold text-grey-1">
            {transfer.beneficiary_account_name || "—"}
          </p>
          <p className="mt-0.5 truncate text-xs text-grey-3">
            {transfer.beneficiary_bank_name} ·{" "}
            {transfer.beneficiary_account_number}
          </p>
        </div>
      );
    },
  },
  {
    accessorKey: "initiated_by_name",
    header: "Requested by",
    cell: ({ row }) => {
      const transfer = row.original;
      return (
        <div className="min-w-0 max-w-[160px]">
          <p className="truncate text-sm text-grey-2">
            {transfer.initiated_by_name || "—"}
          </p>
          <p className="mt-0.5 truncate text-xs text-grey-4">
            {transfer.category_name || "Uncategorised"}
          </p>
        </div>
      );
    },
  },
  {
    accessorKey: "amount",
    header: "Amount",
    cell: ({ row }) => {
      const transfer = row.original;
      const amount = Number(transfer.amount ?? 0);
      const charges = Number(transfer.charges ?? 0);
      return (
        <div className="min-w-0">
          <p className="text-sm font-extrabold text-grey-1">
            {formatToNaira(amount)}
          </p>
          {/* The wallet is debited for amount + charges, so the amount alone
              understates what the payout actually costs. */}
          {charges > 0 && (
            <p className="mt-0.5 text-xs text-grey-4">
              {formatToNaira(amount + charges)} total
            </p>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const transfer = row.original;
      const awaitingYou =
        isPending(transfer.status) &&
        canCurrentUserApprove(transfer.can_current_user_approve);

      return (
        <div className="flex flex-col items-start gap-1">
          <TransferStatusBadge status={transfer.status} />
          {/* Marks the rows this person can actually clear, so a queue mixing
              their decisions with everyone else's is still scannable. */}
          {awaitingYou && (
            <span className="text-[10px] font-bold text-primary-green-300">
              Needs your decision
            </span>
          )}
        </div>
      );
    },
  },
  {
    id: "actions",
    header: "Action",
    cell: ({ row }) => {
      const transfer = row.original;
      return (
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5 whitespace-nowrap"
          onClick={(e) => {
            // The row itself opens the same modal; without this the click runs
            // twice and the second one toggles it straight back shut.
            e.stopPropagation();
            onView(transfer);
          }}
        >
          <Eye className="h-3.5 w-3.5" />
          View details
        </Button>
      );
    },
  },
];

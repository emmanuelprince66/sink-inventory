"use client";

import { useFetchExpenseTransfersQuery } from "@/api/expenses/expense-transfers";
import { useBusinessStore } from "@/lib/store/useBusinessStore";
import {
  canCurrentUserApprove,
  type ExpenseTransfer,
} from "@/types/expense-governance";
import { formatToNaira } from "@/utils/formatMoney";
import { ChevronRight, ClipboardCheck } from "lucide-react";
import Link from "next/link";

/**
 * Payouts waiting on a decision, said on the page rather than in a menu.
 *
 * The approvals queue was only reachable from the ⋯ dropdown, so an approver
 * had no way of knowing something was waiting without going to look — which
 * is the one thing a queue has to tell you by itself. This puts the count
 * where it will be seen, and stays silent when there is nothing to do rather
 * than becoming furniture people learn to skip.
 *
 * Deliberately not gated on `canApprove` alone: someone who raised a request
 * wants to know it is still sitting there too, and the count they see is the
 * same queue either way — the wording is what changes.
 */
const PendingApprovalsBanner = ({
  canApprove,
  relevant,
}: {
  canApprove: boolean;
  relevant: boolean;
}) => {
  const business_id = useBusinessStore((state) => state.business_id);

  const { data } = useFetchExpenseTransfersQuery({
    params: { id: business_id, status: "PENDING_APPROVAL", page: 1 },
    enabled: relevant && Boolean(business_id),
  });

  if (!relevant) return null;

  const payload = data?.data;
  const transfers: ExpenseTransfer[] = payload?.results ?? [];
  const total = Number(payload?.total ?? transfers.length);

  if (!total) return null;

  // What this person could clear right now, as opposed to what merely exists.
  // Only counted across the first page, so it is phrased as "some of these"
  // rather than as an exact figure it cannot back up.
  const actionableHere = transfers.filter((transfer) =>
    canCurrentUserApprove(transfer.can_current_user_approve),
  ).length;

  const value = transfers.reduce(
    (sum, transfer) => sum + Number(transfer.amount ?? 0),
    0,
  );

  return (
    <Link
      href="/expenses/approvals"
      className="flex w-full items-center gap-3 rounded-2xl border border-primary-green-300 bg-secondary-6 p-4 transition-colors hover:bg-secondary-6/70"
    >
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-green-300 text-white">
        <ClipboardCheck className="h-5 w-5" />
      </span>

      <div className="min-w-0 flex-1">
        <p className="text-sm font-extrabold text-grey-1">
          {total} payout{total === 1 ? "" : "s"} waiting on a decision
        </p>
        <p className="mt-0.5 text-xs text-grey-3">
          {canApprove
            ? actionableHere > 0
              ? `${actionableHere} on this page ${actionableHere === 1 ? "needs" : "need"} yours. Worth ${formatToNaira(value)} in total.`
              : `None of them are yours to release — they are waiting on someone else.`
            : "Yours are in here too. An approver decides them."}
        </p>
      </div>

      <ChevronRight className="h-5 w-5 shrink-0 text-primary-green-300" />
    </Link>
  );
};

export default PendingApprovalsBanner;

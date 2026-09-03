"use client";

import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { type ExpenseTransfer, isPending } from "@/types/expense-governance";
import { formatToNaira } from "@/utils/formatMoney";
import { AlertTriangle, Check, Landmark, X } from "lucide-react";
import moment from "moment";
import TransferStatusBadge from "./TransferStatusBadge";

/**
 * One payout request.
 *
 * The Approve and Reject buttons key off `can_current_user_approve` alone.
 * That flag is computed per-user by the backend from role, permissions and the
 * approval cap, so re-deriving it here would only create a second opinion that
 * can disagree with the one the API enforces.
 */

/**
 * The flag, read defensively.
 *
 * The OpenAPI schema types can_current_user_approve as a string rather than a
 * boolean — the shape of an untyped SerializerMethodField. If it ever arrives
 * as "false", a plain truthiness test would offer Approve and Reject to someone
 * the backend will refuse, so the string forms are handled explicitly.
 */
const canApprove = (value: unknown): boolean => {
  if (typeof value === "string") {
    return !["false", "0", "", "null", "none"].includes(value.toLowerCase());
  }
  return Boolean(value);
};

const TransferCard = ({
  transfer,
  onApprove,
  onReject,
  deciding,
}: {
  transfer: ExpenseTransfer;
  onApprove: (transfer: ExpenseTransfer) => void;
  onReject: (transfer: ExpenseTransfer) => void;
  deciding?: boolean;
}) => {
  const amount = Number(transfer.amount ?? 0);
  const charges = Number(transfer.charges ?? 0);
  const actionable =
    isPending(transfer.status) && canApprove(transfer.can_current_user_approve);

  return (
    <div className="rounded-2xl border border-grey-5 bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-lg font-extrabold text-grey-1">
              {formatToNaira(amount)}
            </p>
            <TransferStatusBadge status={transfer.status} />
          </div>
          {/* The wallet is debited for amount + charges, so showing only the
              amount understates what the payout actually costs. */}
          {charges > 0 && (
            <p className="mt-0.5 text-xs text-grey-4">
              + {formatToNaira(charges)} bank charge ·{" "}
              <span className="font-bold text-grey-3">
                {formatToNaira(amount + charges)} total
              </span>
            </p>
          )}
        </div>
        <p
          className="shrink-0 text-[11px] text-grey-4"
          title={moment(transfer.created_at).format("MMM D, YYYY h:mm A")}
        >
          {moment(transfer.created_at).fromNow()}
        </p>
      </div>

      <div className="mt-3 flex items-start gap-2 rounded-xl bg-grey-6 p-3">
        <Landmark className="mt-0.5 h-4 w-4 shrink-0 text-grey-3" />
        <div className="min-w-0 text-xs">
          <p className="font-bold text-grey-1">
            {transfer.beneficiary_account_name || "—"}
          </p>
          <p className="mt-0.5 text-grey-3">
            {transfer.beneficiary_bank_name} ·{" "}
            {transfer.beneficiary_account_number}
          </p>
        </div>
      </div>

      <div className="mt-3 space-y-1 text-xs text-grey-3">
        {transfer.narration && (
          <p className="text-grey-2">{transfer.narration}</p>
        )}
        <p>
          Requested by{" "}
          <span className="font-bold text-grey-2">
            {transfer.initiated_by_name}
          </span>
          {transfer.category_name ? ` · ${transfer.category_name}` : ""}
        </p>
        <p className="text-grey-4">Ref {transfer.payment_reference}</p>
      </div>

      {transfer.status === "PENDING_OWNER_APPROVAL" && (
        <div className="mt-3 flex items-start gap-2 rounded-xl border border-warning-1/30 bg-warning-2 p-3">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-warning-1" />
          <p className="text-xs text-grey-2">
            Above the staff approval cap — only the owner can release this one.
          </p>
        </div>
      )}

      {/* Outcomes, once there is one. A rejected request is only useful to the
          person who raised it if the reason travels with it. */}
      {transfer.rejection_reason && (
        <div className="mt-3 rounded-xl border border-grey-5 bg-grey-6 p-3">
          <p className="text-[10px] font-bold uppercase tracking-wide text-grey-4">
            Rejected by {transfer.rejected_by_name || "an approver"}
          </p>
          <p className="mt-1 text-xs text-grey-2">
            {transfer.rejection_reason}
          </p>
        </div>
      )}

      {transfer.approved_by_name && !transfer.rejection_reason && (
        <p className="mt-3 text-xs text-grey-4">
          Approved by{" "}
          <span className="font-bold text-grey-3">
            {transfer.approved_by_name}
          </span>
          {transfer.approved_at
            ? ` · ${moment(transfer.approved_at).format("MMM D, h:mm A")}`
            : ""}
        </p>
      )}

      {actionable && (
        <div className="mt-4 flex gap-3">
          <Button
            variant="outline"
            className="flex-1 gap-2 border-error-1/40 text-error-1 hover:bg-error-2"
            onClick={() => onReject(transfer)}
            disabled={deciding}
          >
            <X className="h-4 w-4" />
            Reject
          </Button>
          <Button
            className="flex-1 gap-2"
            onClick={() => onApprove(transfer)}
            disabled={deciding}
          >
            {deciding ? (
              <Spinner className="mr-1" size="sm" />
            ) : (
              <Check className="h-4 w-4" />
            )}
            Approve & send
          </Button>
        </div>
      )}

      {/* Explains the absence of buttons rather than leaving a reviewer
          wondering whether the page is broken. */}
      {isPending(transfer.status) && !canApprove(transfer.can_current_user_approve) && (
        <p className="mt-4 rounded-xl bg-grey-6 px-3 py-2 text-xs text-grey-4">
          Waiting on someone with approval rights for this amount.
        </p>
      )}
    </div>
  );
};

export default TransferCard;

"use client";

import { CustomModal } from "@/components/app/CustomModal";
import { Button } from "@/components/ui/button";
import { useUserRole } from "@/lib/store/user-store";
import { cn } from "@/lib/utils";
import {
  approvalBlockReason,
  canCurrentUserApprove,
  type ExpenseTransfer,
  isPending,
} from "@/types/expense-governance";
import { formatToNaira } from "@/utils/formatMoney";
import {
  AlertTriangle,
  ArrowRight,
  Check,
  Landmark,
  Receipt,
  X,
} from "lucide-react";
import moment from "moment";
import TransferStatusBadge from "./TransferStatusBadge";

/**
 * Everything about one payout request, and the decision on it.
 *
 * The table row carries only what an approver needs to triage — who wants how
 * much, and for what. The rest (narration, bank details, the reference, who
 * decided and when) lives here, because a decision to move money should be
 * made against the full request rather than a truncated row.
 *
 * Approve and Reject key off `can_current_user_approve` alone. That flag is
 * computed per-user by the backend from role, permissions and the approval
 * cap, so re-deriving it here would only create a second opinion that can
 * disagree with the one the API enforces.
 */

/** One label/value pair in the detail grid. */
const Field = ({
  label,
  value,
  className,
}: {
  label: string;
  value: React.ReactNode;
  className?: string;
}) => (
  <div className={cn("min-w-0", className)}>
    <p className="text-[10px] font-bold uppercase tracking-wider text-grey-4">
      {label}
    </p>
    <div className="mt-1 text-sm font-medium text-grey-1 break-words">
      {value}
    </div>
  </div>
);

const TransferDetailsModal = ({
  transfer,
  onClose,
  onApprove,
  onReject,
  deciding,
}: {
  transfer: ExpenseTransfer | null;
  onClose: () => void;
  onApprove: (transfer: ExpenseTransfer) => void;
  onReject: (transfer: ExpenseTransfer) => void;
  deciding?: boolean;
}) => {
  const { id: currentUserId } = useUserRole();

  if (!transfer) return null;

  const amount = Number(transfer.amount ?? 0);
  const charges = Number(transfer.charges ?? 0);
  const pending = isPending(transfer.status);
  const actionable =
    pending && canCurrentUserApprove(transfer.can_current_user_approve);

  const blockReason = pending
    ? approvalBlockReason(
        {
          can_current_user_approve: canCurrentUserApprove(
            transfer.can_current_user_approve,
          ),
          initiated_by: transfer.initiated_by,
          status: transfer.status,
        },
        currentUserId,
      )
    : null;

  return (
    <CustomModal
      isOpen={Boolean(transfer)}
      onClose={onClose}
      trigger={false}
      size="lg"
      title="Transfer request"
      description={transfer.payment_reference}
      headerIcon={
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-grey-1 text-white">
          <Receipt className="h-4 w-4" />
        </div>
      }
      footer={
        actionable ? (
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button
              variant="outline"
              onClick={() => onReject(transfer)}
              disabled={deciding}
              className="border-error-1/40 text-error-1 hover:bg-error-2"
            >
              <X className="mr-1.5 h-4 w-4" />
              Reject
            </Button>
            <Button onClick={() => onApprove(transfer)} disabled={deciding}>
              <Check className="mr-1.5 h-4 w-4" />
              Approve &amp; send
            </Button>
          </div>
        ) : blockReason ? (
          // Explains the absence of buttons rather than leaving a reviewer
          // wondering whether the screen is broken. The commonest reason is
          // separation of duties — whoever asked for the money never releases
          // it — and that reads as a bug unless it is said out loud.
          <p className="text-xs text-grey-4">{blockReason}</p>
        ) : (
          <div className="flex justify-end">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        )
      }
    >
      <div className="space-y-5">
        {/* What it costs. The wallet is debited for amount + charges, so
            leading with the amount alone understates the payout. */}
        <div className="rounded-2xl border border-grey-5 bg-grey-6 p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-2xl font-extrabold text-grey-1">
              {formatToNaira(amount)}
            </p>
            <TransferStatusBadge status={transfer.status} />
          </div>
          {charges > 0 && (
            <div className="mt-2 flex flex-wrap items-center gap-x-1.5 text-xs text-grey-3">
              <span>{formatToNaira(amount)}</span>
              <span className="text-grey-4">+</span>
              <span>{formatToNaira(charges)} bank charge</span>
              <ArrowRight className="h-3 w-3 text-grey-4" />
              <span className="font-extrabold text-grey-1">
                {formatToNaira(amount + charges)} leaves the wallet
              </span>
            </div>
          )}
        </div>

        {/* Who gets paid. */}
        <div className="flex items-start gap-3 rounded-2xl border border-grey-5 p-4">
          <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-grey-6 text-grey-3">
            <Landmark className="h-4 w-4" />
          </span>
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-wider text-grey-4">
              Beneficiary
            </p>
            <p className="mt-1 text-sm font-extrabold text-grey-1">
              {transfer.beneficiary_account_name || "—"}
            </p>
            <p className="mt-0.5 text-xs text-grey-3">
              {transfer.beneficiary_bank_name} ·{" "}
              {transfer.beneficiary_account_number}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field
            label="Category"
            value={transfer.category_name || "Uncategorised"}
          />
          <Field
            label="Requested by"
            value={transfer.initiated_by_name || "—"}
          />
          <Field
            label="Requested on"
            value={moment(transfer.created_at).format("MMM D, YYYY · h:mm A")}
          />
          <Field
            label="Reference"
            value={
              <span className="font-mono text-xs break-all text-grey-2">
                {transfer.payment_reference}
              </span>
            }
          />
          <Field
            className="sm:col-span-2"
            label="Narration"
            value={
              transfer.narration ? (
                transfer.narration
              ) : (
                <span className="text-grey-4">
                  No narration was given for this request.
                </span>
              )
            }
          />
        </div>

        {transfer.status === "PENDING_OWNER_APPROVAL" && (
          <div className="flex items-start gap-2 rounded-xl border border-warning-1/30 bg-warning-2 p-3">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-warning-1" />
            <p className="text-xs text-grey-2">
              Above the staff approval cap — only the business owner can release
              this one.
            </p>
          </div>
        )}

        {/* Outcomes, once there is one. A rejected request is only useful to
            the person who raised it if the reason travels with it. */}
        {transfer.rejection_reason && (
          <div className="rounded-xl border border-grey-5 bg-grey-6 p-3">
            <p className="text-[10px] font-bold uppercase tracking-wider text-grey-4">
              Rejected by {transfer.rejected_by_name || "an approver"}
              {transfer.rejected_at
                ? ` · ${moment(transfer.rejected_at).format("MMM D, h:mm A")}`
                : ""}
            </p>
            <p className="mt-1 text-sm text-grey-2">
              {transfer.rejection_reason}
            </p>
          </div>
        )}

        {transfer.approved_by_name && !transfer.rejection_reason && (
          <p className="text-xs text-grey-4">
            Approved by{" "}
            <span className="font-bold text-grey-3">
              {transfer.approved_by_name}
            </span>
            {transfer.approved_at
              ? ` · ${moment(transfer.approved_at).format("MMM D, YYYY h:mm A")}`
              : ""}
          </p>
        )}
      </div>
    </CustomModal>
  );
};

export default TransferDetailsModal;

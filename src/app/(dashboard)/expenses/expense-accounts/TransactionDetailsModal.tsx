"use client";

import {
  useApproveExpenseMutation,
  useRejectExpenseMutation,
} from "@/api/expenses/expense-decisions";
import { CustomModal } from "@/components/app/CustomModal";
import TransactionPinDialog from "@/components/app/TransactionPinDialog";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";
import { formatToNaira } from "@/utils/formatMoney";
import { Check, ClipboardList, User, X } from "lucide-react";
import moment from "moment";
import { useState } from "react";
import RejectTransferDialog from "../approvals/RejectTransferDialog";
import {
  getCategoryMeta,
  getDecidedBy,
  getRefLabel,
  getStatusMeta,
} from "./expense-ui-meta";

interface TransactionDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: any | null;
}

// Fed from two different (both real) sources depending on where the row was
// clicked from: /expenses/business/{id}/ (plain — id, name, amount,
// category, date, note, added_by) or /recent-activity/ (richer — adds
// reference, status, initiated_by, approved_by, created_at). Render
// defensively so either shape looks complete.
const TransactionDetailsModal = ({
  isOpen,
  onClose,
  transaction,
}: TransactionDetailsModalProps) => {
  const [approving, setApproving] = useState(false);
  const [rejecting, setRejecting] = useState(false);

  const { mutate: approve, isPending: approvePending } =
    useApproveExpenseMutation({
      onSuccess: () => {
        setApproving(false);
        onClose();
      },
    });

  const { mutate: reject, isPending: rejectPending } = useRejectExpenseMutation(
    {
      onSuccess: () => {
        setRejecting(false);
        onClose();
      },
    },
  );

  // Hooks must run on every render, so the early return waits until after them.
  if (!transaction) return null;

  const busy = approvePending || rejectPending;
  // Comes back as a boolean, but the schema types it as a string — a literal
  // "false" would otherwise be truthy and offer an Approve button that 403s.
  const canDecide =
    transaction.can_current_user_approve === true ||
    transaction.can_current_user_approve === "true";

  const categoryLabel = getRefLabel(transaction.category, "Uncategorised");
  const catMeta = getCategoryMeta(categoryLabel);
  const CatIcon = catMeta.icon;
  const addedBy = getRefLabel(
    transaction.added_by ?? transaction.initiated_by,
    "—",
  );
  // The *_name fields, not the raw *_by ids — those are UUIDs, which would
  // render as a UUID under a "Approved by" heading.
  const decidedBy = getDecidedBy(transaction);
  const hasApprovedByField =
    "approved_by" in transaction || "approved_by_name" in transaction;
  const hasStatus = Boolean(transaction.status);
  const status = getStatusMeta(transaction.status);

  return (
    <CustomModal
      isOpen={isOpen}
      onClose={onClose}
      title={transaction.reference || transaction.name || "Expense"}
      description={transaction.reference ? transaction.name : undefined}
      size="lg"
      headerIcon={
        <div className="w-9 h-9 rounded-lg bg-grey-1 flex items-center justify-center text-white">
          <ClipboardList className="w-4 h-4" />
        </div>
      }
      footer={
        <div className="flex flex-wrap items-center justify-end gap-2">
          {/* Trusted as the single source of whether this person may decide
              this expense: the backend works it out from role, permission and
              the approval cap, and separately refuses anyone approving their
              own. Re-deriving it here could only ever disagree with it. */}
          {canDecide && (
            <>
              <Button
                variant="outline"
                onClick={() => setRejecting(true)}
                disabled={busy}
                className="border-error-1/40 text-error-1 hover:bg-error-2"
              >
                <X className="mr-1.5 h-4 w-4" />
                Reject
              </Button>
              <Button onClick={() => setApproving(true)} disabled={busy}>
                {busy ? (
                  <Spinner className="mr-1.5" size="sm" />
                ) : (
                  <Check className="mr-1.5 h-4 w-4" />
                )}
                Approve
              </Button>
            </>
          )}
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      }
    >
      <div className="space-y-5">
        {/* Hero — category badge + amount (+ status if present) */}
        <div className="rounded-xl border border-grey-5 bg-secondary-6/40 p-4 sm:p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3 min-w-0">
              <div
                className={cn(
                  "w-11 h-11 rounded-xl flex items-center justify-center border shrink-0",
                  catMeta.tone,
                )}
              >
                <CatIcon className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-bold uppercase tracking-wider text-grey-3">
                  Category
                </p>
                <p className="text-sm font-bold text-grey-1 mt-0.5">
                  {categoryLabel}
                </p>
                <p className="text-2xl sm:text-3xl font-bold text-grey-1 mt-2">
                  {formatToNaira(transaction.amount)}
                </p>
              </div>
            </div>
            {hasStatus && (
              <span
                className={cn(
                  "inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full shrink-0",
                  status.pill,
                )}
              >
                <span className={cn("w-1.5 h-1.5 rounded-full", status.dot)} />
                {status.label}
              </span>
            )}
          </div>
        </div>

        {/* Accountability */}
        <Section title="Accountability">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <PersonRow
              label="Added by"
              name={addedBy}
              timestamp={
                transaction.created_at || transaction.date
                  ? moment(transaction.created_at || transaction.date).format(
                      "MMM D, YYYY",
                    )
                  : undefined
              }
            />
            {hasApprovedByField && (
              <PersonRow
                label={
                  decidedBy.decision === "rejected"
                    ? "Rejected by"
                    : "Approved by"
                }
                name={decidedBy.name}
                timestamp={
                  transaction.rejected_at || transaction.approved_at
                    ? moment(
                        transaction.rejected_at || transaction.approved_at,
                      ).format("MMM D, YYYY")
                    : undefined
                }
              />
            )}
          </div>
        </Section>

        {/* Why it was turned down. Without this a rejected expense shows a
            red pill and no explanation, and whoever logged it has to go and
            ask what was wrong with it. */}
        {transaction.rejection_reason && (
          <Section title="Reason for rejection">
            <p className="rounded-lg border border-error-1/30 bg-error-2 p-3 text-sm leading-relaxed text-error-1">
              {transaction.rejection_reason}
            </p>
          </Section>
        )}

        {/* Note */}
        {transaction.note && (
          <Section title="Note">
            <p className="text-sm text-grey-2 leading-relaxed">
              {transaction.note}
            </p>
          </Section>
        )}
      </div>

      {/* Approving signs the company's books, so it takes the same PIN a
          payout does. */}
      <TransactionPinDialog
        open={approving}
        onClose={() => setApproving(false)}
        onSubmit={(pin) => approve({ id: transaction.id, pin })}
        title="Approve this expense"
        description={`${formatToNaira(transaction.amount)} — ${
          transaction.reference || transaction.name || "expense"
        }. This records it in the books; no money moves.`}
        actionLabel="Approve"
        loading={approvePending}
      />

      <RejectTransferDialog
        open={rejecting}
        onClose={() => setRejecting(false)}
        onConfirm={(rejection_reason) =>
          reject({ id: transaction.id, rejection_reason })
        }
        loading={rejectPending}
        reference={transaction.reference || transaction.name}
      />
    </CustomModal>
  );
};

// ─── small building blocks ───────────────────────────────────────────────────

const Section = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => (
  <div>
    <p className="text-[11px] font-bold uppercase tracking-wider text-grey-3 mb-2">
      {title}
    </p>
    {children}
  </div>
);

const PersonRow = ({
  label,
  name,
  timestamp,
}: {
  label: string;
  name: string;
  timestamp?: string;
}) => (
  <div className="rounded-lg border border-grey-5 p-3 bg-white">
    <p className="text-[10px] font-bold uppercase tracking-wider text-grey-3">
      {label}
    </p>
    <div className="flex items-center gap-2.5 mt-1.5">
      <div className="w-8 h-8 rounded-full bg-grey-6 text-grey-3 flex items-center justify-center shrink-0">
        <User className="w-3.5 h-3.5" />
      </div>
      <p className="text-sm font-bold text-grey-1 truncate">{name}</p>
    </div>
    {timestamp && <p className="text-[11px] text-grey-3 mt-2">{timestamp}</p>}
  </div>
);

export default TransactionDetailsModal;

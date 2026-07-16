"use client";

import { CustomModal } from "@/components/app/CustomModal";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { formatToNaira } from "@/utils/formatMoney";
import { ClipboardList, User } from "lucide-react";
import moment from "moment";
import { getCategoryMeta, getRefLabel, getStatusMeta } from "./expense-ui-meta";

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
  if (!transaction) return null;

  const categoryLabel = getRefLabel(transaction.category, "Uncategorised");
  const catMeta = getCategoryMeta(categoryLabel);
  const CatIcon = catMeta.icon;
  const addedBy = getRefLabel(
    transaction.added_by ?? transaction.initiated_by,
    "—",
  );
  const hasApprovedByField = "approved_by" in transaction;
  const approvedBy = getRefLabel(transaction.approved_by, "—");
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
        <div className="flex justify-end">
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
              <PersonRow label="Approved by" name={approvedBy} />
            )}
          </div>
        </Section>

        {/* Note */}
        {transaction.note && (
          <Section title="Note">
            <p className="text-sm text-grey-2 leading-relaxed">
              {transaction.note}
            </p>
          </Section>
        )}
      </div>
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

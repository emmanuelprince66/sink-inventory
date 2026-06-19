"use client";

import { CustomModal } from "@/components/app/CustomModal";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { formatToNaira } from "@/utils/formatMoney";
import {
  ArrowDownToLine,
  CheckCircle2,
  ClipboardList,
  FileText,
  Image as ImageIcon,
  User,
  Wallet,
  XCircle,
} from "lucide-react";
import moment from "moment";
import {
  EXPENSE_ACCOUNT,
  ExpenseTransaction,
  STATUS_META,
  getCategoryMeta,
  getUserById,
} from "./mock-data";

interface TransactionDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: ExpenseTransaction | null;
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
}

const TransactionDetailsModal = ({
  isOpen,
  onClose,
  transaction,
  onApprove,
  onReject,
}: TransactionDetailsModalProps) => {
  if (!transaction) return null;

  const status = STATUS_META[transaction.status];
  const catMeta = getCategoryMeta(transaction.category);
  const CatIcon = catMeta.icon;
  const initiator = getUserById(transaction.initiatedById);
  const approver = transaction.approvedById
    ? getUserById(transaction.approvedById)
    : null;

  const canActOnPending = transaction.status === "PENDING";

  return (
    <CustomModal
      isOpen={isOpen}
      onClose={onClose}
      title={transaction.reference}
      description={transaction.narration}
      size="lg"
      headerIcon={
        <div className="w-9 h-9 rounded-lg bg-slate-900 flex items-center justify-center text-white">
          <ClipboardList className="w-4 h-4" />
        </div>
      }
      footer={
        canActOnPending && (onApprove || onReject) ? (
          <div className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-3 sm:justify-end">
            {onReject && (
              <Button
                variant="outline"
                className="border-rose-200 text-rose-600 hover:bg-rose-50"
                onClick={() => onReject(transaction.id)}
              >
                <XCircle className="w-4 h-4 mr-1.5" />
                Reject
              </Button>
            )}
            {onApprove && (
              <Button
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
                onClick={() => onApprove(transaction.id)}
              >
                <CheckCircle2 className="w-4 h-4 mr-1.5" />
                Approve
              </Button>
            )}
          </div>
        ) : (
          <div className="flex justify-end">
            <Button
              variant="outline"
              className="border-slate-200"
              onClick={onClose}
            >
              Close
            </Button>
          </div>
        )
      }
    >
      <div className="space-y-5">
        {/* Hero — category badge + amount + status */}
        <div className="rounded-xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-4 sm:p-5">
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
                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                  Category
                </p>
                <p className="text-sm font-bold text-slate-900 mt-0.5">
                  {transaction.category}
                </p>
                <p className="text-2xl sm:text-3xl font-bold text-slate-900 mt-2">
                  {formatToNaira(transaction.amount)}
                </p>
              </div>
            </div>
            <span
              className={cn(
                "inline-flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1 rounded-full shrink-0",
                status.pill,
              )}
            >
              <span className={cn("w-1.5 h-1.5 rounded-full", status.dot)} />
              {status.label}
            </span>
          </div>
        </div>

        {/* Source account caption — single account, so just a one-line strip */}
        <div className="flex items-center gap-2.5 p-3 rounded-lg bg-emerald-50/60 border border-emerald-100">
          <Wallet className="w-4 h-4 text-emerald-600 shrink-0" />
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-emerald-700">
              From account
            </p>
            <p className="text-sm font-semibold text-slate-900 truncate">
              {EXPENSE_ACCOUNT.name}
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              <span className="font-semibold text-slate-700">
                {EXPENSE_ACCOUNT.bankName}
              </span>
              <span className="mx-1">·</span>
              <span className="font-mono">
                {EXPENSE_ACCOUNT.accountNumber}
              </span>
            </p>
          </div>
        </div>

        {/* Accountability */}
        <Section title="Accountability">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <PersonRow
              label="Initiated by"
              name={initiator?.name || "—"}
              role={initiator?.role}
              initials={initiator?.initials}
              timestamp={moment(transaction.createdAt).format(
                "MMM D, YYYY · h:mm A",
              )}
            />
            <PersonRow
              label="Approved by"
              name={
                approver?.name || (canActOnPending ? "Awaiting approval" : "—")
              }
              role={approver?.role}
              initials={approver?.initials}
              timestamp={
                transaction.approvedAt
                  ? moment(transaction.approvedAt).format(
                      "MMM D, YYYY · h:mm A",
                    )
                  : undefined
              }
              tone={canActOnPending ? "pending" : "default"}
            />
          </div>
        </Section>

        {/* Narration */}
        <Section title="Narration">
          <p className="text-sm text-slate-700 leading-relaxed">
            {transaction.narration || "—"}
          </p>
        </Section>

        {/* Supporting docs */}
        <Section title="Supporting Documents">
          {transaction.attachments.length === 0 ? (
            <p className="text-xs text-slate-500 italic">
              No documents attached.
            </p>
          ) : (
            <ul className="space-y-2">
              {transaction.attachments.map((att) => (
                <li
                  key={att.id}
                  className="flex items-center gap-3 p-2.5 rounded-lg border border-slate-200 bg-white"
                >
                  <div
                    className={cn(
                      "w-9 h-9 rounded-md flex items-center justify-center shrink-0",
                      att.type === "receipt" && "bg-emerald-50 text-emerald-600",
                      att.type === "invoice" && "bg-sky-50 text-sky-600",
                      att.type === "other" && "bg-slate-100 text-slate-600",
                    )}
                  >
                    {att.type === "receipt" ? (
                      <ImageIcon className="w-4 h-4" />
                    ) : (
                      <FileText className="w-4 h-4" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">
                      {att.name}
                    </p>
                    <p className="text-[11px] text-slate-500 capitalize">
                      {att.type} · {att.size}
                    </p>
                  </div>
                  <button className="p-1.5 rounded-md hover:bg-slate-100 text-slate-500">
                    <ArrowDownToLine className="w-4 h-4" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </Section>
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
    <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-2">
      {title}
    </p>
    {children}
  </div>
);

const PersonRow = ({
  label,
  name,
  role,
  initials,
  timestamp,
  tone = "default",
}: {
  label: string;
  name: string;
  role?: string;
  initials?: string;
  timestamp?: string;
  tone?: "default" | "pending";
}) => (
  <div className="rounded-lg border border-slate-200 p-3 bg-white">
    <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
      {label}
    </p>
    <div className="flex items-center gap-2.5 mt-1.5">
      {initials ? (
        <div className="w-8 h-8 rounded-full bg-slate-900 text-white text-xs font-bold flex items-center justify-center shrink-0">
          {initials}
        </div>
      ) : (
        <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center shrink-0">
          <User className="w-3.5 h-3.5" />
        </div>
      )}
      <div className="min-w-0">
        <p
          className={cn(
            "text-sm font-semibold truncate",
            tone === "pending" ? "text-amber-700" : "text-slate-900",
          )}
        >
          {name}
        </p>
        {role && <p className="text-[11px] text-slate-500">{role}</p>}
      </div>
    </div>
    {timestamp && (
      <p className="text-[11px] text-slate-500 mt-2">{timestamp}</p>
    )}
  </div>
);

export default TransactionDetailsModal;

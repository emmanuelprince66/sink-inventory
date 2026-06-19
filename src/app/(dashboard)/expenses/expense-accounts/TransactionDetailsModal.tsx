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
  Tag,
  User,
  XCircle,
} from "lucide-react";
import moment from "moment";
import {
  ExpenseTransaction,
  STATUS_META,
  getAccountById,
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
  const initiator = getUserById(transaction.initiatedById);
  const approver = transaction.approvedById
    ? getUserById(transaction.approvedById)
    : null;
  const source = getAccountById(transaction.sourceAccountId);
  const destination = transaction.destinationAccountId
    ? getAccountById(transaction.destinationAccountId)
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
        {/* Hero — amount + status */}
        <div className="rounded-xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-4 sm:p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                Amount
              </p>
              <p className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">
                {formatToNaira(transaction.amount)}
              </p>
              <div className="flex items-center gap-1.5 mt-2 text-xs text-slate-600">
                <Tag className="w-3 h-3" />
                {transaction.category}
              </div>
            </div>
            <span
              className={cn(
                "inline-flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1 rounded-full",
                status.pill,
              )}
            >
              <span className={cn("w-1.5 h-1.5 rounded-full", status.dot)} />
              {status.label}
            </span>
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
              name={approver?.name || (canActOnPending ? "Awaiting approval" : "—")}
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

        {/* Account info */}
        <Section title="Account Information">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <AccountRow label="Source" account={source} />
            <AccountRow
              label="Destination"
              account={destination}
              fallback="External (outgoing expense)"
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

const AccountRow = ({
  label,
  account,
  fallback,
}: {
  label: string;
  account?: { name: string; accountNumber: string; balance: number };
  fallback?: string;
}) => (
  <div className="rounded-lg border border-slate-200 p-3 bg-white">
    <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
      {label}
    </p>
    {account ? (
      <>
        <p className="text-sm font-semibold text-slate-900 mt-1.5">
          {account.name}
        </p>
        <p className="text-[11px] text-slate-500 mt-0.5">
          {account.accountNumber}
        </p>
        <p className="text-[11px] text-slate-700 font-medium mt-1.5">
          Balance: {formatToNaira(account.balance)}
        </p>
      </>
    ) : (
      <p className="text-sm text-slate-600 mt-1.5">{fallback || "—"}</p>
    )}
  </div>
);

export default TransactionDetailsModal;

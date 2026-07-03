import {
  ArrowDownLeft,
  ArrowUpRight,
  CheckCircle2,
  Clock,
  XCircle,
} from "lucide-react";
import moment from "moment";

interface Transaction {
  id: string;
  account_name: string;
  type: "CREDIT" | "DEBIT";
  amount: string;
  created_at: string;
  status: "SUCCESS" | "PENDING" | "FAILED";
  description?: string;
  account_number?: string;
  charges?: string;
}

const STATUS_STYLES = {
  SUCCESS: {
    icon: CheckCircle2,
    className: "bg-success-2 text-success-1",
  },
  PENDING: {
    icon: Clock,
    className: "bg-warning-2 text-warning-1",
  },
  FAILED: {
    icon: XCircle,
    className: "bg-error-2 text-error-1",
  },
};

export default function TransactionDetails({
  transaction,
}: {
  transaction: Transaction;
}) {
  const isCredit = transaction.type === "CREDIT";
  const AmountIcon = isCredit ? ArrowDownLeft : ArrowUpRight;
  const amountTint = isCredit
    ? { bg: "bg-success-2", text: "text-success-1" }
    : { bg: "bg-error-2", text: "text-error-1" };

  const status = STATUS_STYLES[transaction.status];
  const StatusIcon = status.icon;

  const rows: { label: string; value: React.ReactNode }[] = [
    { label: "Transaction ID", value: transaction.id },
    {
      label: "Date & Time",
      value: moment(transaction.created_at).format("MMM D, YYYY h:mm A"),
    },
    { label: "Account Name", value: transaction.account_name },
    { label: "Account Number", value: transaction.account_number },
    { label: "Transaction Type", value: transaction.type },
  ];

  if (transaction.charges) {
    rows.push({
      label: "Charges",
      value: `₦${parseFloat(transaction.charges).toLocaleString()}`,
    });
  }

  return (
    <div className="w-full flex flex-col gap-5">
      {/* Hero */}
      <div
        className={`rounded-2xl p-4 sm:p-5 flex items-center justify-between gap-3 ${amountTint.bg}`}
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="p-2.5 rounded-full bg-white/60 shrink-0">
            <AmountIcon className={`h-5 w-5 ${amountTint.text}`} />
          </div>
          <div className="min-w-0">
            <p className={`text-xs font-bold uppercase tracking-wide ${amountTint.text}`}>
              {isCredit ? "Credit" : "Debit"}
            </p>
            <p className={`text-xl sm:text-2xl font-extrabold ${amountTint.text} truncate`}>
              {isCredit ? "+" : "-"}₦{parseFloat(transaction.amount).toLocaleString()}
            </p>
          </div>
        </div>

        <span
          className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold shrink-0 ${status.className}`}
        >
          <StatusIcon className="h-3.5 w-3.5" />
          {transaction.status}
        </span>
      </div>

      {/* Detail rows */}
      <div className="rounded-2xl border border-grey-5 divide-y divide-grey-6 overflow-hidden">
        {rows.map((row) => (
          <div
            key={row.label}
            className="flex items-center justify-between gap-4 px-4 sm:px-5 py-3"
          >
            <span className="text-sm font-medium text-grey-3 shrink-0">
              {row.label}
            </span>
            <span className="text-sm font-bold text-grey-1 text-right truncate">
              {row.value || "-"}
            </span>
          </div>
        ))}
      </div>

      {/* Description */}
      {transaction.description && (
        <div className="rounded-2xl border border-grey-5 p-4 sm:p-5">
          <p className="text-sm font-medium text-grey-3 mb-1">Description</p>
          <p className="text-sm text-grey-1">{transaction.description}</p>
        </div>
      )}
    </div>
  );
}

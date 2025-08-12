import { Separator } from "@/components/ui/separator";
import { ArrowDown, ArrowUp, CheckCircle2, Clock, XCircle } from "lucide-react";
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

export default function TransactionDetails({
  transaction,
}: {
  transaction: Transaction;
}) {
  const getStatusBadge = () => {
    const statusConfig = {
      SUCCESS: {
        icon: <CheckCircle2 className="w-4 h-4 mr-1" />,
        className: "bg-green-100 text-green-800",
      },
      PENDING: {
        icon: <Clock className="w-4 h-4 mr-1" />,
        className: "bg-yellow-100 text-yellow-800",
      },
      FAILED: {
        icon: <XCircle className="w-4 h-4 mr-1" />,
        className: "bg-red-100 text-red-800",
      },
    };

    const config = statusConfig[transaction.status];
    return (
      <span
        className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${config.className}`}
      >
        {config.icon}
        {transaction.status}
      </span>
    );
  };

  const getAmountDisplay = () => {
    const isCredit = transaction.type === "CREDIT";
    const Icon = isCredit ? ArrowDown : ArrowUp;
    const colorClass = isCredit ? "text-green-600" : "text-red-600";

    return (
      <div className="flex items-center gap-2">
        <Icon className={`w-5 h-5 ${colorClass}`} />
        <h3 className={`text-2xl font-semibold ${colorClass}`}>
          {isCredit ? "+" : "-"}₦
          {parseFloat(transaction.amount).toLocaleString()}
        </h3>
      </div>
    );
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-sm">
      <div className="space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-lg font-medium text-gray-500">Transaction</h2>
            <div className="mt-1">{getAmountDisplay()}</div>
          </div>
          <div>{getStatusBadge()}</div>
        </div>

        <Separator className="my-2" />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <DetailItem label="Transaction ID" value={transaction.id} />
          <DetailItem
            label="Date & Time"
            value={moment(transaction.created_at).format("MMM D, YYYY h:mm A")}
          />
          <DetailItem label="Account Name" value={transaction.account_name} />
          <DetailItem
            label="Account Number"
            value={transaction.account_number}
          />
          <DetailItem label="Transaction Type" value={transaction.type} />
          {transaction.charges && (
            <DetailItem
              label="Charges"
              value={`₦${parseFloat(transaction.charges).toLocaleString()}`}
            />
          )}
        </div>

        {transaction.description && (
          <>
            <Separator className="my-2" />
            <DetailItem
              label="Description"
              value={transaction.description}
              className="mt-4"
            />
          </>
        )}
      </div>
    </div>
  );
}

function DetailItem({
  label,
  value,
  className = "",
}: {
  label: string;
  value: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <p className="text-sm font-medium text-gray-500 mb-1">{label}</p>
      <div className="text-base font-normal text-gray-900">{value || "-"}</div>
    </div>
  );
}

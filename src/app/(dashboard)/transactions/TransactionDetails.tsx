import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ArrowDown, ArrowUp, CheckCircle2, Clock, XCircle } from "lucide-react";
import { useRouter } from "next/navigation";

interface Transaction {
  id: string;
  customerName: string;
  type: "credit" | "debit";
  amount: number;
  date: string;
  status: "completed" | "pending" | "failed";
  description?: string;
  accountNumber?: string;
  reference?: string;
}

export default function TransactionDetails() {
  const router = useRouter();

  const transaction: Transaction = {
    id: "TRX-001",
    customerName: "John Doe",
    type: "credit",
    amount: 50000,
    date: "2023-10-15",
    status: "completed",
    description: "Payment for invoice #INV-2023-1015",
    accountNumber: "**** 3456",
  };

  const getStatusBadge = () => {
    const statusConfig = {
      completed: {
        icon: <CheckCircle2 className="w-3 h-3 mr-1" />,
        variant: "success" as const,
      },
      pending: {
        icon: <Clock className="w-3 h-3 mr-1" />,
        variant: "warning" as const,
      },
      failed: {
        icon: <XCircle className="w-3 h-3 mr-1" />,
        variant: "destructive" as const,
      },
    };

    const config = statusConfig[transaction.status];
    return (
      <Button className="gap-1">
        {config.icon}
        {transaction.status.charAt(0).toUpperCase() +
          transaction.status.slice(1)}
      </Button>
    );
  };

  const getAmountDisplay = () => {
    const isCredit = transaction.type === "credit";
    const Icon = isCredit ? ArrowDown : ArrowUp;
    const colorClass = isCredit ? "text-green-500" : "text-red-500";

    return (
      <div className="flex items-center gap-2">
        <Icon className={`w-5 h-5 ${colorClass}`} />
        <h3 className={`text-2xl font-semibold ${colorClass}`}>
          {isCredit ? "+" : "-"}${transaction.amount.toLocaleString()}
        </h3>
      </div>
    );
  };

  return (
    <div className="w-full mx-auto p-1">
      <div>
        <div>
          <Separator className="my-2" />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <DetailItem label="Transaction ID" value={transaction.id} />
            <DetailItem
              label="Date"
              value={new Date(transaction.date).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            />
            <DetailItem
              label="Customer Name"
              value={transaction.customerName}
            />
            <DetailItem
              label="Type"
              value={
                <>
                  {transaction.type.charAt(0).toUpperCase() +
                    transaction.type.slice(1)}
                </>
              }
            />
            <DetailItem
              label="Account Number"
              value={transaction.accountNumber}
            />
          </div>

          <DetailItem
            label="Description"
            value={transaction.description}
            className="mb-6"
          />
        </div>
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
      <p className="text-sm text-muted-foreground">{label}</p>
      <div className="mt-1 font-medium">{value}</div>
    </div>
  );
}

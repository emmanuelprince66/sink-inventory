import { ColumnDef } from "@tanstack/react-table";
import { Trash2 } from "lucide-react";

export interface BankRow {
  id: string;
  bank_name: string;
  account_name: string;
  account_number: string;
  min_fee?: number;
  max_fee?: number;
  percentage?: number;
}

interface GetColumnsProps {
  canDelete: boolean;
  onDelete: (bank: BankRow) => void;
}

export const getBankColumns = ({
  canDelete,
  onDelete,
}: GetColumnsProps): ColumnDef<BankRow>[] => {
  const columns: ColumnDef<BankRow>[] = [
    {
      accessorKey: "bank_name",
      header: "Bank Name",
      cell: ({ row }) => (
        <p className="text-sm font-bold text-grey-2">
          {row.original.bank_name}
        </p>
      ),
    },
    {
      accessorKey: "account_name",
      header: "Account Name",
      cell: ({ row }) => (
        <p className="text-sm text-grey-2">{row.original.account_name}</p>
      ),
    },
    {
      accessorKey: "account_number",
      header: "Account Number",
      cell: ({ row }) => (
        <p className="text-sm text-grey-2">{row.original.account_number}</p>
      ),
    },
    {
      accessorKey: "fees",
      header: "Fees",
      cell: ({ row }) => {
        const bank = row.original;
        return (
          <p className="text-sm text-grey-3">
            {bank.min_fee || bank.percentage
              ? `${bank.min_fee ? `Min: ${bank.min_fee}` : ""} ${
                  bank.percentage ? `Percentage: ${bank.percentage}%` : ""
                }`
              : "N/A"}
          </p>
        );
      },
    },
  ];

  if (canDelete) {
    columns.push({
      accessorKey: "",
      header: "Action",
      cell: ({ row }) => (
        <button
          onClick={() => onDelete(row.original)}
          title="Delete Bank"
          className="rounded-lg p-1.5 cursor-pointer text-error-1 hover:bg-error-2 transition-colors"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      ),
    });
  }

  return columns;
};

import { ProductHistoryItem } from "@/api/products/fetch-product-history";
import { cn } from "@/lib/utils";
import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { ArrowUpDown } from "lucide-react";

const formatCurrency = (value: string) =>
  "₦" +
  parseFloat(value).toLocaleString("en-NG", { minimumFractionDigits: 2 });

export const createProductHistoryColumns =
  (): ColumnDef<ProductHistoryItem>[] => [
    {
      accessorKey: "product",
      header: ({ column }) => (
        <button
          className="flex items-center gap-1 hover:text-grey-1 transition-colors font-semibold"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Product
          <ArrowUpDown className="h-4 w-4" />
        </button>
      ),
      cell: ({ row }) => {
        const item = row.original;
        return (
          <div>
            <div className="font-medium text-grey-1">
              {item.product?.name}
            </div>
            <div className="text-xs text-grey-4">{item.product?.unit}</div>
          </div>
        );
      },
    },
    {
      accessorKey: "category",
      header: "Category",
      cell: ({ row }) => {
        const item = row.original;
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-green-300/10 text-primary-green-300 border border-primary-green-300/20">
            {item.category}
          </span>
        );
      },
    },
    {
      accessorKey: "quantity",
      header: ({ column }) => (
        <button
          className="flex items-center gap-1 hover:text-grey-1 transition-colors font-semibold"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Quantity
          <ArrowUpDown className="h-4 w-4" />
        </button>
      ),
      cell: ({ row }) => {
        const item = row.original;
        const qty = parseFloat(item.quantity);
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-info-2 text-info-1">
            {qty} {item.product?.unit}
          </span>
        );
      },
    },
    {
      accessorKey: "quantity_after",
      header: "Qty After",
      cell: ({ row }) => {
        const item = row.original;
        return (
          <span className="text-sm text-grey-3">
            {parseFloat(item.quantity_after)}
          </span>
        );
      },
    },
    {
      accessorKey: "value",
      header: ({ column }) => (
        <button
          className="flex items-center gap-1 hover:text-grey-1 transition-colors font-semibold"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Value
          <ArrowUpDown className="h-4 w-4" />
        </button>
      ),
      cell: ({ row }) => {
        const item = row.original;
        return (
          <span className="font-semibold text-primary-green-300">
            {formatCurrency(item.value)}
          </span>
        );
      },
    },
    {
      accessorKey: "recorded_by",
      header: "Recorded By",
      cell: ({ row }) => {
        const item = row.original;
        return (
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-primary-green-300/10 flex items-center justify-center text-primary-green-300 font-semibold text-xs">
              {item.recorded_by?.charAt(0)?.toUpperCase() || "?"}
            </div>
            <span className="text-sm text-grey-2">{item.recorded_by}</span>
          </div>
        );
      },
    },
    {
      accessorKey: "note",
      header: "Note",
      cell: ({ row }) => {
        const item = row.original;
        return (
          <div
            className="text-sm text-grey-3 max-w-[150px] truncate"
            title={item.note || ""}
          >
            {item.note || "-"}
          </div>
        );
      },
    },
    {
      accessorKey: "created_at",
      header: ({ column }) => (
        <button
          className="flex items-center gap-1 hover:text-grey-1 transition-colors font-semibold"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Date
          <ArrowUpDown className="h-4 w-4" />
        </button>
      ),
      cell: ({ row }) => {
        const item = row.original;
        const date = new Date(item.created_at);
        return (
          <div className="text-sm text-grey-3">
            <div className="font-medium">{format(date, "MMM dd, yyyy")}</div>
            <div className="text-xs text-grey-4">{format(date, "HH:mm")}</div>
          </div>
        );
      },
    },
  ];

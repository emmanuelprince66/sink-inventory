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
          className="flex items-center gap-1 hover:text-gray-900 transition-colors font-semibold"
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
            <div className="font-medium text-gray-900">
              {item.product?.name}
            </div>
            <div className="text-xs text-gray-400">{item.product?.unit}</div>
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
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200">
            {item.category}
          </span>
        );
      },
    },
    {
      accessorKey: "quantity",
      header: ({ column }) => (
        <button
          className="flex items-center gap-1 hover:text-gray-900 transition-colors font-semibold"
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
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
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
          <span className="text-sm text-gray-600">
            {parseFloat(item.quantity_after)}
          </span>
        );
      },
    },
    {
      accessorKey: "value",
      header: ({ column }) => (
        <button
          className="flex items-center gap-1 hover:text-gray-900 transition-colors font-semibold"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Value
          <ArrowUpDown className="h-4 w-4" />
        </button>
      ),
      cell: ({ row }) => {
        const item = row.original;
        return (
          <span className="font-semibold text-green-700">
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
            <div className="w-7 h-7 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-semibold text-xs">
              {item.recorded_by?.charAt(0)?.toUpperCase() || "?"}
            </div>
            <span className="text-sm text-gray-700">{item.recorded_by}</span>
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
            className="text-sm text-gray-600 max-w-[150px] truncate"
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
          className="flex items-center gap-1 hover:text-gray-900 transition-colors font-semibold"
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
          <div className="text-sm text-gray-600">
            <div className="font-medium">{format(date, "MMM dd, yyyy")}</div>
            <div className="text-xs text-gray-400">{format(date, "HH:mm")}</div>
          </div>
        );
      },
    },
  ];

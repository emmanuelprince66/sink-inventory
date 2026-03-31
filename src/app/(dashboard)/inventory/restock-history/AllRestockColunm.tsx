import { RestockHistoryItem } from "@/api/restock/fetch-all-restock-history";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { ArrowUpDown, MoreHorizontal } from "lucide-react";

export const allRestockHistoryColumns: ColumnDef<RestockHistoryItem>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => {
      return (
        <button
          className="flex items-center gap-1 hover:text-gray-900 transition-colors font-semibold"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Product Name
          <ArrowUpDown className="h-4 w-4" />
        </button>
      );
    },
    cell: ({ row }) => {
      const item = row.original;
      return <div className="font-medium text-gray-900">{item.name}</div>;
    },
  },
  {
    accessorKey: "sku",
    header: "SKU",
    cell: ({ row }) => {
      const item = row.original;
      return (
        <div className="text-sm text-gray-600 font-mono">{item.sku || "-"}</div>
      );
    },
  },
  {
    accessorKey: "quantity",
    header: ({ column }) => {
      return (
        <button
          className="flex items-center gap-1 hover:text-gray-900 transition-colors font-semibold"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Quantity
          <ArrowUpDown className="h-4 w-4" />
        </button>
      );
    },
    cell: ({ row }) => {
      const item = row.original;
      const quantity = parseFloat(item.quantity);
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          {quantity} units
        </span>
      );
    },
  },
  {
    accessorKey: "date",
    header: ({ column }) => {
      return (
        <button
          className="flex items-center gap-1 hover:text-gray-900 transition-colors font-semibold"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Date
          <ArrowUpDown className="h-4 w-4" />
        </button>
      );
    },
    cell: ({ row }) => {
      const item = row.original;
      const date = new Date(item.date);
      return (
        <div className="text-sm text-gray-600">
          <div className="font-medium">{format(date, "MMM dd, yyyy")}</div>
          <div className="text-xs text-gray-400">{format(date, "HH:mm")}</div>
        </div>
      );
    },
  },
  {
    accessorKey: "user",
    header: "User",
    cell: ({ row }) => {
      const item = row.original;
      return (
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-semibold text-sm">
            {item.user.name.charAt(0).toUpperCase()}
          </div>
          <span className="text-sm text-gray-700">{item.user.name}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "remark",
    header: "Remark",
    cell: ({ row }) => {
      const item = row.original;
      return (
        <div
          className="text-sm text-gray-600 max-w-xs truncate"
          title={item.remark || ""}
        >
          {item.remark || "-"}
        </div>
      );
    },
  },
  {
    id: "actions",
    header: "Action",
    cell: ({ row }) => {
      const item = row.original;
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={() => {
                // Handle view details
                console.log("View details", item);
              }}
              className="cursor-pointer"
            >
              View Details
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

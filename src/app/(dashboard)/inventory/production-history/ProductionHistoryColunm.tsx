// app/production-history/ProductionHistoryColumns.tsx
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { ArrowUpDown, MoreHorizontal } from "lucide-react";
import { ProductionHistoryItem } from "./production-history";

interface ProductionHistoryColumnsProps {
  canManageProduction: boolean;
  onReceive?: (move_id: string) => void;
  isAccepting?: boolean;
}

export const createProductionHistoryColumns = ({
  canManageProduction,
  onReceive,
  isAccepting,
}: ProductionHistoryColumnsProps): ColumnDef<ProductionHistoryItem>[] => [
  {
    accessorKey: "product",
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
      return <div className="font-medium text-gray-900">{item.product}</div>;
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
          Units Moved
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
    accessorKey: "created_at",
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
      const date = new Date(item.created_at);
      return (
        <div className="text-sm text-gray-600">
          <div className="font-medium">{format(date, "MMM dd, yyyy")}</div>
          <div className="text-xs text-gray-400">{format(date, "HH:mm")}</div>
        </div>
      );
    },
  },
  {
    accessorKey: "moved_by",
    header: "Moved By",
    cell: ({ row }) => {
      const item = row.original;
      return (
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-semibold text-sm">
            {item.id?.charAt(0)?.toUpperCase() || "?"}
          </div>
          <span className="text-sm text-gray-700">{item.moved_by || "-"}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "received_by",
    header: "Received By",
    cell: ({ row }) => {
      const item = row.original;
      return item.received_by ? (
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 font-semibold text-sm">
            {item.received_by.charAt(0).toUpperCase()}
          </div>
          <span className="text-sm text-gray-700">{item.received_by}</span>
        </div>
      ) : (
        <span className="text-gray-400 text-sm">-</span>
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
          className="text-sm text-gray-600 max-w-xs truncate"
          title={item.note || ""}
        >
          {item.note || "-"}
        </div>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const item = row.original;

      if (canManageProduction && item.status === "MOVED" && onReceive) {
        return (
          <Button
            size="sm"
            onClick={() => onReceive(item.id)}
            disabled={isAccepting}
            className="bg-green-600 hover:bg-green-700 text-white disabled:opacity-50"
          >
            {isAccepting ? "Receiving..." : "Receive"}
          </Button>
        );
      }

      return (
        <span
          className={cn(
            "inline-flex items-center px-3 py-1 rounded-full text-xs font-medium",
            item.status === "RECEIVED"
              ? "bg-green-100 text-green-800"
              : "bg-amber-100 text-amber-800",
          )}
        >
          {item.status === "RECEIVED" ? "Received" : "Moved"}
        </span>
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

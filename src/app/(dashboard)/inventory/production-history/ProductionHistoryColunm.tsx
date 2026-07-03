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
          className="flex items-center gap-1 hover:text-grey-1 transition-colors font-semibold"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Product Name
          <ArrowUpDown className="h-4 w-4" />
        </button>
      );
    },
    cell: ({ row }) => {
      const item = row.original;
      return <div className="font-medium text-grey-1">{item.product}</div>;
    },
  },
  {
    accessorKey: "quantity",
    header: ({ column }) => {
      return (
        <button
          className="flex items-center gap-1 hover:text-grey-1 transition-colors font-semibold"
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
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-info-2 text-info-1">
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
          className="flex items-center gap-1 hover:text-grey-1 transition-colors font-semibold"
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
        <div className="text-sm text-grey-3">
          <div className="font-medium">{format(date, "MMM dd, yyyy")}</div>
          <div className="text-xs text-grey-4">{format(date, "HH:mm")}</div>
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
          <div className="w-8 h-8 rounded-full bg-primary-green-300/10 flex items-center justify-center text-primary-green-300 font-semibold text-sm">
            {item.id?.charAt(0)?.toUpperCase() || "?"}
          </div>
          <span className="text-sm text-grey-2">{item.moved_by || "-"}</span>
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
          <div className="w-8 h-8 rounded-full bg-secondary-1/10 flex items-center justify-center text-secondary-1 font-semibold text-sm">
            {item.received_by.charAt(0).toUpperCase()}
          </div>
          <span className="text-sm text-grey-2">{item.received_by}</span>
        </div>
      ) : (
        <span className="text-grey-4 text-sm">-</span>
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
          className="text-sm text-grey-3 max-w-xs truncate"
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
              ? "bg-success-2 text-success-1"
              : "bg-warning-2 text-warning-1",
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

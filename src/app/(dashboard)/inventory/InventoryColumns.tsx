import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal } from "lucide-react";
import Image from "next/image";
import { InventoryItem } from "./type";

const statusColors = {
  "IN-STOCK": "bg-green-100 text-green-800",
  LOW: "bg-yellow-100 text-yellow-800",
  "OUT-OF-STOCK": "bg-red-100 text-red-800",
  DEFAULT: "bg-gray-100 text-gray-800",
};

export const columns: ColumnDef<InventoryItem>[] = [
  {
    accessorKey: "logo",
    header: "",
    cell: ({ row }) => {
      const inventory = row.original;
      return (
        <div className="relative h-10 w-10 rounded-md overflow-hidden">
          <Image
            src={inventory.image}
            alt={`${inventory.name} logo`}
            fill
            className="object-cover"
          />
        </div>
      );
    },
  },
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => {
      const inventory = row.original;
      return <div className="font-medium">{inventory.name}</div>;
    },
  },
  {
    accessorKey: "quantity",
    header: "Quantity",
    cell: ({ row }) => {
      const inventory = row.original;
      const isOutOfStock =
        inventory.quantity === 0 || inventory.quantity === null;

      return (
        <div
          className={cn("font-medium", {
            "text-red-500": isOutOfStock,
          })}
        >
          {isOutOfStock ? "0 (Out of stock)" : inventory.quantity}
        </div>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const inventory = row.original;
      const statusClass =
        statusColors[inventory.status as keyof typeof statusColors] ||
        statusColors.DEFAULT;

      return (
        <span
          className={cn(
            "px-2 py-1 rounded-full text-xs font-medium",
            statusClass
          )}
        >
          {inventory.status}
        </span>
      );
    },
  },
  {
    accessorKey: "selling_price",
    header: "Selling Price",
    cell: ({ row }) => {
      const inventory = row.original;
      return (
        <div className="font-medium">
          {inventory.selling_price?.toFixed(2) || "0.00"}
        </div>
      );
    },
  },
  {
    id: "actions",
    header: "Action",
    cell: ({ row }) => {
      const inventory = row.original;
      const canRestock = !(inventory.sold === 0 || inventory.sold === null);

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="h-8 w-8 p-0 hover:bg-gray-100 rounded-full flex items-center justify-center cursor-pointer">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="bg-white border border-gray-200 shadow-lg min-w-[180px]"
          >
            <DropdownMenuItem
              onClick={() => console.log("Edi_t", inventory.id)}
              className="cursor-pointer px-4 py-2 hover:bg-green-50 hover:text-green-600 transition-colors"
            >
              Edit selling price
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => console.log("View", inventory.id)}
              className="cursor-pointer px-4 py-2 hover:bg-green-50 hover:text-green-600 transition-colors"
            >
              View details
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => console.log("Restock", inventory.id)}
              className={cn(
                "cursor-pointer px-4 py-2 transition-colors",
                canRestock
                  ? "hover:bg-green-50 hover:text-green-600"
                  : "text-red-500 opacity-50 cursor-not-allowed"
              )}
              disabled={!canRestock}
            >
              {canRestock ? "Quick restock" : "Cannot restock"}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

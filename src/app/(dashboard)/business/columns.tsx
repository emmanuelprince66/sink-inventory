// components/business/columns.tsx
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ColumnDef } from "@tanstack/react-table";
import { isBranchLocked, subscribeHrefFor } from "@/utils/branchSubscription";
import { CreditCard, Lock, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { BusinessType } from "./types/types";

interface ColumnsOptions {
  onEdit: (businessId: string) => void;
  onDelete: (businessId: string) => void;
}

export const columns = ({
  onEdit,
  onDelete,
}: ColumnsOptions): ColumnDef<BusinessType>[] => [
  {
    id: "businessInfo",
    header: "Business",
    cell: ({ row }) => {
      const business = row.original;
      return (
        <div className="flex items-center gap-3">
          <div className="relative h-10 w-10 rounded-md overflow-hidden flex-shrink-0">
            <Image
              src={business.logo}
              alt={`${business.name} logo`}
              fill
              className="object-cover"
            />
          </div>
          <div>
            <div className="font-medium">{business.name}</div>
            <div className="text-sm text-gray-500">
              {business.city}, {business.country}
            </div>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "type",
    header: "Type",
  },
  {
    id: "subscription",
    header: "Plan",
    cell: ({ row }) => {
      const business = row.original;
      // Older payloads don't carry the fields — say nothing rather than guess.
      if (business.is_founding == null) return null;
      if (business.is_founding) {
        return (
          <span className="rounded-full bg-secondary-6 px-2.5 py-1 text-xs font-bold text-primary-green-300">
            Account plan
          </span>
        );
      }
      if (!isBranchLocked(business)) {
        return (
          <div className="flex flex-col">
            <span className="w-fit rounded-full bg-success-2 px-2.5 py-1 text-xs font-bold text-success-1">
              {business.subscription || "Subscribed"}
            </span>
            {business.subscription_end_date && (
              <span className="mt-1 text-[11px] text-grey-3">
                Renews {business.subscription_end_date}
              </span>
            )}
          </div>
        );
      }
      return (
        // The row click opens the branch; this shouldn't.
        <div onClick={(e) => e.stopPropagation()} className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 rounded-full bg-warning-2 px-2.5 py-1 text-xs font-bold text-warning-1">
            <Lock className="h-3 w-3" />
            Not subscribed
          </span>
          <Link
            href={subscribeHrefFor(business)}
            className="text-xs font-bold text-primary-green-300 hover:underline"
          >
            Subscribe
          </Link>
        </div>
      );
    },
  },
  {
    id: "actions",
    header: "Action",
    cell: ({ row }) => {
      const business = row.original;

      return (
        // ✅ Stop the click from reaching the row's onClick handler
        <div onClick={(e) => e.stopPropagation()}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="h-8 w-8 p-0 hover:bg-gray-100 rounded-full flex items-center justify-center cursor-pointer">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="bg-white border border-gray-200 shadow-md rounded-md"
            >
              {isBranchLocked(business) && (
                <DropdownMenuItem asChild>
                  <Link
                    href={subscribeHrefFor(business)}
                    className="cursor-pointer hover:bg-gray-50 flex items-center gap-2"
                  >
                    <CreditCard className="h-4 w-4 text-gray-500" />
                    <span>Subscribe this branch</span>
                  </Link>
                </DropdownMenuItem>
              )}
              <DropdownMenuItem
                onClick={() => onEdit(business.id)}
                className="cursor-pointer hover:bg-gray-50 flex items-center gap-2"
              >
                <Pencil className="h-4 w-4 text-gray-500" />
                <span>Edit</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onDelete(business.id)}
                className="cursor-pointer hover:bg-red-50 text-red-600 focus:text-red-600 flex items-center gap-2"
              >
                <Trash2 className="h-4 w-4" />
                <span>Delete</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );
    },
  },
];

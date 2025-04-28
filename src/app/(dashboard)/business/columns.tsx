import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";

import Image from "next/image";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { BusinessType } from "./types/types";
export const columns: ColumnDef<BusinessType>[] = [
  {
    accessorKey: "logo",
    header: "",
    cell: ({ row }) => {
      const business = row.original;
      return (
        <div className="relative h-10 w-10 rounded-md overflow-hidden">
          <Image
            src={business.logo}
            alt={`${business.name} logo`}
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
      const business = row.original;
      return (
        <div className="font-medium">
          {business.name}
          <p className="text-sm text-gray-500">
            {business.city}, {business.country}
          </p>
        </div>
      );
    },
  },
  {
    accessorKey: "type",
    header: "Type",
  },
  {
    id: "actions",
    header: "Action",
    cell: ({ row }) => {
      const business = row.original;

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
            className="bg-primary-green-500 border-gray-200"
          >
            <DropdownMenuItem
              onClick={() => console.log("Edit", business.id)}
              className="cursor-pointer hover:bg-white"
            >
              <Pencil className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => console.log("Delete", business.id)}
              className="cursor-pointer hover:bg-white text-red-600 focus:text-red-600"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

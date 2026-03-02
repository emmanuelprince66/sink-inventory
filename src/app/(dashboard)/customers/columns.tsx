import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ColumnDef } from "@tanstack/react-table";
import { useRouter } from "next/navigation";

import { CustomModal } from "@/components/app/CustomModal";
import { formatToNaira } from "@/utils/formatMoney";
import { ArrowUpDown, MoreHorizontal } from "lucide-react";
import { useState } from "react";
import DeleteCustomer from "./DeleteCustomer";
import { CustomerType } from "./types";

export const columns: ColumnDef<CustomerType>[] = [
  //   {
  //     accessorKey: "logo",
  //     header: "",
  //     cell: ({ row }) => {
  //       const customer = row.original;
  //       return (
  //         <div className="relative h-10 w-10 rounded-md overflow-hidden">
  //           <Image
  //             src={customer.profile_pic}
  //             alt={`${customer.name} logo`}
  //             fill
  //             className="object-cover"
  //           />
  //         </div>
  //       );
  //     },
  //   },
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => {
      const customer = row.original;
      return (
        <div className="font-medium">
          <p className="text-sm text-gray-500">{customer.name}</p>
        </div>
      );
    },
  },
  {
    accessorKey: "phone",
    header: "Phone Number",
    cell: ({ row }) => {
      const customer = row.original;
      return (
        <div className="font-medium">
          <p className="text-sm text-gray-500">{customer.phone}</p>
        </div>
      );
    },
  },
  {
    accessorKey: "amount_spent",
    header: "Total Amount Spent",
    cell: ({ row }) => {
      const customer = row.original;
      return (
        <div className="font-medium">
          <p className="text-sm text-gray-500">{customer?.total_sales}</p>
        </div>
      );
    },
  },
  {
    accessorKey: "sales_count",
    header: ({ column }) => {
      return (
        <button
          className="flex items-center gap-1 hover:text-gray-900 transition-colors"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Total Transactions
          <ArrowUpDown className="h-4 w-4" />
        </button>
      );
    },
    cell: ({ row }) => {
      const customer = row.original;
      return (
        <div className="font-medium">
          <p className="text-sm text-gray-500">{customer?.sales_count}</p>
        </div>
      );
    },
    sortingFn: "basic",
    enableSorting: true,
  },

  {
    accessorKey: "wallet",
    header: "Wallet Balance",
    cell: ({ row }) => {
      const customer = row.original;
      const isNegative = customer.wallet < 0;

      return (
        <div className="font-medium">
          <p
            className={`text-sm ${
              isNegative ? "text-red-500" : "text-gray-500"
            }`}
          >
            {formatToNaira(customer.wallet)}
          </p>
        </div>
      );
    },
  },
  {
    accessorKey: "",
    header: "Action",
    cell: ({ row }) => {
      const router = useRouter();
      const [deleteCustomerModal, setDeleteCustomerModal] = useState(false);
      return (
        <>
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
                onClick={() => router.push(`/customers/${row.original.id}`)}
                className="cursor-pointer px-4 py-2 hover:bg-green-50 hover:text-green-600 transition-colors"
              >
                View more
              </DropdownMenuItem>
              <DropdownMenuItem
                disabled={row.original.wallet < 0}
                onClick={() => setDeleteCustomerModal(true)}
                className="cursor-pointer px-4 py-2 hover:bg-red-50 hover:text-red-600 transition-colors"
              >
                <span className=" text-red-500">Delete Customer</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <CustomModal
            isOpen={deleteCustomerModal}
            onClose={() => setDeleteCustomerModal(false)}
            trigger={false}
            title="Delete Customer"
          >
            <DeleteCustomer
              closeModal={() => setDeleteCustomerModal(false)}
              customer={row.original}
            />
          </CustomModal>
        </>
      );
    },
  },
];

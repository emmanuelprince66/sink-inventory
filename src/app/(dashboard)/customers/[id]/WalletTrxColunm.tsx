import { ColumnDef } from "@tanstack/react-table";
import { ArrowRightIcon } from "lucide-react";

import { CustomerWalletTrxData } from "../types";

export const columns: ColumnDef<CustomerWalletTrxData>[] = [
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
    accessorKey: "amount",
    header: "Deposit",
    cell: ({ row }) => {
      const customer = row.original;
      return (
        <div className="font-medium">
          <p className="text-sm text-grey-3">{customer.amount}</p>
        </div>
      );
    },
  },
  {
    accessorKey: "created_at",
    header: "Date Created",
    cell: ({ row }) => {
      const customer = row.original;
      return (
        <div className="font-medium">
          <p className="text-sm text-grey-3">{customer.created_at}</p>
        </div>
      );
    },
  },

  {
    accessorKey: "",
    header: "",
    id: "cast-or",
    cell: ({ row }) => {
      return (
        <div className="font-medium">
          <ArrowRightIcon className="h-4 w-4 text-grey-4" />
        </div>
      );
    },
  },
];

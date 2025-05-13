import { ColumnDef } from "@tanstack/react-table";

import { formatToNaira } from "@/utils/formatMoney";
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
    cell: () => {
      return (
        <div className="font-medium">
          <p className="text-sm text-green-500">View more</p>
        </div>
      );
    },
  },
];

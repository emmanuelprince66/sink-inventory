import { ColumnDef } from "@tanstack/react-table";

import { formatToNaira } from "@/utils/formatMoney";
import { SupplyHistory } from "../types";

export const columns: ColumnDef<SupplyHistory>[] = [
  //   {
  //     accessorKey: "logo",
  //     header: "",
  //     cell: ({ row }) => {
  //       const supplier = row.original;
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
      const supplier = row.original;
      return (
        <div className="font-medium">
          <p className="text-sm text-gray-500">{supplier.created_at}</p>
        </div>
      );
    },
  },
  {
    accessorKey: "phone",
    header: "Phone Number",
    cell: ({ row }) => {
      const supplier = row.original;
      return (
        <div className="font-medium">
          <p className="text-sm text-gray-500">{supplier.status}</p>
        </div>
      );
    },
  },

  {
    accessorKey: "wallet",
    header: "Wallet Balance",
    cell: ({ row }) => {
      const supplier = row.original;

      return (
        <div className="font-medium">
          <p className="text-sm text-gray-500">
            {formatToNaira(supplier.cost_price)}
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

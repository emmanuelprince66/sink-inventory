import { ColumnDef } from "@tanstack/react-table";
import { SalesDataItem } from "./types";

export const columns: ColumnDef<SalesDataItem>[] = [
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
      const product = row.original;
      return (
        <div className="font-medium">
          <p className="text-sm text-gray-500">{product.name}</p>
        </div>
      );
    },
  },
  {
    accessorKey: "unit_sold",
    header: "Unit Sold",
    cell: ({ row }) => {
      const product = row.original;
      return (
        <div className="font-medium">
          <p className="text-sm text-gray-500">{product.unit_sold}</p>
        </div>
      );
    },
  },
  {
    accessorKey: "revenue",
    header: "Revenue",
    cell: ({ row }) => {
      const product = row.original;
      return (
        <div className="font-medium">
          <p className="text-sm text-gray-500">{product.revenue}</p>
        </div>
      );
    },
  },

  {
    accessorKey: "profit",
    header: "Profit",
    cell: ({ row }) => {
      const product = row.original;

      return (
        <div className="font-medium">
          <p className="text-sm text-gray-500">{product.profit}</p>
        </div>
      );
    },
  },
];

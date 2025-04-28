import { ColumnDef } from "@tanstack/react-table";
import { SalesOrder } from "./types";

export const columns: ColumnDef<SalesOrder>[] = [
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
    accessorKey: "order_id",
    header: "Order ID",
    cell: ({ row }) => {
      const order = row.original;
      return (
        <div className="font-medium">
          <p className="text-sm text-gray-500">{order.id}</p>
        </div>
      );
    },
  },
  {
    accessorKey: "created_at",
    header: "Created At",
    cell: ({ row }) => {
      const order = row.original;
      return (
        <div className="font-medium">
          <p className="text-sm text-gray-500">{order.created_at}</p>
        </div>
      );
    },
  },
  {
    accessorKey: "total_price",
    header: "Total Price",
    cell: ({ row }) => {
      const order = row.original;
      return (
        <div className="font-medium">
          <p className="text-sm text-gray-500">{order.total_price}</p>
        </div>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Payment Status",
    cell: ({ row }) => {
      const order = row.original;
      return (
        <div className="font-medium">
          <p className="text-sm text-gray-500">{order.payment_status}</p>
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

import { useUserRole } from "@/lib/store/user-store";
import { ColumnDef } from "@tanstack/react-table";
import moment from "moment";
import { SalesOrder } from "./types";

export const useOrderHistoryColumn = () => {
  const { user } = useUserRole();

  const columns: ColumnDef<SalesOrder>[] = [
    {
      accessorKey: "order_id",
      header: "Order ID",

      cell: ({ row }) => {
        const order = row.original;
        // Display shortened order ID (first 4 and last 4 characters)
        const shortId = order.id
          ? `${order.id.substring(0, 4)}...${order.id.slice(-4)}`
          : "N/A";
        return (
          <div className="font-medium">
            <p className="text-sm text-gray-500" title={order.id}>
              {shortId}
            </p>
          </div>
        );
      },
    },
    {
      accessorKey: "attendant",
      header: "Attendant Name",
      cell: ({ row }) => {
        const order = row.original;
        // Format date with moment

        return (
          <div className="font-medium">
            <p className="text-sm text-gray-500">{order.attendant}</p>
          </div>
        );
      },
    },
    {
      accessorKey: "pre_sale",
      header: "Presaled By",
      cell: ({ row }) => {
        const order = row.original;
        // Format date with moment

        return (
          <div className="font-medium">
            <p className="text-sm text-gray-500">{order.pre_sale}</p>
          </div>
        );
      },
    },
    {
      accessorKey: "created_at",
      header: "Date",
      cell: ({ row }) => {
        const order = row.original;
        // Format date with moment
        const formattedDate = order.created_at
          ? moment(order.created_at).format("MMM D, YYYY h:mm A")
          : "N/A";
        return (
          <div className="font-medium">
            <p className="text-sm text-gray-500">{formattedDate}</p>
          </div>
        );
      },
    },

    ...(user?.role === "OWNER"
      ? [
          {
            accessorKey: "total_price",
            header: "Amount",
            cell: ({ row }: { row: any }) => {
              const order = row.original;
              // Format currency with proper symbols
              const formattedAmount = order.total_price
                ? `₦${parseFloat(order.total_price).toLocaleString("en-NG", {
                    minimumFractionDigits: 2,
                  })}`
                : "₦0.00";
              return (
                <div className="font-medium">
                  <p className="text-sm text-gray-500">{formattedAmount}</p>
                </div>
              );
            },
          },
        ]
      : []),
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const order = row.original;
        // Add color coding based on status
        const statusColor =
          order.payment_status === "PAID"
            ? "text-green-500"
            : order.payment_status === "PENDING"
              ? "text-yellow-500"
              : "text-red-500";

        return (
          <div className="font-medium">
            <p className={`text-sm capitalize ${statusColor}`}>
              {order.payment_status || "unknown"}
            </p>
          </div>
        );
      },
    },
    {
      accessorKey: "action",
      header: "",
      cell: () => {
        return (
          <button className="text-sm font-medium text-green-500 hover:text-green-700 transition-colors">
            View →
          </button>
        );
      },
    },
  ];

  return columns;
};

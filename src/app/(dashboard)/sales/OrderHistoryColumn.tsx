import LoyaltyRewardTag from "@/components/LoyaltyRewardTag";
import { useUserRole } from "@/lib/store/user-store";
import { formatToNaira } from "@/utils/formatMoney";
import { ColumnDef } from "@tanstack/react-table";
import moment from "moment";
import { rewardSummaryOf, SalesOrder } from "./types";

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
        // Anchored to the ID rather than given a column of its own: most sales
        // redeem nothing, and an extra column would be empty on nearly every
        // row while narrowing the ones that carry data.
        const reward = rewardSummaryOf(order);

        return (
          <div className="font-medium">
            <p className="text-sm font-medium text-grey-3" title={order.id}>
              {shortId}
            </p>
            {reward && (
              <LoyaltyRewardTag
                label="Reward"
                title={
                  reward.program
                    ? `${reward.label} · ${reward.program}`
                    : reward.label
                }
                className="mt-1"
              />
            )}
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
            <p className="text-sm font-medium text-grey-3">{order.attendant}</p>
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
            <p className="text-sm font-medium text-grey-3">{order.pre_sale}</p>
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
            <p className="text-sm font-medium text-grey-3">{formattedDate}</p>
          </div>
        );
      },
    },

    ...(user?.role === "OWNER"
      ? [
          {
            accessorKey: "total_price",
            header: () => <div className="w-full text-right">Amount</div>,
            cell: ({ row }: { row: any }) => {
              const order = row.original;
              // Format currency with proper symbols
              const formattedAmount = formatToNaira(
                parseFloat(order.total_price || "0"),
              );
              return (
                <div className="font-medium">
                  <p className="text-sm font-bold text-grey-1 text-right">
                    {formattedAmount}
                  </p>
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
            ? "text-success-1"
            : order.payment_status === "PENDING"
              ? "text-warning-1"
              : "text-error-1";

        return (
          <div className="font-medium">
            <p className={`text-sm font-bold capitalize ${statusColor}`}>
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
          <button className="text-sm font-bold text-primary-green-300 hover:text-primary-green-300/80 transition-colors cursor-pointer">
            View →
          </button>
        );
      },
    },
  ];

  return columns;
};

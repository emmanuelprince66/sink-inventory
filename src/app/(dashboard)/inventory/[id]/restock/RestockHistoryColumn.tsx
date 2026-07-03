import { formatToNaira } from "@/utils/formatMoney";
import { ColumnDef } from "@tanstack/react-table";
import moment from "moment";

export const useRestockHistoryColumns = () => {
  const columns: ColumnDef<any>[] = [
    {
      accessorKey: "created_at",
      header: "Created at",
      cell: ({ row }) => {
        const restock = row.original;
        return (
          <div className="font-medium">
            <p className="text-sm text-grey-3">
              {moment(restock.created_at).format("MMM D, YYYY h:mm A")}
            </p>
          </div>
        );
      },
    },
    {
      accessorKey: "qty",
      header: "Quantity",
      cell: ({ row }) => {
        const restock = row.original;
        return (
          <div className="font-medium">
            <p className="text-sm text-grey-3">{restock.quantity}</p>
          </div>
        );
      },
    },
    {
      accessorKey: "restock_amount",
      header: "Restock Amount",
      cell: ({ row }) => {
        const restock = row.original;
        return (
          <div className="font-medium">
            <p className="text-sm text-grey-3">
              {formatToNaira(restock.restock_amount)}
            </p>
          </div>
        );
      },
    },
    {
      accessorKey: "amount_paid",
      header: " Amount Paid",
      cell: ({ row }) => {
        const restock = row.original;
        return (
          <div className="font-medium">
            <p className="text-sm text-grey-3">
              {formatToNaira(restock.amount_paid)}
            </p>
          </div>
        );
      },
    },
    {
      accessorKey: "selling_price",
      header: "Selling Price",
      cell: ({ row }) => {
        const restock = row.original;
        return (
          <div className="font-medium">
            <p className="text-sm text-grey-3">
              {formatToNaira(restock.selling_price)}
            </p>
          </div>
        );
      },
    },

    {
      accessorKey: "payment_method",
      header: "Payment Method",
      cell: ({ row }) => {
        const restock = row.original;
        return (
          <div className="font-medium">
            <p className="text-sm text-grey-3">{restock.payment_method}</p>
          </div>
        );
      },
    },
  ];

  return columns;
};

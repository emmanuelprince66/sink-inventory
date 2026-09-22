import { formatToNaira } from "@/utils/formatMoney";
import { ColumnDef } from "@tanstack/react-table";
import moment from "moment";
import { UrgencyPill, daysUntil, formatQty } from "../../batch";

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
      accessorKey: "batch_name",
      header: "Batch",
      cell: ({ row }) => (
        <div className="text-sm text-grey-2 max-w-[12rem] truncate" title={row.original.batch_name || ""}>
          {row.original.batch_name || "-"}
        </div>
      ),
    },
    {
      accessorKey: "expiry_date",
      header: "Expiry",
      cell: ({ row }) => {
        const expiry = row.original.expiry_date;
        if (!expiry) return <span className="text-sm text-grey-4">-</span>;
        return (
          <div className="flex flex-col items-start gap-1">
            <span className="text-sm text-grey-2">
              {moment(expiry).format("MMM D, YYYY")}
            </span>
            {/* Only while stock remains: an emptied batch has nothing left to expire. */}
            {Number(row.original.remaining_quantity) > 0 && (
              <UrgencyPill days={daysUntil(expiry)} />
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "remaining_quantity",
      header: "Remaining",
      cell: ({ row }) => {
        const left = row.original.remaining_quantity;
        if (left === undefined || left === null)
          return <span className="text-sm text-grey-4">-</span>;
        return (
          <span className="text-sm text-grey-2">
            {formatQty(left)}
            <span className="text-grey-4"> / {formatQty(row.original.quantity)}</span>
          </span>
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

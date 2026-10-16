import { ColumnDef } from "@tanstack/react-table";
import moment from "moment";
import type { ProductTransactionItem } from "@/api/products/get-transactions-history";

export const useProductSoldHistoryColumns = () => {
  const columns: ColumnDef<ProductTransactionItem>[] = [
    {
      accessorKey: "product_name",
      header: "Product",
      cell: ({ row }) => {
        const transaction = row.original;
        const itemName =
          transaction.variant_name || transaction.product_name || "-";
        return (
          <div className="min-w-36">
            <p className="text-sm font-semibold text-grey-1">{itemName}</p>
            {transaction.variant_name && transaction.product_name && (
              <p className="text-xs text-grey-3">{transaction.product_name}</p>
            )}
            {transaction.sku && (
              <p className="text-xs text-grey-3">SKU: {transaction.sku}</p>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "created_at",
      header: "Created at",
      cell: ({ row }) => {
        const transfer = row.original;
        return (
          <p className="text-sm font-medium text-grey-3">
            {moment(transfer.created_at).format("MMM D, YYYY h:mm A")}
          </p>
        );
      },
    },
    {
      accessorKey: "type",
      header: "Type",
      cell: ({ row }) => {
        const transfer = row.original;
        return (
          <p className="text-sm font-medium text-grey-3">{transfer.type || "-"}</p>
        );
      },
    },
    {
      accessorKey: "direction",
      header: "Direction",
      cell: ({ row }) => {
        const transfer = row.original;
        const isIn = transfer.direction === "in";
        return (
          <span
            className={`text-xs font-extrabold uppercase px-2 py-0.5 rounded-full ${
              isIn ? "bg-success-2 text-success-1" : "bg-error-2 text-error-1"
            }`}
          >
            {transfer.direction.toUpperCase()}
          </span>
        );
      },
    },
    {
      accessorKey: "quantity_change",
      header: "Quantity Change",
      cell: ({ row }) => {
        const transfer = row.original;
        return (
          <p className="text-sm font-bold text-grey-1">{transfer.quantity_change}</p>
        );
      },
    },
    {
      accessorKey: "new_quantity",
      header: "New Quantity",
      cell: ({ row }) => {
        const transfer = row.original;
        return (
          <p className="text-sm font-bold text-grey-1">
            {transfer.new_quantity || 0}
          </p>
        );
      },
    },
    {
      accessorKey: "batch_number",
      header: "Batch",
      cell: ({ row }) => {
        const transfer = row.original;
        return (
          <p
            className="text-sm font-medium text-grey-3 max-w-[12rem] truncate"
            title={transfer.batch_number || ""}
          >
            {transfer.batch_number || "-"}
          </p>
        );
      },
    },
    {
      accessorKey: "note",
      header: "Note",
      cell: ({ row }) => {
        const transfer = row.original;
        return (
          <p
            className="text-sm font-medium text-grey-3 max-w-[12rem] truncate"
            title={transfer.note || ""}
          >
            {transfer.note || "-"}
          </p>
        );
      },
    },
    {
      accessorKey: "sold_by",
      header: "Sold By",
      cell: ({ row }) => {
        const transfer = row.original;
        return (
          <p className="text-sm font-medium text-grey-3">{transfer.processor || "-"}</p>
        );
      },
    },
  ];

  return columns;
};

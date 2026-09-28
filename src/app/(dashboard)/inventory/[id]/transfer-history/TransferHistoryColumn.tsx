import { ColumnDef } from "@tanstack/react-table";
import moment from "moment";

export const useTransferHistoryColumns = () => {
  const columns: ColumnDef<any>[] = [
    {
      accessorKey: "created_at",
      header: "Created at",
      cell: ({ row }) => {
        const transfer = row.original;
        return (
          <div className="font-medium">
            <p className="text-sm text-grey-3">
              {moment(transfer.created_at).format("MMM D, YYYY h:mm A")}
            </p>
          </div>
        );
      },
    },
    {
      accessorKey: "transferred_by",
      header: "Transferred By",
      cell: ({ row }) => {
        const transfer = row.original;
        return (
          <div className="font-medium">
            <p className="text-sm text-grey-3">{transfer.transferred_by}</p>
          </div>
        );
      },
    },
    {
      accessorKey: "destination_business",
      header: "Destination Business",
      cell: ({ row }) => {
        const transfer = row.original;
        return (
          <div className="font-medium">
            <p className="text-sm text-grey-3">
              {transfer.destination_business}
            </p>
          </div>
        );
      },
    },
    {
      accessorKey: "destination_product",
      header: "Destination Product",
      cell: ({ row }) => {
        const transfer = row.original;
        return (
          <div className="font-medium">
            <p className="text-sm text-grey-3">
              {transfer.destination_product}
            </p>
          </div>
        );
      },
    },
    {
      accessorKey: "direction",
      header: "Direction",
      cell: ({ row }) => {
        const transfer = row.original;
        return (
          <div className="font-medium">
            <p className="text-sm text-grey-3">{transfer.direction}</p>
          </div>
        );
      },
    },
    {
      accessorKey: "qty",
      header: " Quantity",
      cell: ({ row }) => {
        const transfer = row.original;
        return (
          <div className="font-medium">
            <p className="text-sm text-grey-3">{transfer.quantity}</p>
          </div>
        );
      },
    },
    {
      accessorKey: "batch_number",
      header: "Batch",
      cell: ({ row }) => {
        const transfer = row.original;
        return (
          // Present on both directions — the batch number follows the stock
          // into the receiving branch, so both sides name the same batch.
          <p
            className="max-w-[12rem] truncate text-sm font-medium text-grey-3"
            title={transfer.batch_number || ""}
          >
            {transfer.batch_number || "-"}
          </p>
        );
      },
    },
    {
      accessorKey: "source_business",
      header: "Source Business",
      cell: ({ row }) => {
        const transfer = row.original;
        return (
          <div className="font-medium">
            <p className="text-sm text-grey-3">{transfer.source_business}</p>
          </div>
        );
      },
    },
  ];

  return columns;
};

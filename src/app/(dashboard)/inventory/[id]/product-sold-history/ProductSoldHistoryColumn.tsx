import { ColumnDef } from "@tanstack/react-table";
import moment from "moment";

export const useProductSoldHistoryColumns = () => {
  const columns: ColumnDef<any>[] = [
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
      accessorKey: "qty_change",
      header: "Quantity Change",
      cell: ({ row }) => {
        const transfer = row.original;
        return (
          <p className="text-sm font-bold text-grey-1">{transfer.quantity_change}</p>
        );
      },
    },
    {
      accessorKey: "new_qty",
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
      accessorKey: "sold_by",
      header: "Sold By",
      cell: ({ row }) => {
        const transfer = row.original;
        return (
          <p className="text-sm font-medium text-grey-3">{transfer.processor || "-"}</p>
        );
      },
    },
    {
      accessorKey: "moved_by",
      header: "Moved to Production By",
      cell: ({ row }) => {
        const transfer = row.original;
        return (
          <p className="text-sm font-medium text-grey-3">{transfer.moved_by || "-"}</p>
        );
      },
    },
    {
      accessorKey: "pre_sale",
      header: "Presaled By",
      cell: ({ row }) => {
        const transfer = row.original;
        return (
          <p className="text-sm font-medium text-grey-3">{transfer.pre_sale || "-"}</p>
        );
      },
    },
  ];

  return columns;
};

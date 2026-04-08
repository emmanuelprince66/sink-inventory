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
          <div className="font-medium">
            <p className="text-sm text-gray-500">
              {moment(transfer.created_at).format("MMM D, YYYY h:mm A")}
            </p>
          </div>
        );
      },
    },
    {
      accessorKey: "type",
      header: "Type",
      cell: ({ row }) => {
        const transfer = row.original;
        return (
          <div className="font-medium">
            <p className="text-sm text-gray-500">{transfer.type || "-"}</p>
          </div>
        );
      },
    },
    {
      accessorKey: "direction",
      header: "Direction",
      cell: ({ row }) => {
        const transfer = row.original;
        const colorClass =
          transfer.direction === "in" ? "text-green-500" : "text-red-500";
        return (
          <div className="font-medium">
            <p className={`text-sm ${colorClass}`}>
              {transfer.direction.toUpperCase()}
            </p>
          </div>
        );
      },
    },
    {
      accessorKey: "qty_change",
      header: "Quantity Change",
      cell: ({ row }) => {
        const transfer = row.original;
        return (
          <div className="font-medium">
            <p className="text-sm text-gray-500">{transfer.quantity_change}</p>
          </div>
        );
      },
    },
    {
      accessorKey: "new_qty",
      header: "New Quantity",
      cell: ({ row }) => {
        const transfer = row.original;
        return (
          <div className="font-medium">
            <p className="text-sm text-gray-500">
              {transfer.new_quantity || 0}
            </p>
          </div>
        );
      },
    },
    {
      accessorKey: "sold_by",
      header: "Sold By",
      cell: ({ row }) => {
        const transfer = row.original;
        return (
          <div className="font-medium">
            <p className="text-sm text-gray-500">{transfer.processor || "-"}</p>
          </div>
        );
      },
    },
    {
      accessorKey: "moved_by",
      header: "Moved to Production By",
      cell: ({ row }) => {
        const transfer = row.original;
        return (
          <div className="font-medium">
            <p className="text-sm text-gray-500">{transfer.moved_by || "-"}</p>
          </div>
        );
      },
    },
    {
      accessorKey: "pre_sale",
      header: "Presaled By",
      cell: ({ row }) => {
        const transfer = row.original;
        return (
          <div className="font-medium">
            <p className="text-sm text-gray-500">{transfer.pre_sale || "-"}</p>
          </div>
        );
      },
    },
  ];

  return columns;
};

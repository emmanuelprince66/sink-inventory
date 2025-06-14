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
              {moment(new Date()).format("MMM D, YYYY h:mm A")}
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
            <p className="text-sm text-gray-500">{40}</p>
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
            <p className="text-sm text-gray-500">{10}</p>
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
            <p className="text-sm text-gray-500">{"Emmanuel"}</p>
          </div>
        );
      },
    },
  ];

  return columns;
};

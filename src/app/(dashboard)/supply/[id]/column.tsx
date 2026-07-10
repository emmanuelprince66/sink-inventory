import { ColumnDef } from "@tanstack/react-table";
import moment from "moment";

import { StatusBadge } from "@/components/app/StatusBadge";
import { formatToNaira } from "@/utils/formatMoney";
import { SupplyHistory } from "../types";

export const columns: ColumnDef<SupplyHistory>[] = [
  {
    accessorKey: "name",
    header: "Item",
    cell: ({ row }) => {
      const supply = row.original;
      return (
        <div className="font-medium">
          <p className="text-sm text-grey-2">{supply.name}</p>
        </div>
      );
    },
  },
  {
    accessorKey: "created_at",
    header: "Date",
    cell: ({ row }) => {
      const supply = row.original;
      return (
        <div className="font-medium">
          <p className="text-sm text-grey-3">
            {moment(supply.created_at).format("MMM DD, YYYY")}
          </p>
        </div>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const supply = row.original;
      return <StatusBadge status={supply.status} type="payment" />;
    },
  },
  {
    accessorKey: "cost_price",
    header: "Cost Price",
    cell: ({ row }) => {
      const supply = row.original;

      return (
        <div className="font-medium">
          <p className="text-sm font-bold text-grey-2">
            {formatToNaira(supply.cost_price)}
          </p>
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
          <p className="text-sm font-bold text-primary-green-300">
            View more
          </p>
        </div>
      );
    },
  },
];

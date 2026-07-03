import { useUserRole } from "@/lib/store/user-store";
import { formatToNaira } from "@/utils/formatMoney";
import { ColumnDef } from "@tanstack/react-table";
import { EyeOff } from "lucide-react";
import { SalesDataItem } from "./types";

export const useSalesColumns = () => {
  const { user } = useUserRole();

  const columns: ColumnDef<SalesDataItem>[] = [
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => {
        const product = row.original;
        return (
          <div className="flex items-center gap-1.5">
            <p className="text-sm font-bold text-primary-green-300">{product.name}</p>

            {product?.watchlist && (
              <EyeOff
                className="w-3.5 h-3.5 text-error-1 flex-shrink-0"
                // title="On watchlist"
              />
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "unit_sold",
      header: "Unit Sold",
      cell: ({ row }) => {
        const product = row.original;
        return (
          <p className="text-sm font-bold text-primary-green-300">{product.unit_sold}</p>
        );
      },
    },
    // {
    //   accessorKey: "is_watchlist",
    //   header: "Watchlist",
    //   cell: ({ row }) => {
    //     const inventory = row.original;

    //     return (
    //       <div className={cn("font-medium")}>
    //         {inventory.is_watchlist ? "Yes" : "No"}
    //       </div>
    //     );
    //   },
    // },
    {
      accessorKey: "revenue",
      header: "Revenue",
      cell: ({ row }) => {
        const product = row.original;
        return (
          <p className="text-sm font-bold text-primary-green-300">
            {formatToNaira(product.revenue)}
          </p>
        );
      },
    },
    {
      accessorKey: "vat",
      header: "VAT",
      cell: ({ row }) => {
        const product = row.original;
        return <p className="text-sm font-medium text-grey-3">{product?.tax}</p>;
      },
    },
    // Conditionally include profit column
    ...(user?.role === "OWNER"
      ? [
          {
            accessorKey: "profit",
            header: "Profit",
            cell: ({ row }: { row: { original: SalesDataItem } }) => {
              const product = row.original;
              const profit = product.profit;
              const isPositive = profit >= 0;
              return (
                <p
                  className={`text-sm font-bold ${
                    isPositive ? "text-primary-green-300" : "text-error-1"
                  }`}
                >
                  {formatToNaira(profit)}
                </p>
              );
            },
          },
        ]
      : []),
    {
      accessorKey: "sku",
      header: "SKU",
      cell: ({ row }) => {
        const product = row.original;
        return <p className="text-sm font-medium text-grey-3">{product?.sku}</p>;
      },
    },

    ...(user?.role === "OWNER"
      ? [
          {
            accessorKey: "Discount",
            header: "Discount",
            cell: ({ row }: { row: { original: SalesDataItem } }) => {
              const product = row.original;

              return (
                <p className="text-sm font-medium text-grey-3">{product.discount}</p>
              );
            },
          },
        ]
      : []),
  ];

  return columns;
};

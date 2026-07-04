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
      header: () => <div className="w-full text-right">Unit Sold</div>,
      cell: ({ row }) => {
        const product = row.original;
        return (
          <p className="text-sm font-bold text-primary-green-300 text-right">
            {product.unit_sold}
          </p>
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
      header: () => <div className="w-full text-right">Revenue</div>,
      cell: ({ row }) => {
        const product = row.original;
        return (
          <p className="text-sm font-bold text-primary-green-300 text-right">
            {formatToNaira(product.revenue)}
          </p>
        );
      },
    },
    {
      accessorKey: "vat",
      header: () => <div className="w-full text-right">VAT</div>,
      cell: ({ row }) => {
        const product = row.original;
        return (
          <p className="text-sm font-medium text-grey-3 text-right">
            {product?.tax}
          </p>
        );
      },
    },
    // Conditionally include profit column
    ...(user?.role === "OWNER"
      ? [
          {
            accessorKey: "profit",
            header: () => <div className="w-full text-right">Profit</div>,
            cell: ({ row }: { row: { original: SalesDataItem } }) => {
              const product = row.original;
              const profit = product.profit;
              const isPositive = profit >= 0;
              return (
                <p
                  className={`text-sm font-bold text-right ${
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
      header: () => <div className="w-full text-right">SKU</div>,
      cell: ({ row }) => {
        const product = row.original;
        return (
          <p className="text-sm font-medium text-grey-3 text-right">
            {product?.sku}
          </p>
        );
      },
    },

    ...(user?.role === "OWNER"
      ? [
          {
            accessorKey: "Discount",
            header: () => <div className="w-full text-right">Discount</div>,
            cell: ({ row }: { row: { original: SalesDataItem } }) => {
              const product = row.original;

              return (
                <p className="text-sm font-medium text-grey-3 text-right">
                  {product.discount}
                </p>
              );
            },
          },
        ]
      : []),
  ];

  return columns;
};

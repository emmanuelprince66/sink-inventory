import { useUserRole } from "@/lib/store/user-store";
import { formatToNaira } from "@/utils/formatMoney";
import { ColumnDef } from "@tanstack/react-table";
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
          <div className="font-medium">
            <p className="text-sm text-gray-500">{product.name}</p>
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
          <div className="font-medium">
            <p className="text-sm text-gray-500">{product.unit_sold}</p>
          </div>
        );
      },
    },
    {
      accessorKey: "revenue",
      header: "Revenue",
      cell: ({ row }) => {
        const product = row.original;
        return (
          <div className="font-medium">
            <p className="text-sm text-gray-500">
              {formatToNaira(product.revenue)}
            </p>
          </div>
        );
      },
    },
    {
      accessorKey: "vat",
      header: "VAT",
      cell: ({ row }) => {
        const product = row.original;
        console.log("VAT value for product:", product); // Debug log
        return (
          <div className="font-medium">
            <p className="text-sm text-gray-500">{formatToNaira(0)}</p>
          </div>
        );
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
                <div className="font-medium">
                  <p
                    className={`text-sm ${
                      isPositive ? "text-green-500" : "text-red-500"
                    }`}
                  >
                    {formatToNaira(profit)}
                  </p>
                </div>
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
        return (
          <div className="font-medium">
            <p className="text-sm text-gray-500">-</p>
          </div>
        );
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
                <div className="font-medium">
                  <p className="text-sm text-gray-500">{product.discount}</p>
                </div>
              );
            },
          },
        ]
      : []),
  ];

  return columns;
};

import { useState } from "react";

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  SortingState,
  getSortedRowModel,
  useReactTable,
  Row,
} from "@tanstack/react-table";
import { ArrowDown, ArrowUp } from "lucide-react";

import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { Pagination } from "./Pagination";

interface CustomTableProps<TData> {
  columns: ColumnDef<TData>[];
  data: TData[];
  loading?: boolean;
  noDataText?: string | React.ReactNode;
  tableHeader?: React.ReactNode;
  onRowClick?: (row: Row<TData>) => void;
  rowClassName?: string | ((row: Row<TData>) => string);
  pagination?: {
    currentPage: number;
    totalPages: number;
    pageSize: number;
    onPageChange: (page: number) => void;
    onPageSizeChange: (size: number) => void;
  };
}

export function CustomTable<TData>({
  columns,
  data = [],
  loading = false,
  noDataText = "No data found",
  tableHeader,
  onRowClick,
  rowClassName,
  pagination,
}: CustomTableProps<TData>) {
  const [sorting, setSorting] = useState<SortingState>([]);

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const handleRowClick = (row: Row<TData>) => {
    if (onRowClick) {
      onRowClick(row);
      // You can perform additional actions here if needed
    }
  };

  const getRowClass = (row: Row<TData>) => {
    const baseClass = "border-b border-gray-200 hover:bg-gray-50";
    const additionalClass =
      typeof rowClassName === "function" ? rowClassName(row) : rowClassName;

    return `${baseClass} ${additionalClass || ""} ${
      onRowClick ? "cursor-pointer" : ""
    }`;
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-white shadow-sm mb-9">
      {tableHeader}

      <Table>
        <TableHeader className="bg-gray-50">
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id} className="hover:bg-gray-50">
              {headerGroup.headers.map((header) => {
                return (
                  <TableHead
                    key={header.id}
                    className="capitalize font-semibold text-gray-900 px-6 py-3"
                  >
                    {header.isPlaceholder ? null : (
                      <div
                        className={`flex items-center gap-2 ${
                          header.column.getCanSort() ? "cursor-pointer" : ""
                        }`}
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                        {{
                          asc: <ArrowUp className="h-4 w-4" />,
                          desc: <ArrowDown className="h-4 w-4" />,
                        }[header.column.getIsSorted() as string] ?? null}
                      </div>
                    )}
                  </TableHead>
                );
              })}
            </TableRow>
          ))}
        </TableHeader>

        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                <div className="flex items-center justify-center h-[300px]">
                  <div className="flex flex-col items-center gap-4">
                    <div className="flex space-x-2">
                      <div className="h-2 w-2 animate-bounce rounded-full bg-gray-500 [animation-delay:-0.3s]" />
                      <div className="h-2 w-2 animate-bounce rounded-full bg-gray-500 [animation-delay:-0.15s]" />
                      <div className="h-2 w-2 animate-bounce rounded-full bg-gray-500" />
                    </div>
                    <span className="text-gray-500">Loading data...</span>
                  </div>
                </div>
              </TableCell>
            </TableRow>
          ) : table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && "selected"}
                className={getRowClass(row)}
                onClick={() => handleRowClick(row)}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id} className="px-6 py-4 cursor-pointer">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                <div className="flex items-center justify-center h-[300px]">
                  {typeof noDataText === "string" ? (
                    <span className="text-gray-500">{noDataText}</span>
                  ) : (
                    noDataText
                  )}
                </div>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      {pagination && (
        <Pagination
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          pageSize={pagination.pageSize}
          onPageChange={pagination.onPageChange}
          onPageSizeChange={pagination.onPageSizeChange}
        />
      )}
    </div>
  );
}

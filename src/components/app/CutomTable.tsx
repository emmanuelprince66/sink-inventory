"use client";

import { useState } from "react";

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  Row,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { ArrowDown, ArrowUp } from "lucide-react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

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
  showSerialNumber?: boolean; // Add this prop
  /** Set to false when the table already sits inside a bordered/rounded parent card, to avoid a nested double border. */
  bordered?: boolean;
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
  showSerialNumber = true, // Default to true
  bordered = true,
}: CustomTableProps<TData>) {
  const [sorting, setSorting] = useState<SortingState>([]);

  // Add serial number column if enabled
  const tableColumns = [
    ...(showSerialNumber
      ? [
          {
            id: "serialNumber",
            header: "S/N",
            cell: ({ row }) => {
              // Calculate the serial number based on pagination if available
              const baseNumber = pagination
                ? (pagination.currentPage - 1) * pagination.pageSize +
                  row.index +
                  1
                : row.index + 1;
              return <span className="font-medium text-grey-3">{baseNumber}</span>;
            },
          } as ColumnDef<TData>,
        ]
      : []),
    ...columns,
  ];

  const table = useReactTable({
    data,
    columns: tableColumns,
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
    }
  };

  const getRowClass = (row: Row<TData>) => {
    // Matches the TableRow side (border-b) so tailwind-merge dedupes instead of stacking two lines.
    const baseClass = "border-b border-grey-6 hover:bg-grey-6";
    const additionalClass =
      typeof rowClassName === "function" ? rowClassName(row) : rowClassName;

    return `${baseClass} ${additionalClass || ""} ${
      onRowClick ? "cursor-pointer" : ""
    }`;
  };

  return (
    <div
      className={cn(
        "bg-white overflow-hidden mb-4",
        bordered && "rounded-xl border border-grey-5",
      )}
    >
      {tableHeader}

      <Table>
        <TableHeader className="bg-grey-6">
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id} className="hover:bg-grey-6 border-grey-6">
              {headerGroup.headers.map((header) => {
                return (
                  <TableHead
                    key={header.id}
                    className="uppercase tracking-wide font-extrabold text-xs text-primary-green-300 px-6 py-3.5"
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
              <TableCell
                colSpan={tableColumns.length}
                className="h-24 text-center"
              >
                <div className="flex items-center justify-center h-[300px]">
                  <div className="flex flex-col items-center gap-4">
                    <div className="flex space-x-2">
                      <div className="h-2 w-2 animate-bounce rounded-full bg-primary-green-300 [animation-delay:-0.3s]" />
                      <div className="h-2 w-2 animate-bounce rounded-full bg-primary-green-300 [animation-delay:-0.15s]" />
                      <div className="h-2 w-2 animate-bounce rounded-full bg-primary-green-300" />
                    </div>
                    <span className="text-sm font-medium text-grey-3">Loading data...</span>
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
              <TableCell
                colSpan={tableColumns.length}
                className="h-24 text-center"
              >
                <div className="flex items-center justify-center h-[300px]">
                  {typeof noDataText === "string" ? (
                    <span className="text-sm font-medium text-grey-4">{noDataText}</span>
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

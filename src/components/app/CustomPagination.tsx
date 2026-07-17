"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface CustomPaginationProps {
  currentPage: number;
  totalPages: number;
  total?: number;
  pageSize?: number;
  onPageChange: (page: number) => void;
  className?: string;
}

// Build a compact page list with ellipses, e.g. [1, '…', 4, 5, 6, '…', 12]
const buildPageList = (current: number, total: number): (number | "…")[] => {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages: (number | "…")[] = [1];
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  if (start > 2) pages.push("…");
  for (let i = start; i <= end; i++) pages.push(i);
  if (end < total - 1) pages.push("…");
  pages.push(total);
  return pages;
};

const CustomPagination = ({
  currentPage,
  totalPages,
  total,
  pageSize,
  onPageChange,
  className,
}: CustomPaginationProps) => {
  if (totalPages <= 1) {
    return total !== undefined ? (
      <div className={cn("text-xs text-grey-3 text-center py-2", className)}>
        Showing {total} {total === 1 ? "result" : "results"}
      </div>
    ) : null;
  }

  const pages = buildPageList(currentPage, totalPages);
  const showingFrom =
    pageSize && total !== undefined ? (currentPage - 1) * pageSize + 1 : null;
  const showingTo =
    pageSize && total !== undefined
      ? Math.min(currentPage * pageSize, total)
      : null;

  return (
    <div
      className={cn(
        "flex flex-col sm:flex-row items-center justify-between gap-3 py-3",
        className,
      )}
    >
      {showingFrom !== null && (
        <p className="text-xs text-grey-3">
          Showing {showingFrom}–{showingTo} of {total}
        </p>
      )}

      <div className="flex items-center gap-1 flex-wrap justify-center">
        <Button
          variant="outline"
          size="sm"
          disabled={currentPage <= 1}
          onClick={() => onPageChange(currentPage - 1)}
          className="h-8 px-2"
        >
          <ChevronLeft className="w-4 h-4" />
          <span className="hidden sm:inline ml-1">Prev</span>
        </Button>

        {pages.map((p, i) =>
          p === "…" ? (
            <span
              key={`ellipsis-${i}`}
              className="px-2 text-xs text-grey-4 select-none"
            >
              …
            </span>
          ) : (
            <button
              key={p}
              onClick={() => onPageChange(p)}
              className={cn(
                "h-8 min-w-8 px-2 rounded-md text-xs font-bold transition-colors cursor-pointer",
                p === currentPage
                  ? "bg-primary-green-300 text-white"
                  : "border border-grey-5 text-grey-2 hover:bg-grey-6",
              )}
            >
              {p}
            </button>
          ),
        )}

        <Button
          variant="outline"
          size="sm"
          disabled={currentPage >= totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          className="h-8 px-2"
        >
          <span className="hidden sm:inline mr-1">Next</span>
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

export default CustomPagination;

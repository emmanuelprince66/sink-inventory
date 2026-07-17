import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export interface TableSkeletonColumn {
  /** Tailwind width class for this column's placeholder bar, e.g. "w-32". Ignored when `flex` is set. */
  width?: string;
  /** Grow to fill remaining space — use for the primary/name column. */
  flex?: boolean;
  /** Hide this column below the `sm` breakpoint, matching real responsive tables. */
  hiddenOnMobile?: boolean;
  /** Render a leading thumbnail block (10x10, rounded) before the bar — for name/image columns. */
  thumbnail?: boolean;
  /** Render as a rounded-full pill instead of a bar — for status columns. */
  pill?: boolean;
  /** Right-align this column's content — for amount/numeric columns. */
  alignRight?: boolean;
}

interface TableSkeletonProps {
  columns: TableSkeletonColumn[];
  rows?: number;
  className?: string;
}

/**
 * Canonical table-loading skeleton — mirrors the shape a real table renders
 * (header row + N body rows shaped like real cells) instead of a generic
 * spinner or a stack of identical flat bars, so the page doesn't jump/resize
 * once real data arrives. Modeled on Inventory.tsx's InventoryTableSkeleton.
 */
export const TableSkeleton = ({
  columns,
  rows = 6,
  className,
}: TableSkeletonProps) => (
  <div className={cn("w-full", className)}>
    <div className="hidden md:flex items-center gap-4 px-4 sm:px-6 py-3.5 bg-grey-6 rounded-t-lg">
      {columns.map((col, i) => (
        <Skeleton
          key={i}
          className={cn(
            "h-3 bg-grey-5",
            col.flex ? "flex-1" : col.width || "w-16",
          )}
        />
      ))}
    </div>
    <div className="divide-y divide-grey-5 border border-grey-5 rounded-lg md:rounded-t-none overflow-hidden">
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div
          key={rowIndex}
          className="flex items-center gap-4 px-4 sm:px-6 py-4"
        >
          {columns.map((col, colIndex) => (
            <div
              key={colIndex}
              className={cn(
                "flex items-center gap-3 min-w-0",
                col.flex ? "flex-1" : "shrink-0",
                col.hiddenOnMobile && "hidden sm:flex",
                col.alignRight && "justify-end",
              )}
            >
              {col.thumbnail && (
                <Skeleton className="h-10 w-10 rounded-lg bg-grey-5 shrink-0" />
              )}
              <Skeleton
                className={cn(
                  "bg-grey-5",
                  col.pill
                    ? "h-6 w-16 rounded-full"
                    : cn("h-3.5", col.flex ? "flex-1" : col.width || "w-16"),
                )}
              />
            </div>
          ))}
        </div>
      ))}
    </div>
  </div>
);

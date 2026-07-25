import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

/**
 * Canonical "normal card" grid skeleton — for a grid of item cards (not KPI
 * tiles, not a table), e.g. Orders' order-card grid or a category grid. One
 * flat rounded block per card, sized to roughly the real card's footprint,
 * inside a grid matching the real grid's column classes. Modeled on
 * Orders.tsx's order-card grid skeleton.
 */
export const CardGridSkeleton = ({
  count = 6,
  cardHeight = "h-40",
  gridClassName = "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4",
  className,
}: {
  count?: number;
  cardHeight?: string;
  gridClassName?: string;
  className?: string;
}) => (
  <div className={cn(gridClassName, className)}>
    {Array.from({ length: count }).map((_, i) => (
      <Skeleton key={i} className={cn("w-full bg-grey-5 rounded-2xl", cardHeight)} />
    ))}
  </div>
);

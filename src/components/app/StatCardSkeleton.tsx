import { CustomCard } from "@/components/app/CustomCard";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

/**
 * Canonical overview/KPI stat-card skeleton — one shape reused everywhere a
 * page shows a row of stat tiles while loading, instead of each screen
 * hand-rolling a slightly different version (Orders/Inventory/Sales/Analytics
 * all previously drifted: different gaps, bar heights, and shells). Modeled
 * on Orders.tsx's CustomOrderCard loading branch.
 */
export const StatCardSkeleton = ({ className }: { className?: string }) => (
  <CustomCard
    className={cn("w-full rounded-2xl border-none p-0", className)}
    contentClassName="p-4 flex flex-col gap-3 items-start"
  >
    <Skeleton className="h-4 w-[100px] bg-grey-5" />
    <Skeleton className="h-6 w-[70px] bg-grey-5" />
  </CustomCard>
);

/** Renders `count` StatCardSkeletons inside the given grid className — the
 * grid classes should match whatever grid the real cards render into. */
export const StatCardSkeletonRow = ({
  count,
  gridClassName = "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4",
}: {
  count: number;
  gridClassName?: string;
}) => (
  <div className={gridClassName}>
    {Array.from({ length: count }).map((_, i) => (
      <StatCardSkeleton key={i} />
    ))}
  </div>
);

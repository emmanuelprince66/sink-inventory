import { Skeleton } from "@/components/ui/skeleton";

/**
 * The loading state for a chart body.
 *
 * Sits where the chart will be rather than where `ChartEmptyState` would:
 * that component says "no data yet", which is a claim about the answer, and
 * showing it while the request is still in flight tells the reader their
 * business has no customers. Bars of uneven height read as a chart arriving,
 * not as a broken panel.
 */
const BAR_HEIGHTS = [45, 70, 55, 85, 60, 95, 75, 50];

const ChartSkeleton = () => (
  <div className="flex h-full w-full items-end justify-between gap-2 px-1 pb-1">
    {BAR_HEIGHTS.map((height, i) => (
      <Skeleton
        key={i}
        className="w-full rounded-md bg-grey-5"
        style={{ height: `${height}%` }}
      />
    ))}
  </div>
);

export default ChartSkeleton;

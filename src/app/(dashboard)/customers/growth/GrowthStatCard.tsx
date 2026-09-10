import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { ArrowDown, ArrowUp } from "lucide-react";

interface GrowthStatCardProps {
  icon: React.ReactNode;
  iconTone?: string;
  label: string;
  value: string;
  delta?: string;
}

// Shared stat tile for the Customer Growth tabs (Overview/Analytics/Rewards/
// Referrals) — icon + label on top, big value, optional delta line.
export const GrowthStatCard = ({
  icon,
  iconTone = "bg-secondary-6 text-primary-green-300",
  label,
  value,
  delta,
}: GrowthStatCardProps) => {
  const isNegative = delta?.trim().startsWith("-");

  return (
    <div className="bg-white rounded-2xl border border-grey-5 p-4">
      <div className="flex items-center gap-2 mb-3">
        <div
          className={cn(
            "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
            iconTone,
          )}
        >
          {icon}
        </div>
        <p className="text-xs font-bold text-grey-3">{label}</p>
      </div>
      <p className="text-2xl font-extrabold text-grey-1">{value}</p>
      {delta && (
        <p
          className={cn(
            "text-xs font-bold mt-1 flex items-center gap-1",
            isNegative ? "text-error-1" : "text-primary-green-300",
          )}
        >
          {isNegative ? (
            <ArrowDown className="w-3 h-3" />
          ) : (
            <ArrowUp className="w-3 h-3" />
          )}
          {delta}
        </p>
      )}
    </div>
  );
};

/**
 * The loading shape of the tile above, mirroring it line for line: icon
 * circle, label, value, delta.
 *
 * A generic two-bar stat skeleton would reflow the moment real cards arrive,
 * and the alternative this replaced was worse — real tiles rendering an em
 * dash for every figure, which reads as "we looked, there is nothing" rather
 * than "still loading".
 */
export const GrowthStatCardSkeleton = () => (
  <div className="bg-white rounded-2xl border border-grey-5 p-4">
    <div className="flex items-center gap-2 mb-3">
      <Skeleton className="w-8 h-8 rounded-full bg-grey-5 shrink-0" />
      <Skeleton className="h-3 w-20 bg-grey-5" />
    </div>
    <Skeleton className="h-7 w-24 bg-grey-5" />
    <Skeleton className="h-3 w-28 bg-grey-5 mt-2" />
  </div>
);

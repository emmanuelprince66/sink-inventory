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

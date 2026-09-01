import { cn } from "@/lib/utils";
import { Gift } from "lucide-react";

/**
 * Marks something as having come from a loyalty reward.
 *
 * Green on white, matching the FREE · LOYALTY badge the POS receipt already
 * prints, so a reward looks the same on the paper the customer walks out with
 * and on the history the owner reads afterwards.
 *
 * Two jobs, which is why the label is a prop: on a sale row it says this sale
 * redeemed something, and on an item row it says this line was the thing given
 * away. `title` carries the reward's wording where the pill itself has no room
 * for it.
 */
const LoyaltyRewardTag = ({
  label = "Loyalty reward",
  title,
  className,
}: {
  label?: string;
  title?: string | null;
  className?: string;
}) => (
  <span
    title={title ?? undefined}
    className={cn(
      "inline-flex shrink-0 items-center gap-1 rounded-full bg-primary-green-300 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white",
      className,
    )}
  >
    <Gift className="h-3 w-3" />
    <span className="max-w-[12rem] truncate">{label}</span>
  </span>
);

export default LoyaltyRewardTag;

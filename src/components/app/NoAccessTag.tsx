import { cn } from "@/lib/utils";
import { Lock } from "lucide-react";

/**
 * Marks a control the signed-in person is not allowed to use.
 *
 * A disabled button on its own reads as broken — the commonest support call
 * is someone insisting a button "doesn't work". This says the button is fine
 * and they are not permitted, which is a different problem with a different
 * answer: ask the owner.
 *
 * Deliberately a tag and not a toast or a modal. It has to be readable at a
 * glance beside the thing it refers to, and it appears on screens people use
 * all day, so it must not demand dismissing.
 *
 * `reason` goes in the title so the short label stays short — the pill has to
 * fit inside a dropdown row without wrapping.
 */
const NoAccessTag = ({
  label = "No access",
  reason = "You don't have permission for this. Ask the business owner.",
  className,
}: {
  label?: string;
  reason?: string;
  className?: string;
}) => (
  <span
    title={reason}
    className={cn(
      "inline-flex shrink-0 items-center gap-1 rounded-full bg-grey-6 px-2 py-0.5 text-[10px] font-bold text-grey-3",
      className,
    )}
  >
    <Lock className="h-2.5 w-2.5" />
    {label}
  </span>
);

export default NoAccessTag;

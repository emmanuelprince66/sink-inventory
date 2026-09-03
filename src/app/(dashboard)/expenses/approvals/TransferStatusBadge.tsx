import { cn } from "@/lib/utils";
import { presentationFor } from "@/types/expense-governance";

/**
 * A transfer's status as a pill.
 *
 * Wording and colour both come from the one table in expense-governance, so
 * the list, the filter tabs and the detail sheet cannot disagree about what a
 * status is called.
 */
const TransferStatusBadge = ({
  status,
  className,
}: {
  status?: string | null;
  className?: string;
}) => {
  const tone = presentationFor(status);

  return (
    <span
      title={tone.hint}
      className={cn(
        "inline-flex shrink-0 items-center rounded-full border px-2 py-0.5 text-[10px] font-bold capitalize",
        tone.surface,
        tone.text,
        tone.border,
        className,
      )}
    >
      {tone.label}
    </span>
  );
};

export default TransferStatusBadge;

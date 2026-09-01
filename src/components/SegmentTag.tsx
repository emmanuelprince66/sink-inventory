import { toneFor } from "@/app/(dashboard)/customers/growth/segmentTone";
import { cn } from "@/lib/utils";

/**
 * A customer's segment, as a pill.
 *
 * The customer list and detail endpoints both compute this, so the same tag
 * can sit on a row, on a profile header and beside the name at the till
 * without any of them working it out for themselves. Colour comes from
 * `toneFor`, which the segments dashboard already uses — a customer tagged
 * "At Risk" is the same rose everywhere it appears.
 *
 * Renders nothing without a name: an unsegmented customer should show no pill
 * rather than an empty one.
 */
const SegmentTag = ({
  name,
  segmentType,
  className,
}: {
  name?: string | null;
  segmentType?: string | null;
  className?: string;
}) => {
  if (!name) return null;

  const tone = toneFor(segmentType ?? undefined, name);

  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold",
        // The tone icons are sized for the segment cards, which are much
        // larger than this; scaled down here rather than in the palette so the
        // cards keep theirs.
        "[&>svg]:h-3 [&>svg]:w-3",
        tone.badgeBg,
        className,
      )}
    >
      {tone.icon}
      <span className="max-w-[10rem] truncate">{name}</span>
    </span>
  );
};

export default SegmentTag;

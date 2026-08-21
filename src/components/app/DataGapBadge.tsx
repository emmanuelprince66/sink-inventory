"use client";

import { cn } from "@/lib/utils";
import { AlertTriangle, Check, Copy } from "lucide-react";
import { useState } from "react";

interface DataGapBadgeProps {
  /** What is standing in, e.g. "Sample data" or "Placeholder metrics". */
  label?: string;
  /** The endpoint or fields the backend still needs to provide. Copyable so it
   * can be pasted straight into a ticket or chat. */
  needs: string;
  className?: string;
}

/**
 * Marks any surface still rendering invented data. Deliberately visible rather
 * than a code comment: on a metrics screen a sample figure is indistinguishable
 * from a real one, and the whole point is that nobody reads ₦2.1M as fact.
 *
 * Every use of this badge is a standing request to the backend — the `needs`
 * string names exactly what would let it be deleted.
 */
const DataGapBadge = ({
  label = "Sample data",
  needs,
  className,
}: DataGapBadgeProps) => {
  const [copied, setCopied] = useState(false);

  const copy = () => {
    navigator.clipboard
      .writeText(needs)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      })
      .catch(() => {});
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border border-amber-300 bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-800",
        className,
      )}
      title={`Needs from backend: ${needs}`}
    >
      <AlertTriangle className="h-3 w-3 shrink-0" />
      {label}
      <button
        type="button"
        onClick={copy}
        title="Copy the endpoint this needs"
        className="ml-0.5 cursor-pointer text-amber-700 hover:text-amber-900"
      >
        {copied ? (
          <Check className="h-3 w-3" />
        ) : (
          <Copy className="h-3 w-3" />
        )}
      </button>
    </span>
  );
};

export default DataGapBadge;

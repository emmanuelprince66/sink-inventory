"use client";

import { useOfflineSales } from "@/hooks/useOfflineSales";
import { cn } from "@/lib/utils";
import { CloudUpload, TriangleAlert } from "lucide-react";

/**
 * A quiet note next to the connection pill: what's waiting on this device.
 * Syncing happens on its own, so this replaces success messages. Tap for the
 * details. Hidden when there's nothing to say.
 */
const OfflineSyncStatus = ({ onOpen }: { onOpen: () => void }) => {
  const {
    pendingCount,
    failedCount,
    syncing,
    issue,
    otherBusinessStuck,
  } = useOfflineSales();

  const needsAttention =
    failedCount > 0 ||
    Boolean(issue?.needsAttention) ||
    otherBusinessStuck > 0;
  const label =
    failedCount > 0
      ? `${failedCount} failed`
      : issue?.needsLogin
        ? "Log in to sync"
        : needsAttention
          ? "Can't sync"
          : syncing
          ? "Syncing…"
          : pendingCount > 0
            ? `${pendingCount} waiting`
            : null;

  if (!label) return null;

  return (
    <button
      type="button"
      onClick={onOpen}
      className={cn(
        "inline-flex shrink-0 cursor-pointer items-center gap-1 whitespace-nowrap rounded-full border px-2.5 py-1 text-xs font-bold transition-colors",
        needsAttention
          ? "border-error-1/30 bg-error-2 text-error-1"
          : "border-grey-5 bg-white text-grey-2 hover:bg-grey-6",
      )}
    >
      {needsAttention ? (
        <TriangleAlert className="h-3.5 w-3.5" />
      ) : (
        <CloudUpload className={cn("h-3.5 w-3.5", syncing && "animate-pulse")} />
      )}
      {label}
    </button>
  );
};

export default OfflineSyncStatus;

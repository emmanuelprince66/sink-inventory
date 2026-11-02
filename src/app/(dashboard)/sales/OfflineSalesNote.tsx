"use client";

import { useOfflineSales } from "@/hooks/useOfflineSales";
import { CloudUpload } from "lucide-react";

/**
 * Sales waiting on this device aren't on the server, so they aren't in this
 * list and can't be reversed yet. Says so, rather than leaving a cashier
 * looking for a sale they know they made.
 */
const OfflineSalesNote = () => {
  const { pendingCount } = useOfflineSales();
  if (!pendingCount) return null;

  return (
    <div className="flex w-full items-start gap-3 rounded-2xl border border-info-1/30 bg-info-2 px-4 py-3">
      <CloudUpload className="mt-0.5 h-5 w-5 shrink-0 text-info-1" />
      <p className="text-sm text-grey-1">
        {pendingCount} offline sale{pendingCount === 1 ? " is" : "s are"} still
        syncing from this device. {pendingCount === 1 ? "It" : "They"}&apos;ll
        appear here once synced, and can be reversed from then on.
      </p>
    </div>
  );
};

export default OfflineSalesNote;

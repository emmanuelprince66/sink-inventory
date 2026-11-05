"use client";

import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/toast/useToast";
import { useOfflineSales } from "@/hooks/useOfflineSales";
import { CloudOff, TriangleAlert } from "lucide-react";
import { useEffect, useRef } from "react";

/**
 * Shown while the till is taking sales offline, or when sales need a person. Sales that are simply waiting to sync don't need
 * a banner: they go on their own, and the status by the switch shows them.
 */
const OfflineSyncBanner = ({ onOpenSales }: { onOpenSales: () => void }) => {
  const {
    isOnline,
    pendingCount,
    failedCount,
    issue,
    otherBusinessStuck,
  } = useOfflineSales();
  const { showToast } = useToast();

  // The POS switches by itself, so say when it does. Not on opening the page.
  const wasOnline = useRef(isOnline);
  useEffect(() => {
    if (wasOnline.current === isOnline) return;
    wasOnline.current = isOnline;
    if (!isOnline) {
      showToast(
        "You're offline. Sales will be saved on this device.",
        "warning",
        { duration: 4000 },
      );
    } else {
      showToast(
        pendingCount > 0
          ? "You're back online. Syncing your saved sales."
          : "You're back online.",
        "success",
        { duration: 4000 },
      );
    }
  }, [isOnline, pendingCount, showToast]);

  const problem =
    failedCount > 0
      ? `${failedCount} offline sale${failedCount === 1 ? "" : "s"} couldn't sync and need${failedCount === 1 ? "s" : ""} a look.`
      : issue?.needsAttention
        ? issue.message
        : otherBusinessStuck > 0
          ? `${otherBusinessStuck} offline sale${otherBusinessStuck === 1 ? "" : "s"} from another business can't sync with this login. Log in with an account that has that business.`
          : null;

  if (!isOnline) {
    return (
      <div className="w-full flex items-center justify-between gap-3 flex-wrap rounded-2xl border border-warning-1/30 bg-warning-2 px-4 py-3">
        <div className="flex items-start gap-3">
          <CloudOff className="mt-0.5 h-5 w-5 shrink-0 text-warning-1" />
          <div className="text-sm">
            <p className="font-bold text-grey-1">
              You&apos;re offline
            </p>
            <p className="text-xs text-grey-2">
              Sales are saved on this device (Cash and Bank Transfer only) and
              sync on their own when the internet is back.
            </p>
            {problem && (
              <p className="mt-0.5 text-xs font-bold text-error-1">{problem}</p>
            )}
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {pendingCount > 0 && (
            <Button variant="outline" size="sm" onClick={onOpenSales}>
              View offline sales ({pendingCount})
            </Button>
          )}
        </div>
      </div>
    );
  }

  if (!problem) return null;

  return (
    <div className="w-full flex items-center justify-between gap-3 flex-wrap rounded-2xl border border-error-1/30 bg-error-2 px-4 py-3">
      <div className="flex items-start gap-3">
        <TriangleAlert className="mt-0.5 h-5 w-5 shrink-0 text-error-1" />
        <p className="text-sm font-bold text-error-1">{problem}</p>
      </div>
      {pendingCount > 0 && (
        <Button
          variant="outline"
          size="sm"
          className="bg-white"
          onClick={onOpenSales}
        >
          View offline sales
        </Button>
      )}
    </div>
  );
};

export default OfflineSyncBanner;

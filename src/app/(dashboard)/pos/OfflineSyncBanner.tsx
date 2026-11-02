"use client";

import { Button } from "@/components/ui/button";
import { useOfflineSales } from "@/hooks/useOfflineSales";
import { setManualOfflineMode } from "@/lib/offline/offlineMode";
import { CloudOff, TriangleAlert } from "lucide-react";

/**
 * Shown while the till isn't taking normal sales (Offline mode, no connection)
 * or when sales need a person. Sales that are simply waiting to sync don't need
 * a banner: they go on their own, and the status by the switch shows them.
 */
const OfflineSyncBanner = ({ onOpenSales }: { onOpenSales: () => void }) => {
  const {
    isOnline,
    manualOffline,
    pendingCount,
    failedCount,
    issue,
    otherBusinessStuck,
  } = useOfflineSales();

  const problem =
    failedCount > 0
      ? `${failedCount} offline sale${failedCount === 1 ? "" : "s"} couldn't sync and need${failedCount === 1 ? "s" : ""} a look.`
      : issue?.needsAttention
        ? issue.message
        : otherBusinessStuck > 0
          ? `${otherBusinessStuck} offline sale${otherBusinessStuck === 1 ? "" : "s"} from another business can't sync with this login. Log in with an account that has that business.`
          : null;

  if (manualOffline || !isOnline) {
    return (
      <div className="w-full flex items-center justify-between gap-3 flex-wrap rounded-2xl border border-warning-1/30 bg-warning-2 px-4 py-3">
        <div className="flex items-start gap-3">
          <CloudOff className="mt-0.5 h-5 w-5 shrink-0 text-warning-1" />
          <div className="text-sm">
            <p className="font-bold text-grey-1">
              {manualOffline ? "Offline mode is on" : "You're offline"}
            </p>
            <p className="text-xs text-grey-2">
              Sales are saved on this device (Cash and Bank Transfer only) and
              sync on their own {isOnline ? "in the background" : "when the internet is back"}.
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
          {manualOffline && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setManualOfflineMode(false)}
            >
              Turn off Offline mode
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

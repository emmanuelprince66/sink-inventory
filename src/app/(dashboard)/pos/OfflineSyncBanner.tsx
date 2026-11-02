"use client";

import { Button } from "@/components/ui/button";
import { useOfflineSales } from "@/hooks/useOfflineSales";
import { setManualOfflineMode } from "@/lib/offline/offlineMode";
import { CloudOff, CloudUpload } from "lucide-react";
import Link from "next/link";

const OFFLINE_SALES_PATH = "/pos/offline-sales";

/**
 * What state the till is in: Offline mode on, no connection, or sales saved
 * offline that still need syncing. Hidden when none of those apply.
 */
const OfflineSyncBanner = () => {
  const { isOnline, manualOffline, pendingCount } = useOfflineSales();
  const salesLabel = `${pendingCount} offline sale${pendingCount === 1 ? "" : "s"}`;

  const viewLink = pendingCount > 0 && (
    <Button asChild variant="outline" size="sm">
      <Link href={OFFLINE_SALES_PATH}>View offline sales ({pendingCount})</Link>
    </Button>
  );

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
              Sales are saved on this device (Cash and Bank Transfer only).
              {pendingCount > 0 && ` ${salesLabel} saved so far.`}{" "}
              {manualOffline
                ? "When the internet is working, turn off Offline mode and sync them from Offline Sales."
                : "When you're back online, sync them from Offline Sales."}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {viewLink}
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

  if (pendingCount === 0) return null;

  // Online with sales still on this device: keep reminding until synced.
  return (
    <div className="w-full flex items-center justify-between gap-3 flex-wrap rounded-2xl border border-info-1/30 bg-info-2 px-4 py-3">
      <div className="flex items-start gap-3">
        <CloudUpload className="mt-0.5 h-5 w-5 shrink-0 text-info-1" />
        <div className="text-sm">
          <p className="font-bold text-grey-1">
            {salesLabel} not synced yet
          </p>
          <p className="text-xs text-grey-2">
            They aren&apos;t in your sales or stock until you sync them.
          </p>
        </div>
      </div>
      <Button asChild size="sm" className="bg-primary-green-300 text-white">
        <Link href={OFFLINE_SALES_PATH}>Review &amp; sync</Link>
      </Button>
    </div>
  );
};

export default OfflineSyncBanner;

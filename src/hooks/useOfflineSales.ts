"use client";

import { usePosOffline } from "@/lib/offline/offlineMode";
import {
  getAllQueuedSales,
  getQueuedSales,
  getSyncIssue,
  isSyncingOffline,
  QueuedOfflineSale,
  subscribeOfflineSales,
  SyncIssue,
  SyncOutcome,
} from "@/lib/offline/offlineSales";
import { syncAndSettle } from "@/lib/offline/offlineSyncRun";
import { useBusinessStore } from "@/lib/store/useBusinessStore";
import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useState } from "react";
import { useToast } from "./toast/useToast";
import { useOnlineStatus } from "./useOnlineStatus";

/**
 * The offline sales queue for the current business, for showing it and for the
 * Sync now button. The sending itself happens in the background: see
 * OfflineSalesAutoSync.
 */
export const useOfflineSales = () => {
  const business_id = useBusinessStore((state) => state.business_id);
  const isOnline = !usePosOffline();
  // Sync now only needs the network: a successful sync is itself proof the
  // server is back, so it can clear a wrong "offline".
  const browserOnline = useOnlineStatus();
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  const [pending, setPending] = useState<QueuedOfflineSale[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [issue, setIssue] = useState<SyncIssue | null>(null);
  const [otherBusinessStuck, setOtherBusinessStuck] = useState(0);

  const refresh = useCallback(async () => {
    if (!business_id) {
      setPending([]);
      setLoaded(true);
      return;
    }
    setSyncing(isSyncingOffline(business_id));
    setIssue(getSyncIssue(business_id));
    getAllQueuedSales()
      .then((sales) =>
        setOtherBusinessStuck(
          sales.filter(
            (sale) =>
              sale.business_id !== business_id &&
              getSyncIssue(sale.business_id)?.needsAttention,
          ).length,
        ),
      )
      .catch(() => undefined);
    try {
      setPending(await getQueuedSales(business_id));
    } catch {
      setPending([]);
    } finally {
      setLoaded(true);
    }
  }, [business_id]);

  useEffect(() => {
    refresh();
    return subscribeOfflineSales(refresh);
  }, [refresh]);

  /** Why syncing can't happen right now, or null when it can. */
  const syncBlockedReason = !browserOnline
    ? "No internet. These sales will sync when it's back."
    : null;

  // Pressed by a person, so this also retries sales the server refused. No
  // success message: the status and the drawer already show it. A failure is
  // worth saying, since they're waiting on the result.
  const syncNow = useCallback(async (): Promise<SyncOutcome | null> => {
    if (!business_id || syncBlockedReason) return null;
    const outcome = await syncAndSettle(business_id, queryClient, {
      includeRejected: true,
    });
    if (outcome.lostLock) {
      showToast("Another tab is syncing these. Try again in a moment.", "info");
    } else if (outcome.failed) {
      showToast(
        outcome.error ??
          `${outcome.failed} sale${outcome.failed === 1 ? "" : "s"} could not sync.`,
        "error",
      );
    }
    return outcome;
  }, [business_id, syncBlockedReason, queryClient, showToast]);

  return {
    isOnline,
    pending,
    pendingCount: pending.length,
    failedCount: pending.filter((sale) => sale.rejected).length,
    issue,
    otherBusinessStuck,
    loaded,
    syncing,
    syncBlockedReason,
    syncNow,
  };
};

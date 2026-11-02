"use client";

import { queryKey } from "@/constants/query-key";
import { useManualOfflineMode } from "@/lib/offline/offlineMode";
import {
  getQueuedSales,
  QueuedOfflineSale,
  subscribeOfflineSales,
  syncOfflineQueue,
  SyncOutcome,
} from "@/lib/offline/offlineSales";
import { useBusinessStore } from "@/lib/store/useBusinessStore";
import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useState } from "react";
import { useToast } from "./toast/useToast";
import { useOnlineStatus } from "./useOnlineStatus";

/**
 * The offline sales queue for the current business. Syncing is manual: sales
 * stay on this device until someone presses Sync on the Offline Sales page,
 * which is only allowed with Offline mode off and a connection.
 */
export const useOfflineSales = () => {
  const business_id = useBusinessStore((state) => state.business_id);
  const isOnline = useOnlineStatus();
  const manualOffline = useManualOfflineMode();
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  const [pending, setPending] = useState<QueuedOfflineSale[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [syncing, setSyncing] = useState(false);

  const refresh = useCallback(async () => {
    if (!business_id) {
      setPending([]);
      setLoaded(true);
      return;
    }
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

  /** Why syncing isn't allowed right now, or null when it is. */
  const syncBlockedReason = manualOffline
    ? "Turn off Offline mode to sync."
    : !isOnline
      ? "You're offline. Connect to the internet to sync."
      : null;

  const syncNow = useCallback(async (): Promise<SyncOutcome | null> => {
    if (!business_id || syncBlockedReason) return null;

    setSyncing(true);
    try {
      const outcome = await syncOfflineQueue(business_id);
      if (outcome.synced) {
        showToast(
          `${outcome.synced} offline sale${outcome.synced === 1 ? "" : "s"} synced`,
          "success",
        );
        // Stock and sales history moved on the server.
        [
          queryKey.inventory.getAllInventory,
          queryKey.sales.getAllSalesHistory,
          queryKey.transactions.getAllTransactions,
        ].forEach((key) => queryClient.invalidateQueries({ queryKey: [key] }));
      }
      if (outcome.failed) {
        showToast(
          `${outcome.failed} sale${outcome.failed === 1 ? "" : "s"} could not sync. See the reason next to each one.`,
          "error",
        );
      }
      return outcome;
    } finally {
      setSyncing(false);
    }
  }, [business_id, syncBlockedReason, queryClient, showToast]);

  return {
    isOnline,
    manualOffline,
    pending,
    pendingCount: pending.length,
    loaded,
    syncing,
    syncBlockedReason,
    syncNow,
  };
};

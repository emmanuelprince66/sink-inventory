"use client";

import {
  OfflineCacheKind,
  readCached,
  subscribeOfflineCache,
} from "@/lib/offline/offlineCache";
import {
  OFFLINE_CACHE_TTL_MS,
  refreshOfflineCache,
} from "@/lib/offline/offlineCacheRefresh";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";
import { useBusinessStore } from "@/lib/store/useBusinessStore";
import { useEffect, useState } from "react";

const NONE: any[] = [];

/** Lets the POS's own first requests go first. */
const START_DELAY_MS = 2000;

/**
 * Keeps the saved product and customer lists up to date while the POS is open
 * and online. Runs in the background and never holds up the screen. This only
 * reads from the server; it has nothing to do with syncing sales.
 */
export const useOfflineCacheRefresh = ({ customers }: { customers: boolean }) => {
  const businessId = useBusinessStore((state) => state.business_id);
  // Offline mode doesn't matter here: with internet, the list stays current.
  const isOnline = useOnlineStatus();

  useEffect(() => {
    if (!businessId || !isOnline) return;

    const run = () => {
      refreshOfflineCache("products", businessId);
      if (customers) refreshOfflineCache("customers", businessId);
    };
    const start = setTimeout(run, START_DELAY_MS);
    // A till stays on this screen all day, and online sales move stock.
    const interval = setInterval(run, OFFLINE_CACHE_TTL_MS);
    return () => {
      clearTimeout(start);
      clearInterval(interval);
    };
  }, [businessId, isOnline, customers]);
};

/** One saved list, loaded into memory only while `active`. */
export const useCachedList = <T = any>(
  kind: OfflineCacheKind,
  active: boolean,
): { items: T[]; loading: boolean } => {
  const businessId = useBusinessStore((state) => state.business_id);
  const [loaded, setLoaded] = useState<{
    businessId: string;
    items: T[];
  } | null>(null);

  useEffect(() => {
    if (!active || !businessId) return;

    let cancelled = false;
    const load = () =>
      readCached<T>(kind, businessId)
        .catch(() => [] as T[])
        .then((items) => {
          if (!cancelled) setLoaded({ businessId, items });
        });
    load();
    const unsubscribe = subscribeOfflineCache(load);
    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, [kind, active, businessId]);

  const current = loaded?.businessId === businessId ? loaded : null;
  return {
    items: current?.items ?? NONE,
    loading: active && Boolean(businessId) && !current,
  };
};

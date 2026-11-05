"use client";

import {
  isPosOfflineNow,
  subscribeConnection,
} from "@/lib/offline/offlineMode";
import {
  getAllQueuedSales,
  subscribeOfflineSales,
} from "@/lib/offline/offlineSales";
import { syncAndSettle } from "@/lib/offline/offlineSyncRun";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

/** Soon after a sale, so it isn't sitting on one device for long. */
const AFTER_SALE_MS = 3000;
const FIRST_RETRY_MS = 60_000;
const LONGEST_RETRY_MS = 5 * 60_000;

/** 1–5s, so every till doesn't hit the API the instant the internet returns. */
const jitter = () => Math.floor(Math.random() * 4000) + 1000;

/** Rejected sales need a person; retrying them on a timer can't help. */
const waitingByBusiness = async () => {
  const sales = await getAllQueuedSales().catch(() => []);
  const byBusiness = new Map<string, string[]>();
  sales
    .filter((sale) => !sale.rejected)
    .forEach((sale) => {
      const ids = byBusiness.get(sale.business_id) ?? [];
      ids.push(sale.client_sale_id);
      byBusiness.set(sale.business_id, ids);
    });
  return byBusiness;
};

/**
 * Sends offline sales in the background once the internet is back. Covers every
 * business with sales on this device, since an owner can switch business mid-shift, and
 * mounted in the dashboard layout so it keeps going on any page. Each business
 * backs off on its own, so sales this login can't send never delay ones it can.
 * Renders nothing and shows no messages; the POS shows the quiet status.
 *
 * Repeat sends are safe: the server skips sales it already has.
 */
const OfflineSalesAutoSync = () => {
  const queryClient = useQueryClient();

  useEffect(() => {
    let stopped = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const backoff = new Map<string, { delay: number; notBefore: number }>();
    const seen = new Set<string>();

    const notBefore = (businessId: string) =>
      backoff.get(businessId)?.notBefore ?? 0;

    const schedule = (ms: number) => {
      if (stopped) return;
      clearTimeout(timer);
      timer = setTimeout(run, ms);
    };

    /** Wakes for whichever business is due first. */
    const scheduleNext = (waiting: Map<string, string[]>) => {
      const due = Array.from(waiting.keys()).map(notBefore);
      if (due.length) schedule(Math.max(Math.min(...due) - Date.now(), 0));
    };

    const syncBusiness = async (businessId: string) => {
      const outcome = await syncAndSettle(businessId, queryClient);
      const stillWaiting = (await waitingByBusiness()).has(businessId);
      if (stillWaiting && (outcome.synced === 0 || outcome.error)) {
        // Wait longer each time so a struggling server isn't kept busy.
        const delay = backoff.get(businessId)?.delay ?? FIRST_RETRY_MS;
        backoff.set(businessId, {
          notBefore: Date.now() + delay,
          delay: Math.min(delay * 2, LONGEST_RETRY_MS),
        });
      } else {
        backoff.delete(businessId);
      }
    };

    const run = async () => {
      if (stopped || isPosOfflineNow()) return;
      const waiting = await waitingByBusiness();
      const due = Array.from(waiting.keys()).filter(
        (businessId) => notBefore(businessId) <= Date.now(),
      );
      // One at a time: this is background work on a possibly poor connection.
      for (const businessId of due) {
        if (stopped) return;
        await syncBusiness(businessId);
      }
      if (!stopped) scheduleNext(await waitingByBusiness());
    };

    const onQueueChanged = async () => {
      const waiting = await waitingByBusiness();
      let hasNew = false;
      waiting.forEach((ids) =>
        ids.forEach((id) => {
          if (!seen.has(id)) hasNew = true;
          seen.add(id);
        }),
      );
      if (hasNew) schedule(AFTER_SALE_MS);
    };

    const onOnline = () => {
      backoff.clear();
      schedule(jitter());
    };

    // Sales left from before: the tab was closed, or the login had expired.
    waitingByBusiness().then((waiting) => {
      waiting.forEach((ids) => ids.forEach((id) => seen.add(id)));
      if (waiting.size) schedule(jitter());
    });

    const unsubscribe = subscribeOfflineSales(onQueueChanged);
    const unsubscribeConnection = subscribeConnection(() => {
      if (!isPosOfflineNow()) onOnline();
    });
    window.addEventListener("online", onOnline);

    return () => {
      stopped = true;
      clearTimeout(timer);
      unsubscribe();
      unsubscribeConnection();
      window.removeEventListener("online", onOnline);
    };
  }, [queryClient]);

  return null;
};

export default OfflineSalesAutoSync;

import { queryKey } from "@/constants/query-key";
import type { QueryClient } from "@tanstack/react-query";
import { useBusinessStore } from "@/lib/store/useBusinessStore";
import { useCartStore } from "@/lib/store/cart-store";
import { deductCachedStock, soldUnits } from "./offlineCache";
import {
  refreshOfflineCache,
  requestRefreshIfRunning,
} from "./offlineCacheRefresh";
import { isPosOfflineNow } from "./offlineMode";
import {
  releaseSettledSales,
  syncOfflineQueue,
  SyncOutcome,
} from "./offlineSales";

/** Longest the stock on screen keeps counting synced sales if a refetch hangs. */
const STOCK_SETTLE_TIMEOUT_MS = 15000;
/** Lets the saved list re-read before the sales stop being counted. */
const CACHE_SETTLE_MS = 300;

// The background sync and the Sync now button can fire together. Sharing the
// run also means the sold stock is taken off the saved list once, not twice.
const running = new Map<string, Promise<SyncOutcome>>();

const settle = async (
  businessId: string,
  queryClient: QueryClient,
  outcome: SyncOutcome,
) => {
  if (!outcome.synced) {
    releaseSettledSales(businessId);
    return;
  }

  // The saved list still has the stock from before these sales. A sync can
  // follow every sale, so it's corrected here rather than downloaded again.
  await deductCachedStock(businessId, outcome.syncedSales).catch(
    () => undefined,
  );
  requestRefreshIfRunning("products", businessId);
  // Sales it already had may or may not be in the saved stock, so they can't
  // be subtracted safely. Rare enough to just download the list.
  if (outcome.alreadySynced) {
    refreshOfflineCache("products", businessId, { force: true });
  }

  // Cart lines hold the stock from when they were added. They stop counting
  // these sales as waiting at this same moment, so they take them off instead.
  const release = () => {
    if (useBusinessStore.getState().business_id === businessId) {
      useCartStore.getState().deductSoldStock(soldUnits(outcome.syncedSales));
    }
    releaseSettledSales(businessId);
  };

  [
    queryKey.sales.getAllSalesHistory,
    queryKey.transactions.getAllTransactions,
  ].forEach((key) => queryClient.invalidateQueries({ queryKey: [key] }));

  const inventory = queryClient.invalidateQueries({
    queryKey: [queryKey.inventory.getAllInventory],
  });

  if (isPosOfflineNow()) {
    // The grid reads the saved list, which is now correct.
    setTimeout(release, CACHE_SETTLE_MS);
    return;
  }

  // The grid reads the inventory query: keep counting the synced sales until
  // the fresh numbers arrive, so stock doesn't jump up and back down.
  Promise.race([
    inventory,
    new Promise((resolve) => setTimeout(resolve, STOCK_SETTLE_TIMEOUT_MS)),
  ]).finally(release);
};

/** Sends waiting sales and brings stock and history up to date. Silent. */
export const syncAndSettle = (
  businessId: string,
  queryClient: QueryClient,
  options: { includeRejected?: boolean } = {},
): Promise<SyncOutcome> => {
  let run = running.get(businessId);
  // A background run leaves out rejected sales. Someone asking to retry those
  // gets their own run straight after, not a run that skips them.
  if (run && options.includeRejected) {
    return run.then(() => syncAndSettle(businessId, queryClient, options));
  }
  if (!run) {
    run = syncOfflineQueue(businessId, options)
      .then(async (outcome) => {
        await settle(businessId, queryClient, outcome);
        return outcome;
      })
      .finally(() => {
        running.delete(businessId);
      });
    running.set(businessId, run);
  }
  return run;
};

import { fetchCustomers } from "@/api/customer/useGetCustomerQuery";
import { fetchInventory } from "@/api/inventory/fetch-inventory";
import {
  getCacheGeneration,
  OfflineCacheKind,
  replaceCached,
} from "./offlineCache";
import { isPosOfflineNow } from "./offlineMode";

const PAGE_SIZE = 50;
// Stops a bad `pages` value from looping forever.
const MAX_PAGES = 500;
// Room between requests so the cashier's own requests aren't kept waiting.
const PAGE_GAP_MS = 150;

/** How long a saved list counts as fresh enough not to fetch again. */
export const OFFLINE_CACHE_TTL_MS = 10 * 60 * 1000;

const fetchers: Record<
  OfflineCacheKind,
  (businessId: string, page: number) => Promise<any>
> = {
  // Same list the POS grid shows: everything but raw materials.
  products: (id, page) =>
    fetchInventory({ id, page, limit: PAGE_SIZE, include_raw_material: false }),
  customers: (id, page) => fetchCustomers({ id, page, limit: PAGE_SIZE }),
};

const fetchAllPages = async (kind: OfflineCacheKind, businessId: string) => {
  const all: any[] = [];
  for (let page = 1; page <= MAX_PAGES; page += 1) {
    if (isPosOfflineNow()) throw new Error("Offline");

    const response = await fetchers[kind](businessId, page);
    const rows = response?.data?.results?.data;
    if (!Array.isArray(rows)) throw new Error("Unexpected response");
    all.push(...rows);

    const pages = Number(response?.data?.pages) || 0;
    const more = pages ? page < pages : rows.length >= PAGE_SIZE;
    if (!more || !rows.length) break;
    await new Promise((resolve) => setTimeout(resolve, PAGE_GAP_MS));
  }
  return all;
};

// Includes the generation so a sign-out also forgets when lists were last saved.
const jobKey = (kind: OfflineCacheKind, businessId: string) =>
  `${getCacheGeneration()}:${kind}:${businessId}`;

const running = new Map<string, Promise<void>>();
const runAgain = new Set<string>();
const lastSaved = new Map<string, number>();

const runJob = async (kind: OfflineCacheKind, businessId: string) => {
  const key = jobKey(kind, businessId);
  const startedIn = getCacheGeneration();
  try {
    const items = await fetchAllPages(kind, businessId);
    if (startedIn !== getCacheGeneration()) return; // signed out meanwhile
    await replaceCached(kind, businessId, items);
    lastSaved.set(key, Date.now());
  } catch {
    // Quietly keep the old list. This is background work; the till is fine
    // without it and the next run tries again.
  }
};

/**
 * A download under way may have read stock from before a sale that just synced,
 * and would overwrite the correction when it finishes. Run again after it.
 */
export const requestRefreshIfRunning = (
  kind: OfflineCacheKind,
  businessId: string,
) => {
  const key = jobKey(kind, businessId);
  if (running.has(key)) runAgain.add(key);
};

/**
 * Refreshes one saved list in the background. Never rejects. `force` skips the
 * freshness check, and if a run is already under way, starts another after it:
 * that one may have read stock from before whatever made this one necessary.
 */
export const refreshOfflineCache = (
  kind: OfflineCacheKind,
  businessId: string,
  { force = false }: { force?: boolean } = {},
): Promise<void> => {
  const key = jobKey(kind, businessId);

  const existing = running.get(key);
  if (existing) {
    if (force) runAgain.add(key);
    return existing;
  }

  const saved = lastSaved.get(key);
  if (!force && saved && Date.now() - saved < OFFLINE_CACHE_TTL_MS) {
    return Promise.resolve();
  }

  const job = runJob(kind, businessId).finally(() => {
    running.delete(key);
    if (runAgain.delete(key)) refreshOfflineCache(kind, businessId, { force: true });
  });
  running.set(key, job);
  return job;
};

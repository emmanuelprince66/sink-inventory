"use client";

import {
  getQueuedSales,
  getSettlingSales,
  QueuedOfflineSale,
  subscribeOfflineSales,
} from "@/lib/offline/offlineSales";
import { useBusinessStore } from "@/lib/store/useBusinessStore";
import { toQuantity } from "@/utils/stock";
import { useCallback, useMemo, useSyncExternalStore } from "react";

/**
 * How many units of each product id are sitting in offline sales: what the
 * server's stock figure doesn't know about yet. Keyed by the id the sale sends,
 * which for a variation line is the variation's id.
 *
 * One shared copy per business, so a modal opening mid-shift has the right
 * numbers on its first render instead of flashing the server's.
 */
type Totals = Readonly<Record<string, number>>;

/** Combos and services hold no stock count of their own. */
const NO_STOCK_TYPES = new Set(["SERVICE", "COMBO"]);

const EMPTY: Totals = Object.freeze({});

const totalsOf = (sales: QueuedOfflineSale[]): Totals => {
  const totals: Record<string, number> = {};
  sales.forEach((sale) => {
    sale.payload.products.forEach((line) => {
      if (NO_STOCK_TYPES.has(String(line.type ?? "").toUpperCase())) return;
      const id = String(line.id);
      const next = (totals[id] ?? 0) + (toQuantity(line.quantity) ?? 0);
      totals[id] = Math.round(next * 1000) / 1000;
    });
  });
  return totals;
};

const sameTotals = (a: Totals, b: Totals) => {
  const aKeys = Object.keys(a);
  return (
    aKeys.length === Object.keys(b).length &&
    aKeys.every((key) => a[key] === b[key])
  );
};

interface BusinessEntry {
  sales: QueuedOfflineSale[];
  totals: Totals;
  /** Components watching this business. */
  watchers: number;
  /** Newest read wins if two overlap. */
  readId: number;
}

const entries = new Map<string, BusinessEntry>();
const listeners = new Set<() => void>();
let stopWatchingQueue: (() => void) | null = null;

const entryFor = (businessId: string): BusinessEntry => {
  let entry = entries.get(businessId);
  if (!entry) {
    entry = { sales: [], totals: EMPTY, watchers: 0, readId: 0 };
    entries.set(businessId, entry);
  }
  return entry;
};

/**
 * The queue plus any synced sales whose stock hasn't come back from the server
 * yet. A sale can be in both for a moment while it's being removed, so it's
 * counted by id, once.
 */
const recompute = (businessId: string) => {
  const entry = entryFor(businessId);
  const byId = new Map<string, QueuedOfflineSale>();
  [...entry.sales, ...getSettlingSales(businessId)].forEach((sale) =>
    byId.set(sale.client_sale_id, sale),
  );
  const totals = totalsOf(Array.from(byId.values()));
  if (sameTotals(entry.totals, totals)) return;
  entry.totals = Object.keys(totals).length ? totals : EMPTY;
  listeners.forEach((listener) => listener());
};

const read = async (businessId: string) => {
  const entry = entryFor(businessId);
  const readId = ++entry.readId;
  try {
    const sales = await getQueuedSales(businessId);
    if (readId !== entry.readId) return;
    entry.sales = sales;
    recompute(businessId);
  } catch {
    // Offline storage unavailable: nothing queued that we can see.
  }
};

const onQueueChanged = () => {
  entries.forEach((entry, businessId) => {
    if (!entry.watchers) return;
    // Synchronously first: a release of settled sales has to land in the same
    // tick as the refetched stock, or the sale is taken off twice for a frame.
    recompute(businessId);
    read(businessId);
  });
};

const subscribeTo = (businessId: string | null) => (listener: () => void) => {
  listeners.add(listener);
  if (!stopWatchingQueue) {
    stopWatchingQueue = subscribeOfflineSales(onQueueChanged);
  }
  if (businessId) {
    entryFor(businessId).watchers += 1;
    read(businessId);
  }
  return () => {
    listeners.delete(listener);
    if (businessId) entryFor(businessId).watchers -= 1;
    if (!listeners.size && stopWatchingQueue) {
      stopWatchingQueue();
      stopWatchingQueue = null;
    }
  };
};

/** `queuedFor(id)`: units of that product id still in offline sales. */
export const useQueuedStock = () => {
  const businessId = useBusinessStore((state) => state.business_id);
  const subscribe = useMemo(() => subscribeTo(businessId), [businessId]);
  const totals = useSyncExternalStore(
    subscribe,
    () => (businessId ? (entries.get(businessId)?.totals ?? EMPTY) : EMPTY),
    () => EMPTY,
  );

  const queuedFor = useCallback((id: string) => totals[id] ?? 0, [totals]);

  return { queuedFor };
};

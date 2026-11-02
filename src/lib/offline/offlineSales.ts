/**
 * Offline POS sales.
 *
 * When the till has no connection, a CASH or BANK sale is kept in IndexedDB
 * (it survives a refresh or a closed tab) and posted later to
 * POST sale/<business_id>/sync/. The backend is idempotent on
 * client_sale_id / idempotency_key, so sending the same sale twice after a
 * dropped response is safe: it comes back ALREADY_SYNCED and stock is only
 * taken once.
 */

export type OfflineSaleMethod = "CASH" | "CARD" | "BANK";

export interface OfflineSaleProduct {
  id: string;
  type: string;
  quantity: number;
  unit_price: string;
  discount: string;
}

/** Exactly what one entry of the sync endpoint's `sales` array expects. */
export interface OfflineSalePayload {
  client_sale_id: string;
  idempotency_key: string;
  occurred_at: string;
  method: OfflineSaleMethod;
  customer?: string;
  /** Who served the sale. Omitted: the server uses the logged-in user. */
  attendant?: string;
  bank?: string;
  description: string;
  products: OfflineSaleProduct[];
}

export interface QueuedOfflineSale {
  client_sale_id: string;
  business_id: string;
  payload: OfflineSalePayload;
  /** Total collected, kept only for display in the pending list. */
  total: number;
  created_at: string;
  /** Last sync failure for this sale, if any. */
  last_error?: string;
  /** For the Offline Sales page only; never sent to the server. */
  display?: {
    items: { name: string; quantity: number; line_total: number }[];
    attendant_name?: string;
    customer_name?: string;
  };
}

interface SyncResultRow {
  client_sale_id: string;
  sale_id?: string;
  reference?: string;
  status: string;
  /** Set when status is "ERROR", e.g. "Product <id> not found." */
  message?: string;
}

const DB_NAME = "sync360-pos";
const STORE = "offline_sales";
const CHUNK_SIZE = 50;

/* ---------------------------------------------------------------- IndexedDB */

let dbPromise: Promise<IDBDatabase> | null = null;

const openDb = (): Promise<IDBDatabase> => {
  if (typeof indexedDB === "undefined") {
    return Promise.reject(new Error("Offline storage is not available"));
  }
  if (!dbPromise) {
    dbPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, 1);
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(STORE)) {
          const store = db.createObjectStore(STORE, {
            keyPath: "client_sale_id",
          });
          store.createIndex("business_id", "business_id");
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => {
        dbPromise = null;
        reject(request.error);
      };
    });
  }
  return dbPromise;
};

const run = async <T>(
  mode: IDBTransactionMode,
  action: (store: IDBObjectStore) => IDBRequest<T>,
): Promise<T> => {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, mode);
    const request = action(tx.objectStore(STORE));
    tx.oncomplete = () => resolve(request.result);
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error);
  });
};

/* ---------------------------------------------------------- change notices */

// Lets the banner's pending count update the moment a sale is queued or synced.
const listeners = new Set<() => void>();
const notify = () => listeners.forEach((listener) => listener());
export const subscribeOfflineSales = (listener: () => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

/* --------------------------------------------------------------- the queue */

export const newClientSaleId = (): string => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  // RFC 4122 v4 fallback for older browsers.
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
  });
};

export const queueOfflineSale = async (sale: QueuedOfflineSale) => {
  await run("readwrite", (store) => store.put(sale));
  notify();
};

export const getQueuedSales = async (
  businessId: string,
): Promise<QueuedOfflineSale[]> => {
  const rows = await run<QueuedOfflineSale[]>("readonly", (store) =>
    store.index("business_id").getAll(businessId),
  );
  return rows.sort((a, b) => a.created_at.localeCompare(b.created_at));
};

const removeQueuedSales = async (ids: string[]) => {
  if (!ids.length) return;
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    const store = tx.objectStore(STORE);
    ids.forEach((id) => store.delete(id));
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
  notify();
};

const recordError = async (sales: QueuedOfflineSale[], message: string) => {
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    const store = tx.objectStore(STORE);
    sales.forEach((sale) => store.put({ ...sale, last_error: message }));
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
  notify();
};

/* ---------------------------------------------------------------- syncing */

export interface SyncOutcome {
  synced: number;
  failed: number;
  error?: string;
}

// One sync at a time per business: the "online" event, the timer and the
// "Sync now" button can all fire together.
const inFlight = new Map<string, Promise<SyncOutcome>>();

const SYNCED_STATUSES = new Set(["SYNCED", "ALREADY_SYNCED"]);

const syncChunk = async (
  businessId: string,
  chunk: QueuedOfflineSale[],
): Promise<{ done: string[]; rejected: Map<string, string> }> => {
  const response = await fetch(`/api/sales/${businessId}/sync`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sales: chunk.map((sale) => sale.payload) }),
  });
  const body = await response.json().catch(() => null);
  if (response.status === 401) {
    throw new Error("Your login has expired. Log in again to sync.");
  }
  if (!response.ok) {
    throw new Error(
      body?.message || body?.error || `Sync failed (${response.status})`,
    );
  }

  // The proxy wraps the backend body in { data }.
  const results: SyncResultRow[] = (body?.data ?? body)?.results ?? [];
  const done: string[] = [];
  const rejected = new Map<string, string>();
  results.forEach((row) => {
    if (SYNCED_STATUSES.has(row.status)) done.push(row.client_sale_id);
    else rejected.set(
        row.client_sale_id,
        row.message || row.status || "Not synced",
      );
  });
  return { done, rejected };
};

const doSync = async (businessId: string): Promise<SyncOutcome> => {
  const queued = await getQueuedSales(businessId);
  let synced = 0;
  let failed = 0;
  let lastError: string | undefined;

  // Chunks go one after another, oldest first, so stock is taken in the
  // order the sales happened.
  for (let i = 0; i < queued.length; i += CHUNK_SIZE) {
    const chunk = queued.slice(i, i + CHUNK_SIZE);
    try {
      const { done, rejected } = await syncChunk(businessId, chunk);
      await removeQueuedSales(done);
      synced += done.length;
      if (rejected.size) {
        failed += rejected.size;
        lastError = Array.from(rejected.values())[0];
        await Promise.all(
          chunk
            .filter((sale) => rejected.has(sale.client_sale_id))
            .map((sale) =>
              recordError([sale], rejected.get(sale.client_sale_id)!),
            ),
        );
      }
    } catch (error) {
      // Whole request failed (dropped again, 401, 5xx): keep everything
      // from here on and try again next time.
      lastError = error instanceof Error ? error.message : "Sync failed";
      failed += queued.length - i;
      await recordError(chunk, lastError).catch(() => undefined);
      break;
    }
  }

  return { synced, failed, error: lastError };
};

export const syncOfflineQueue = (businessId: string): Promise<SyncOutcome> => {
  let running = inFlight.get(businessId);
  if (!running) {
    running = doSync(businessId).finally(() => {
      inFlight.delete(businessId);
    });
    inFlight.set(businessId, running);
  }
  return running;
};

/**
 * Drops a sale the server keeps rejecting (e.g. its product was deleted).
 * Only for when the merchant has recorded it another way.
 */
export const discardQueuedSale = (clientSaleId: string) =>
  removeQueuedSales([clientSaleId]);

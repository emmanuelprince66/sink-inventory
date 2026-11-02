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
  /** The rate on the printed receipt. Omitted: the server's current rate. */
  tax_rate?: string;
  description: string;
  products: OfflineSaleProduct[];
}

export interface QueuedOfflineSale {
  client_sale_id: string;
  business_id: string;
  payload: OfflineSalePayload;
  /** What the receipt said, for display only: the server works out its own. */
  total: number;
  created_at: string;
  /** Why the server refused this sale, when it did. */
  last_error?: string;
  /**
   * The server refused this sale itself, so retrying on a timer can't help.
   * Not set when a request merely failed: those sales just keep waiting.
   */
  rejected?: boolean;
  /** For the Offline Sales drawer only; never sent to the server. */
  display?: {
    items: { name: string; quantity: number; line_total: number }[];
    /** Tax on the customer's receipt; the server works out its own. */
    vat_amount?: number;
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
const notifyHere = () => listeners.forEach((listener) => listener());

// Other POS tabs on this device hold their own copy of the queue.
const channel =
  typeof window !== "undefined" && typeof BroadcastChannel !== "undefined"
    ? new BroadcastChannel("pos-offline-sales")
    : null;
if (channel) channel.onmessage = notifyHere;

const notify = () => {
  notifyHere();
  channel?.postMessage("changed");
};

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

const markRejected = async (
  sales: QueuedOfflineSale[],
  reasons: Map<string, string>,
) => {
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    const store = tx.objectStore(STORE);
    sales.forEach((sale) =>
      store.put({
        ...sale,
        rejected: true,
        last_error: reasons.get(sale.client_sale_id),
      }),
    );
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
  notify();
};

/* ---------------------------------------------------- stock during a sync */

/**
 * Sales that just synced, until the fresh inventory has come back.
 *
 * The moment a sale leaves the queue, the stock on screen stops subtracting it,
 * but the inventory it's subtracted from was fetched before the sync, so the
 * number would jump up until the refetch lands. Counting these until then keeps
 * it steady. In memory on purpose: after a reload there's no old inventory left
 * to correct for.
 */
const settling = new Map<string, QueuedOfflineSale[]>();

export const getSettlingSales = (businessId: string): QueuedOfflineSale[] =>
  settling.get(businessId) ?? [];

/** Call once the inventory has been refetched (or that has been given up on). */
export const releaseSettledSales = (businessId: string) => {
  if (settling.delete(businessId)) notify();
};

/* ---------------------------------------------------------------- syncing */

export interface SyncOutcome {
  /** Sales now confirmed on the server, whichever request saved them. */
  synced: number;
  /** Just those the server saved on this request. */
  syncedSales: QueuedOfflineSale[];
  /** It already had these: a sent request's reply never reached us. */
  alreadySynced: number;
  failed: number;
  error?: string;
  /** Another tab on this device was already syncing, so nothing was sent. */
  lostLock?: boolean;
}

export interface SyncIssue {
  message: string;
  /** Only logging in again can fix this one. */
  needsLogin: boolean;
  /** Retrying won't fix it, so a person should be told. */
  needsAttention: boolean;
}

class LoginExpiredError extends Error {}
/** This login isn't allowed to send this business's sales. Not the sales' fault. */
class NoAccessError extends Error {}
/** The server refused the request as a whole, so something in it is bad. */
class RequestRefusedError extends Error {}

// Worth another try as they are: a timeout, or being told to slow down.
const RETRYABLE_STATUSES = new Set([408, 425, 429]);

// A request can hang on a bad connection. If the server did get it, sending the
// sales again is safe: they come back ALREADY_SYNCED.
const REQUEST_TIMEOUT_MS = 60_000;

const syncing = new Set<string>();
const issues = new Map<string, SyncIssue>();

export const isSyncingOffline = (businessId: string) => syncing.has(businessId);

/** Why the last attempt couldn't reach the server, until one succeeds. */
export const getSyncIssue = (businessId: string): SyncIssue | null =>
  issues.get(businessId) ?? null;

// One sync at a time per business: the "online" event, the timer and the
// "Sync now" button can all fire together.
const inFlight = new Map<string, Promise<SyncOutcome>>();

const syncChunk = async (
  businessId: string,
  chunk: QueuedOfflineSale[],
): Promise<{
  saved: string[];
  already: string[];
  rejected: Map<string, string>;
}> => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  let response: Response;
  try {
    response = await fetch(`/api/sales/${businessId}/sync`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sales: chunk.map((sale) => sale.payload) }),
      signal: controller.signal,
    });
  } catch {
    throw new Error("Can't reach the server right now. Trying again soon.");
  } finally {
    clearTimeout(timeout);
  }
  const body = await response.json().catch(() => null);
  if (response.status === 401) {
    throw new LoginExpiredError("Your login has expired. Log in again to sync.");
  }
  if (!response.ok) {
    const message =
      body?.message || body?.error || `Sync failed (${response.status})`;
    if (response.status === 403 || response.status === 404) {
      throw new NoAccessError(
        "This login can't sync sales for this business.",
      );
    }
    if (response.status >= 500 || RETRYABLE_STATUSES.has(response.status)) {
      throw new Error(message);
    }
    throw new RequestRefusedError(message);
  }

  // The proxy wraps the backend body in { data }.
  const results: SyncResultRow[] = (body?.data ?? body)?.results ?? [];
  const saved: string[] = [];
  const already: string[] = [];
  const rejected = new Map<string, string>();
  results.forEach((row) => {
    // A repeat can arrive as status "ALREADY_SYNCED", or as status "SUCCESS"
    // with message "ALREADY_SYNCED". Both mean the server has this sale.
    if (row.status === "ALREADY_SYNCED" || row.message === "ALREADY_SYNCED") {
      already.push(row.client_sale_id);
    } else if (row.status === "SYNCED" || row.status === "SUCCESS") {
      saved.push(row.client_sale_id);
    } else rejected.set(
        row.client_sale_id,
        row.message || row.status || "Not synced",
      );
  });
  return { saved, already, rejected };
};

const doSync = async (
  businessId: string,
  includeRejected: boolean,
): Promise<SyncOutcome> => {
  const queued = (await getQueuedSales(businessId)).filter(
    (sale) => includeRejected || !sale.rejected,
  );
  const syncedSales: QueuedOfflineSale[] = [];
  let alreadySynced = 0;
  let rejectedCount = 0;
  let lastError: string | undefined;

  const reject = async (
    sales: QueuedOfflineSale[],
    reasons: Map<string, string>,
  ) => {
    rejectedCount += sales.length;
    lastError = Array.from(reasons.values())[0];
    await markRejected(sales, reasons);
  };

  const send = async (sales: QueuedOfflineSale[]): Promise<void> => {
    let result;
    try {
      result = await syncChunk(businessId, sales);
    } catch (error) {
      if (!(error instanceof RequestRefusedError)) throw error;
      // One bad sale mustn't hold up the rest: find it by sending them singly.
      if (sales.length === 1) {
        await reject(
          sales,
          new Map([[sales[0].client_sale_id, error.message]]),
        );
        return;
      }
      for (const sale of sales) await send([sale]);
      return;
    }

    issues.delete(businessId);
    const { saved, already, rejected } = result;
    const done = [...saved, ...already];
    settling.set(businessId, [
      ...getSettlingSales(businessId),
      ...sales.filter((sale) => done.includes(sale.client_sale_id)),
    ]);
    await removeQueuedSales(done);
    syncedSales.push(
      ...sales.filter((sale) => saved.includes(sale.client_sale_id)),
    );
    alreadySynced += already.length;
    if (rejected.size) {
      await reject(
        sales.filter((sale) => rejected.has(sale.client_sale_id)),
        rejected,
      );
    }
  };

  // Chunks go one after another, oldest first, so stock is taken in the
  // order the sales happened.
  for (let i = 0; i < queued.length; i += CHUNK_SIZE) {
    try {
      await send(queued.slice(i, i + CHUNK_SIZE));
    } catch (error) {
      // No internet, timeout, expired login, no access, server error. Nothing
      // is wrong with the sales themselves: keep them waiting and try later,
      // without marking any of them as failed.
      lastError = error instanceof Error ? error.message : "Sync failed";
      const needsLogin = error instanceof LoginExpiredError;
      issues.set(businessId, {
        message: lastError,
        needsLogin,
        needsAttention: needsLogin || error instanceof NoAccessError,
      });
      break;
    }
  }

  const synced = syncedSales.length + alreadySynced;
  return {
    synced,
    syncedSales,
    alreadySynced,
    failed: queued.length - synced,
    error: lastError,
  };
};

const LOST_LOCK: SyncOutcome = {
  synced: 0,
  syncedSales: [],
  alreadySynced: 0,
  failed: 0,
  lostLock: true,
};

// A second POS tab would send the same sales. The server would skip them, but
// there's no need for the extra requests. Not available on plain http.
const withTabLock = (
  businessId: string,
  work: () => Promise<SyncOutcome>,
): Promise<SyncOutcome> => {
  const locks = typeof navigator !== "undefined" ? navigator.locks : undefined;
  if (!locks) return work();
  return locks
    .request(
      `pos-offline-sync:${businessId}`,
      { ifAvailable: true },
      async (lock) => (lock ? work() : LOST_LOCK),
    )
    .then((outcome) => outcome);
};

/**
 * Sends waiting sales. Sales the server rejected are left out unless asked
 * for, since only a person pressing Sync can have changed anything for them.
 */
export const syncOfflineQueue = (
  businessId: string,
  { includeRejected = false }: { includeRejected?: boolean } = {},
): Promise<SyncOutcome> => {
  let running = inFlight.get(businessId);
  if (!running) {
    syncing.add(businessId);
    notify();
    running = withTabLock(businessId, () =>
      doSync(businessId, includeRejected),
    ).finally(() => {
      inFlight.delete(businessId);
      syncing.delete(businessId);
      notify();
    });
    inFlight.set(businessId, running);
  }
  return running;
};

/** Every sale on this device, across businesses. */
export const getAllQueuedSales = () =>
  run<QueuedOfflineSale[]>("readonly", (store) => store.getAll());

/** Every waiting sale on this device, across businesses. */
export const countAllQueuedSales = () =>
  run("readonly", (store) => store.count());

/**
 * Drops a sale the server keeps rejecting (e.g. its product was deleted).
 * Only for when the merchant has recorded it another way.
 */
export const discardQueuedSale = (clientSaleId: string) =>
  removeQueuedSales([clientSaleId]);

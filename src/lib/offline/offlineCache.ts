/**
 * A copy of the business's products and customers on this device, so search
 * and barcode lookups keep working without a server. See offlineCacheRefresh.ts
 * for how it's filled.
 *
 * Deliberately its own database rather than a new store in "sync360-pos", where
 * unsynced sales live. Adding a store there means bumping the version, and an
 * upgrade waits for every open connection to close. Tabs already open on the
 * current build hold one and don't close it, so the upgrade could hang and
 * block taking sales. Kept apart, the sales queue is never touched, and this
 * database can be cleared or evicted without any risk to money.
 */

export type OfflineCacheKind = "products" | "customers";

interface CacheRow {
  business_id: string;
  id: string;
  data: any;
}

const DB_NAME = "sync360-pos-cache";
const STORES: OfflineCacheKind[] = ["products", "customers"];

let dbPromise: Promise<IDBDatabase> | null = null;

const openDb = (): Promise<IDBDatabase> => {
  if (typeof indexedDB === "undefined") {
    return Promise.reject(new Error("Offline storage is not available"));
  }
  if (!dbPromise) {
    dbPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, 1);
      request.onupgradeneeded = () => {
        STORES.forEach((store) => {
          if (!request.result.objectStoreNames.contains(store)) {
            request.result.createObjectStore(store, {
              keyPath: ["business_id", "id"],
            });
          }
        });
      };
      request.onsuccess = () => {
        const db = request.result;
        // Never hold up a future upgrade from another tab.
        db.onversionchange = () => {
          db.close();
          dbPromise = null;
        };
        db.onclose = () => {
          dbPromise = null;
        };
        resolve(db);
      };
      request.onerror = () => {
        dbPromise = null;
        reject(request.error);
      };
    });
  }
  return dbPromise;
};

/** Every row for one business: arrays sort after strings in IndexedDB keys. */
const rangeFor = (businessId: string) =>
  IDBKeyRange.bound([businessId], [businessId, []]);

const toRows = (businessId: string, items: any[]): CacheRow[] =>
  items
    .filter((item) => item?.id != null)
    .map((item) => ({ business_id: businessId, id: String(item.id), data: item }));

const write = async (
  kind: OfflineCacheKind,
  action: (store: IDBObjectStore) => void,
) => {
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(kind, "readwrite");
    action(tx.objectStore(kind));
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error);
  });
};

/* ---------------------------------------------------------- change notices */

const listeners = new Set<() => void>();
const notify = () => listeners.forEach((listener) => listener());
export const subscribeOfflineCache = (listener: () => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

/* ---------------------------------------------------------- reading/writing */

/** Swaps the whole list in one transaction: a failure keeps the old one. */
export const replaceCached = async (
  kind: OfflineCacheKind,
  businessId: string,
  items: any[],
) => {
  await write(kind, (store) => {
    store.delete(rangeFor(businessId));
    toRows(businessId, items).forEach((row) => store.put(row));
  });
  notify();
};

/** Updates just these rows, e.g. a page of inventory fetched for the grid. */
export const mergeCached = async (
  kind: OfflineCacheKind,
  businessId: string,
  items: any[],
) => {
  if (!items.length) return;
  await write(kind, (store) => {
    toRows(businessId, items).forEach((row) => store.put(row));
  });
};

type SoldSale = {
  payload: { products: { id: string; type?: string; quantity: number }[] };
};

/** Units sold per product id. Combos and services hold no stock count. */
export const soldUnits = (sales: SoldSale[]): Record<string, number> => {
  const sold: Record<string, number> = {};
  sales.forEach((sale) =>
    sale.payload.products.forEach((line) => {
      const type = String(line.type ?? "").toUpperCase();
      if (type === "COMBO" || type === "SERVICE") return;
      const id = String(line.id);
      sold[id] = (sold[id] ?? 0) + (Number(line.quantity) || 0);
    }),
  );
  return sold;
};

const stockCorrectedAt = new Map<string, number>();

/** Inventory fetched before this is older than the saved list's stock. */
export const getStockCorrectedAt = (businessId: string) =>
  stockCorrectedAt.get(businessId) ?? 0;

/**
 * Takes synced sales off the saved stock, so it stays right between downloads
 * of the full list. Lines are by product id, which for a variation is the
 * variation's own id. Combos and services hold no stock count.
 */
export const deductCachedStock = async (
  businessId: string,
  sales: SoldSale[],
) => {
  const sold = soldUnits(sales);
  if (!Object.keys(sold).length) return;
  stockCorrectedAt.set(businessId, Date.now());

  const less = (item: any) => {
    const quantity = Number(item?.quantity);
    const units = sold[String(item?.id)];
    if (!units || !Number.isFinite(quantity)) return item;
    return { ...item, quantity: Math.round((quantity - units) * 1000) / 1000 };
  };

  await write("products", (store) => {
    const request = store.openCursor(rangeFor(businessId));
    request.onsuccess = () => {
      const cursor = request.result;
      if (!cursor) return;
      const row = cursor.value as CacheRow;
      const data = row.data?.variations?.length
        ? { ...row.data, variations: row.data.variations.map(less) }
        : less(row.data);
      cursor.update({ ...row, data });
      cursor.continue();
    };
  });
  notify();
};

export const readCached = async <T = any>(
  kind: OfflineCacheKind,
  businessId: string,
): Promise<T[]> => {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const request = db
      .transaction(kind, "readonly")
      .objectStore(kind)
      .getAll(rangeFor(businessId));
    request.onsuccess = () =>
      resolve((request.result as CacheRow[]).map((row) => row.data));
    request.onerror = () => reject(request.error);
  });
};

// Stops a refresh that was already running from writing after a sign-out.
let generation = 0;
export const getCacheGeneration = () => generation;

/**
 * Customer names and phone numbers belong to the session, not the browser, so
 * this goes on sign-out. Sales waiting to sync are in the other database.
 */
export const clearOfflineCache = async () => {
  generation += 1;
  await Promise.all(STORES.map((kind) => write(kind, (store) => store.clear())));
  notify();
};

/* ------------------------------------------------------------------ search */

const textOf = (values: unknown[]) =>
  values
    .filter((value) => value != null && value !== "")
    .map(String)
    .join(" ")
    .toLowerCase();

/** All words must appear; the name, SKU or barcode of the product or a variation. */
const matchesWords = (text: string, term: string) =>
  term
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .every((word) => text.includes(word));

export interface SearchableProduct {
  product: any;
  text: string;
}

export const toSearchableProducts = (products: any[]): SearchableProduct[] =>
  products.map((product) => ({
    product,
    text: textOf([
      product.name,
      product.sku,
      product.barcode,
      ...(product.variations ?? []).flatMap((variation: any) => [
        variation.name,
        variation.sku,
        variation.barcode,
      ]),
    ]),
  }));

export const searchProducts = (
  searchable: SearchableProduct[],
  term: string,
): any[] =>
  searchable
    .filter(({ text }) => matchesWords(text, term))
    .map(({ product }) => product);

export const searchCustomers = (customers: any[], term: string): any[] =>
  customers.filter((customer) =>
    matchesWords(
      textOf([
        customer.name,
        customer.phone,
        customer.email,
        customer.loyalty_code,
      ]),
      term,
    ),
  );

/** Same clean-up the online scan applies; spreadsheets add ".0" to barcodes. */
const normalizeCode = (code: unknown): string => {
  if (code == null || code === "") return "";
  return String(code).trim().replace(/\.0+$/, "").toLowerCase();
};

const hasCode = (item: any, code: string) =>
  [item.barcode, item.sku, item.id].some(
    (value) => normalizeCode(value) === code,
  );

/** An exact scan. A code on a variation also says which variation it was. */
export const findProductByCode = (
  products: any[],
  scanned: string,
): { product: any; variation?: any } | null => {
  const code = normalizeCode(scanned);
  if (!code) return null;

  const product = products.find((candidate) => hasCode(candidate, code));
  if (product) return { product };

  for (const candidate of products) {
    const variation = (candidate.variations ?? []).find((option: any) =>
      hasCode(option, code),
    );
    if (variation) return { product: candidate, variation };
  }
  return null;
};

export const findCustomerByLoyaltyCode = (customers: any[], scanned: string) => {
  const code = scanned.trim().toUpperCase();
  return (
    customers.find(
      (customer) => (customer.loyalty_code || "").toUpperCase() === code,
    ) ?? null
  );
};

/** One page in the same shape the grid and drawer read from the API. */
export const paginate = <T>(items: T[], page: number, limit: number) => {
  const pages = Math.max(1, Math.ceil(items.length / limit));
  const current = Math.min(Math.max(page, 1), pages);
  return {
    rows: items.slice((current - 1) * limit, current * limit),
    pages,
  };
};
